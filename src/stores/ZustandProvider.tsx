'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from './appStore';
import { logger } from '@/utils/logger';
import { getDemoConfig, createDemoSubscriptionPlan, createDemoAvatars, createDemoRoles } from '@/utils/demoConfig';

interface ZustandProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that initializes Zustand store with auth state
 * Handles Supabase auth listener and demo mode initialization
 */
export function ZustandProvider({ children }: ZustandProviderProps) {
  const initialized = useRef(false);
  const supabase = createClient();
  
  // Get store actions
  const {
    setUser,
    setUserProfile,
    setRoles,
    setOrg,
    setAvatars,
    setLoading,
    initializeDemo,
    markHydrated,
  } = useAppStore();

  // Initialize auth state
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initializeAuth = async () => {
      try {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          
          // Load user profile
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profile) {
            setUserProfile(profile);
            
            // Load roles
            const { data: userPolicies } = await supabase
              .from('user_policies')
              .select('policy_id, permission_policies(id, policy_name, description)')
              .eq('user_id', session.user.id);
              
            if (userPolicies) {
              const roles = userPolicies.map(up => ({
                id: up.permission_policies.id,
                name: up.permission_policies.policy_name,
                description: up.permission_policies.description || undefined,
              }));
              setRoles(roles);
            }
            
            // Load org info
            if (profile.org_id) {
              const { data: org } = await supabase
                .from('organizations')
                .select('id, name, subscription_plan_id')
                .eq('id', profile.org_id)
                .single();
                
              if (org) {
                let subscriptionPlan = null;
                if (org.subscription_plan_id) {
                  const { data: plan } = await supabase
                    .from('subscription_plans')
                    .select('*')
                    .eq('id', org.subscription_plan_id)
                    .single();
                  subscriptionPlan = plan;
                }
                
                setOrg({
                  id: org.id,
                  name: org.name,
                  subscriptionPlan,
                });
              }
            }
            
            // Load avatars
            const { data: avatars } = await supabase
              .from('avatars')
              .select('*')
              .eq('user_id', session.user.id)
              .order('created_at', { ascending: true });
              
            if (avatars) {
              setAvatars(avatars);
            }
          }
        } else {
          // No session - check if we should load demo mode
          const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
          const publicDemoPaths = ['/', '/games'];
          const shouldLoadDemo = publicDemoPaths.some(path => 
            currentPath === path || (path === '/games' && currentPath.startsWith('/games/'))
          );
          
          if (shouldLoadDemo) {
            // Initialize demo mode
            const demoScenario = (process.env.NEXT_PUBLIC_DEMO_SCENARIO as 'personal' | 'professional' | 'enterprise') || 'personal';
            await initializeDemo(demoScenario);
            
            // Set up demo data
            const demoConfig = getDemoConfig();
            const demoUser = {
              id: demoConfig.id,
              email: demoConfig.email,
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              created_at: new Date().toISOString(),
            };
            
            setUser(demoUser as any);
            setUserProfile({
              id: demoConfig.id,
              email: demoConfig.email,
              first_name: demoConfig.name?.split(' ')[0] || null,
              last_name: demoConfig.name?.split(' ').slice(1).join(' ') || null,
              org_id: `${demoConfig.id}-org`,
              account_type: 'demo',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              last_login: new Date().toISOString(),
              phone: null,
              timezone: null,
              locale: 'en',
            } as any);
            
            // Set demo org
            const subscriptionPlan = createDemoSubscriptionPlan(demoConfig);
            setOrg({
              id: `${demoConfig.id}-org`,
              name: demoConfig.orgName,
              subscriptionPlan,
            });
            
            // Set demo roles
            const demoRoles = createDemoRoles(demoConfig);
            setRoles(demoRoles);
            
            // Set demo avatars
            const demoAvatars = createDemoAvatars(demoConfig);
            setAvatars(demoAvatars);
          }
        }
      } catch (error) {
        logger.error('Error initializing auth:', error);
      } finally {
        setLoading('user', false);
        setLoading('roles', false);
        setLoading('avatars', false);
        
        // Mark as hydrated after a short delay to ensure localStorage is loaded
        setTimeout(() => {
          markHydrated();
        }, 100);
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info('Auth state change:', event);
        
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          // Reload all user data
          initializeAuth();
        } else if (event === 'SIGNED_OUT') {
          // Store will handle cleanup in signOut action
          useAppStore.getState().signOut();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, setUser, setUserProfile, setRoles, setOrg, setAvatars, setLoading, initializeDemo, markHydrated]);

  return <>{children}</>;
} 