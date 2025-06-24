'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { logger } from '@/utils/logger';


import { 
  getDemoConfig, 
  createDemoSubscriptionPlan, 
  createDemoAvatars, 
  createDemoRoles 
} from '@/utils/demoConfig';
import { useDemo } from './DemoContext';

// Types
type Avatar = Database['public']['Tables']['avatars']['Row'];
type UserProfile = Database['public']['Tables']['users']['Row'];

/**
 * Extended user context type for roles and subscription tier
 */
interface Role {
  id: string;
  name: string;
  description?: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  tier: string;
  avatar_limit: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  features_included: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface OrgInfo {
  id: string;
  name: string;
  subscriptionPlan: SubscriptionPlan | null;
}

/**
 * Consolidated loading state for better UX - using primitives for stability
 */
interface LoadingState {
  user: boolean;
  roles: boolean;
  avatars: boolean;
  // Helper to check if everything is ready for role-based rendering
  isReady: boolean;
}

/**
 * Extended user context type for roles and subscription tier, with View As support
 */
interface ExtendedUserContextType extends UserContextType {
  roles: Role[];
  org: OrgInfo | null;
  hasRole: (roleName: string) => boolean;
  canAccess: (feature: string) => boolean;
  getTierLimit: (feature: string) => number | undefined;
  // View As state and methods
  viewAsRole: string | null;
  viewAsAvatar: Avatar | null;
  isViewAs: boolean;
  setViewAsRole: (role: string | null) => void;
  setViewAsAvatar: (avatar: Avatar | null) => void;
  resetViewAs: () => void;
  // Enhanced loading state
  loadingState: LoadingState;
}

interface UserContextType {
  user: User | null;
  userProfile: UserProfile | null;
  avatars: Avatar[];
  currentAvatar: Avatar | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setCurrentAvatar: (avatar: Avatar | null) => void;
  createAvatar: (name: string) => Promise<Avatar | null>;
  refreshAvatars: () => Promise<void>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<ExtendedUserContextType | undefined>(undefined);

/**
 * User provider that manages authentication state and avatar context
 * Integrates with Supabase for persistent user and avatar management
 * 
 * Enhanced with:
 * - Stable loading states to prevent infinite re-renders
 * - Proper demo mode support
 * - Elimination of circular dependencies
 */
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [currentAvatar, setCurrentAvatar] = useState<Avatar | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [org, setOrg] = useState<OrgInfo | null>(null);
  
  // View As state
  const [viewAsRole, setViewAsRole] = useState<string | null>(null);
  const [viewAsAvatar, setViewAsAvatar] = useState<Avatar | null>(null);

  // Use individual boolean states instead of object to prevent re-render loops
  const [userLoading, setUserLoading] = useState<boolean>(true);
  const [rolesLoading, setRolesLoading] = useState<boolean>(true);
  const [avatarsLoading, setAvatarsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Always call useDemo hook at top level to avoid conditional hook calls
  let demoContext: ReturnType<typeof useDemo> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    demoContext = useDemo();
  } catch {
    // Not in demo mode or provider not available - this is fine
    demoContext = null;
  }

  // Create stable loading state object using individual primitives
  const loadingState = useMemo<LoadingState>(() => ({
    user: userLoading,
    roles: rolesLoading,
    avatars: avatarsLoading,
    isReady: isInitialized && !userLoading && !rolesLoading
  }), [userLoading, rolesLoading, avatarsLoading, isInitialized]);

  const supabase = createClient();
  
  // Use ref to track initialization to prevent multiple calls
  const initializationRef = useRef<boolean>(false);

  // Load user profile from database
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      logger.debug('🔍 Loading user profile for ID:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      logger.debug('📊 User profile query result:', { data, error });
      
      if (error) throw error;
      setUserProfile(data);
      logger.debug('✅ User profile loaded successfully');
    } catch (err) {
      logger.error('❌ Error loading user profile:', err);
      throw err; // Re-throw to trigger fallback in loadDemoUser
    }
  }, [supabase]);

  // Load avatars for the current user
  const loadAvatars = useCallback(async (userId: string) => {
    try {
      console.log('UserContext: Loading avatars for user:', userId);
      setAvatarsLoading(true);
      const { data, error } = await supabase
        .from('avatars')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      console.log('UserContext: Avatars loaded successfully:', data?.length || 0);
      setAvatars(data || []);
      
      // Set first avatar as current if none selected and we have avatars
      if (data && data.length > 0) {
        setCurrentAvatar(prev => prev || data[0]);
      }
    } catch (err) {
      logger.error('Error loading avatars:', err);
      console.log('UserContext: Avatar loading failed:', err);
      setError('Failed to load avatars');
      setAvatars([]);
    } finally {
      console.log('UserContext: Avatar loading completed');
      setAvatarsLoading(false);
    }
  }, [supabase]);

  // Fetch roles and org info
  const fetchRolesAndOrg = useCallback(async (userId: string) => {
    try {
      setRolesLoading(true);
      
      // Fetch user profile from public.users
      const { data: userProfileData, error: userProfileError } = await supabase
        .from('users')
        .select('id, org_id')
        .eq('id', userId)
        .single();
      if (userProfileError) throw userProfileError;
      const orgId = userProfileData?.org_id;
      
      // Fetch org info and subscription plan
      let orgInfo: OrgInfo | null = null;
      if (orgId) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id, name, subscription_plan_id')
          .eq('id', orgId)
          .single();
        if (orgError) throw orgError;
        
        let subscriptionPlan: SubscriptionPlan | null = null;
        if (orgData?.subscription_plan_id) {
          const { data: planData, error: planError } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', orgData.subscription_plan_id)
            .single();
          if (planError) throw planError;
          subscriptionPlan = planData;
        }
        
        orgInfo = {
          id: orgData.id,
          name: orgData.name,
          subscriptionPlan,
        };
      }
      setOrg(orgInfo);
      
      // Fetch user roles from user_policies -> permission_policies
      const { data: userPolicies, error: userPoliciesError } = await supabase
        .from('user_policies')
        .select('policy_id, permission_policies(id, policy_name, description)')
        .eq('user_id', userId);
      if (userPoliciesError) throw userPoliciesError;
      
      const userRoles: Role[] = (userPolicies || []).map((up: { permission_policies: { id: string; policy_name: string; description: string | null } }) => ({
        id: up.permission_policies.id,
        name: up.permission_policies.policy_name,
        description: up.permission_policies.description || undefined,
      }));
      setRoles(userRoles);
      
    } catch (err) {
      logger.error('Error fetching roles/org info:', err);
      setOrg(null);
      setRoles([]);
      setError('Failed to load organization or roles.');
    } finally {
      setRolesLoading(false);
    }
  }, [supabase]);

  // Enhanced demo user/org/roles fallback
  const loadDemoUserContext = useCallback(async () => {
    // Get demo configuration from DemoContext if available, otherwise fallback
    const demoConfig = demoContext?.currentConfig || getDemoConfig();
    console.log('Demo configuration loaded:', demoConfig);
    
    try {
      setUserLoading(true);
      setRolesLoading(true);
      setAvatarsLoading(true);
      
      // Try to load demo user/org/roles from DB, fallback to hardcoded
      try {
        // Try to find a demo user in the users table
        const { data: demoUsers } = await supabase
          .from('users')
          .select('*')
          .ilike('email', '%demo%');
        const demoUser = demoUsers && demoUsers.length > 0 ? demoUsers[0] : null;
        
        // Try to find a demo org
        let demoOrg = null;
        let demoPlan = null;
        if (demoUser && demoUser.org_id) {
          const { data: orgData } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', demoUser.org_id)
            .single();
          demoOrg = orgData;
          if (orgData && orgData.subscription_plan_id) {
            const { data: planData } = await supabase
              .from('subscription_plans')
              .select('*')
              .eq('id', orgData.subscription_plan_id)
              .single();
            demoPlan = planData;
          }
        }
        
        // Try to find demo roles
        let demoRoles: Role[] = [];
        if (demoUser) {
          const { data: userPolicies } = await supabase
            .from('user_policies')
            .select('policy_id, permission_policies(id, policy_name, description)')
            .eq('user_id', demoUser.id);
          demoRoles = (userPolicies || []).map((up: { permission_policies: { id: string; policy_name: string; description: string | null } }) => ({
            id: up.permission_policies.id,
            name: up.permission_policies.policy_name,
            description: up.permission_policies.description || undefined,
          }));
        }
        
        // Set context state from database
        if (demoUser) {
          // Convert database user to Supabase User format
          const supabaseUser = {
            ...demoUser,
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated'
          } as User;
          setUser(supabaseUser);
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
            locale: 'en'
          } as UserProfile);
          
          // Always ensure demo org with subscription plan exists
          const ensuredDemoOrg = demoOrg && demoPlan ? 
            { id: demoOrg.id, name: demoOrg.name, subscriptionPlan: demoPlan } :
            (() => {
              // Use configurable demo organization for database users too
              const demoConfig = getDemoConfig();
              const subscriptionPlan = createDemoSubscriptionPlan(demoConfig);
              return {
                id: `${demoUser.id}-org`, 
                name: demoConfig.orgName, 
                subscriptionPlan 
              };
            })();
          
          console.log('Demo org being set for database user:', ensuredDemoOrg);
          setOrg(ensuredDemoOrg);
          setRoles(demoRoles.length > 0 ? demoRoles : [
            { id: '1', name: 'account_owner', description: 'Full administrative access' },
            { id: '2', name: 'org_admin', description: 'Organization management' }
          ]);
          // Load demo avatars
          await loadAvatars(demoUser.id);
          return;
        }
      } catch (dbError) {
        logger.warn('Database demo user not found, using hardcoded fallback:', dbError);
        console.log('Demo mode fallback triggered:', dbError);
      }
      
      // Fallback to configurable demo context
      console.log('UserContext: Creating demo user from configuration');
      
      // Create demo user
      const demoUser = { 
        id: demoConfig.id, 
        email: demoConfig.email, 
        name: demoConfig.name,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      } as User;
      setUser(demoUser);
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
        locale: 'en'
      } as UserProfile);
      
      // Create demo organization with appropriate subscription plan
      const subscriptionPlan = createDemoSubscriptionPlan(demoConfig);
      const demoOrg = { 
        id: `${demoConfig.id}-org`, 
        name: demoConfig.orgName, 
        subscriptionPlan 
      };
      
      logger.info(`Setting demo org for ${demoConfig.tier} tier:`, demoOrg);
      setOrg(demoOrg);
      console.log('Demo org set:', demoOrg);
      
      // Create demo roles based on configuration
      const demoRoles = createDemoRoles(demoConfig);
      setRoles(demoRoles);
      console.log('Demo roles set:', demoRoles);
      
      // Create demo avatars based on configuration
      const demoAvatars = createDemoAvatars(demoConfig);
      setAvatars(demoAvatars);
      if (demoAvatars.length > 0) {
        setCurrentAvatar(demoAvatars[0]);
      }
      console.log(`Demo avatars created: ${demoAvatars.length}`);
      
    } catch (err) {
      logger.error('Error in demo user context:', err);
      setError('Failed to initialize demo mode');
    } finally {
      // Complete all loading states for demo mode
      console.log('Demo mode initialization complete, updating loading states');
      setUserLoading(false);
      setRolesLoading(false);
      setAvatarsLoading(false);
      setIsInitialized(true);
    }
  }, [supabase, loadAvatars, demoContext]);

  // Check if we're on a protected route (for redirect logic)
  const isProtectedRoute = useCallback((pathname?: string): boolean => {
    const path = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
    const protectedPaths = [
      '/dashboard',
      '/settings',
      '/collections',
      '/plans',
      '/user-management'
    ];
    return protectedPaths.some(protectedPath => path.startsWith(protectedPath));
  }, []);

  // Check if we're on a public route that should show demo mode
  const isPublicDemoRoute = useCallback((pathname?: string): boolean => {
    const path = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
    const publicDemoPaths = [
      '/', // Home page
      '/games' // Game pages for demonstration
    ];
    return publicDemoPaths.some(publicPath => 
      path === publicPath || (publicPath === '/games' && path.startsWith('/games/'))
    );
  }, []);

  // Handle redirect logic for unauthenticated users
  const handleUnauthenticatedAccess = useCallback(() => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    
    if (isProtectedRoute(currentPath)) {
      // Redirect to login with return URL for protected routes
      const returnUrl = encodeURIComponent(currentPath + (typeof window !== 'undefined' ? window.location.search : ''));
      const loginUrl = `/login?redirectTo=${returnUrl}`;
      
      logger.info('Redirecting unauthenticated user to login', { 
        from: currentPath, 
        to: loginUrl 
      });
      
      if (typeof window !== 'undefined') {
        window.location.href = loginUrl;
      }
      return;
    }

    if (isPublicDemoRoute(currentPath)) {
      // Load demo mode for public pages
      logger.info('Loading demo mode for public route', { path: currentPath });
      loadDemoUserContext();
    } else {
      // For other routes, just set loading to false without demo mode
      setUserLoading(false);
      setRolesLoading(false);
      setAvatarsLoading(false);
      setIsInitialized(true);
    }
  }, [isProtectedRoute, isPublicDemoRoute, loadDemoUserContext]);

  // Main initialization effect - runs only once
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    const loadUser = async () => {
      try {
        setUserLoading(true);
        setError(null);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Real user authentication
          logger.info('Authenticated user session found', { userId: session.user.id });
          setUser(session.user);
          setUserLoading(false);
          
          try {
            await loadUserProfile(session.user.id);
            
            // Load roles and avatars in parallel
            await Promise.all([
              fetchRolesAndOrg(session.user.id),
              loadAvatars(session.user.id)
            ]);
            setIsInitialized(true);
            logger.info('User context loaded successfully');
          } catch (profileError) {
            logger.error('Error loading user profile or data:', profileError);
            // Handle new user case - profile might not exist yet
            if (profileError && typeof profileError === 'object' && 'code' in profileError && profileError.code === 'PGRST116') {
              logger.info('New user detected, creating profile...');
              // For new users, we'll let the registration hook handle profile creation
              setError('User profile not found. Please complete registration.');
            } else {
              setError('Failed to load user data. Please try signing in again.');
            }
            setIsInitialized(true);
          }
        } else {
          // No session - handle based on route type
          logger.info('No user session found');
          handleUnauthenticatedAccess();
        }
      } catch (err) {
        logger.error('Error during user initialization:', err);
        setError('Failed to initialize user session.');
        handleUnauthenticatedAccess();
      }
    };
    
    loadUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info('Auth state changed', { event, hasSession: !!session });
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setUserLoading(false);
        
        try {
          await loadUserProfile(session.user.id);
          
          // Load roles and avatars in parallel
          await Promise.all([
            fetchRolesAndOrg(session.user.id),
            loadAvatars(session.user.id)
          ]);
          setIsInitialized(true);
          logger.info('User signed in and context loaded');
        } catch (profileError) {
          logger.error('Error loading profile after sign in:', profileError);
          setError('Failed to load user data after sign in.');
          setIsInitialized(true);
        }
      } else if (event === 'SIGNED_OUT') {
        logger.info('User signed out, clearing context');
        setUser(null);
        setUserProfile(null);
        setAvatars([]);
        setCurrentAvatar(null);
        setRoles([]);
        setOrg(null);
        setError(null);
        
        // Reset view as state
        setViewAsRole(null);
        setViewAsAvatar(null);
        
        // Handle post-logout routing
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
        if (isProtectedRoute(currentPath)) {
          // Redirect to home page after logout from protected routes
          logger.info('Redirecting to home after logout from protected route');
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        } else {
          // Handle demo mode for public routes after logout
          handleUnauthenticatedAccess();
        }
      } else if (event === 'TOKEN_REFRESHED') {
        logger.info('Auth token refreshed');
      } else if (event === 'USER_UPDATED') {
        logger.info('User updated, refreshing profile');
        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, loadUserProfile, fetchRolesAndOrg, loadAvatars, handleUnauthenticatedAccess, isProtectedRoute]);

  // Listen for demo scenario changes from DemoContext
  useEffect(() => {
    if (!demoContext) return;

    const handleDemoScenarioChange = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { config: newConfig } = customEvent.detail;
      
      try {
        logger.info('Demo scenario changed, updating user context:', newConfig);
        
        // Update demo user context with new configuration
        const demoUser = { 
          id: newConfig.id, 
          email: newConfig.email, 
          name: newConfig.name,
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        } as User;
        setUser(demoUser);
        
        setUserProfile({
          id: newConfig.id,
          email: newConfig.email,
          first_name: newConfig.name?.split(' ')[0] || null,
          last_name: newConfig.name?.split(' ').slice(1).join(' ') || null,
          org_id: `${newConfig.id}-org`,
          account_type: 'demo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          phone: null,
          timezone: null,
          locale: 'en'
        } as UserProfile);
        
        // Create demo organization with new subscription plan
        const subscriptionPlan = createDemoSubscriptionPlan(newConfig);
        const demoOrg = { 
          id: `${newConfig.id}-org`, 
          name: newConfig.orgName, 
          subscriptionPlan 
        };
        setOrg(demoOrg);
        
        // Create demo roles
        const demoRoles = createDemoRoles(newConfig);
        setRoles(demoRoles);
        
        // Create demo avatars
        const demoAvatars = createDemoAvatars(newConfig);
        setAvatars(demoAvatars);
        if (demoAvatars.length > 0) {
          setCurrentAvatar(demoAvatars[0]);
        }
        
        logger.info('Demo user context updated successfully for new scenario');
        
      } catch (err) {
        logger.error('Failed to update user context for new demo scenario:', err);
        setError('Failed to switch demo scenario');
      }
    };

    // Add event listener for demo scenario changes
    if (typeof window !== 'undefined') {
      window.addEventListener('demoScenarioChanged', handleDemoScenarioChange);
      
      return () => {
        window.removeEventListener('demoScenarioChanged', handleDemoScenarioChange);
      };
    }
  }, [demoContext]);

  // Utility functions
  const hasRole = useCallback((roleName: string) => {
    // Only return true if we're ready and actually have the role
    // For authenticated users, require actual roles. For demo mode, allow role checking.
    if (!loadingState.isReady) return false;
    
    // If we have a real user, require actual roles
    if (user && userProfile?.account_type !== 'demo') {
      return roles.some(r => r.name === roleName);
    }
    
    // For demo mode or no user, allow role checking for public demo routes
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    if (isPublicDemoRoute(currentPath)) {
      return roles.some(r => r.name === roleName);
    }
    
    // For protected routes without authentication, deny access
    return false;
  }, [roles, loadingState.isReady, user, userProfile, isPublicDemoRoute]);
  
  const canAccess = useCallback((feature: string) => {
    // Only return true if we're ready and have access
    if (!loadingState.isReady) return false;
    
    // For real authenticated users, check actual subscription
    if (user && userProfile?.account_type !== 'demo') {
      if (!org?.subscriptionPlan) return false;
      const features = org.subscriptionPlan.features_included || {};
      return features[feature] === true;
    }
    
    // For demo mode on public routes, allow feature access
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    if (isPublicDemoRoute(currentPath) && org?.subscriptionPlan) {
      const features = org.subscriptionPlan.features_included || {};
      return features[feature] === true;
    }
    
    // For protected routes without authentication, deny access
    return false;
  }, [org, loadingState.isReady, user, userProfile, isPublicDemoRoute]);
  
  const getTierLimit = useCallback((feature: string) => {
    // For authenticated users, return actual limits
    if (user && userProfile?.account_type !== 'demo') {
      return org?.subscriptionPlan?.[`${feature}_limit`];
    }
    
    // For demo mode on public routes, return demo limits
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    if (isPublicDemoRoute(currentPath)) {
      return org?.subscriptionPlan?.[`${feature}_limit`];
    }
    
    // For protected routes without authentication, return no limits
    return undefined;
  }, [org, user, userProfile, isPublicDemoRoute]);

  // Create a new avatar with subscription limit checking
  const createAvatar = async (name: string): Promise<Avatar | null> => {
    if (!user) {
      setError('Must be logged in to create avatar');
      return null;
    }

    // Check subscription limits before creating avatar
    const currentAvatarsCount = avatars.length;
    if (org?.subscriptionPlan) {
      const avatarLimit = org.subscriptionPlan.avatar_limit || 5;
      if (currentAvatarsCount >= avatarLimit) {
        const tierName = org.subscriptionPlan.tier || 'current plan';
        setError(`Avatar limit reached (${currentAvatarsCount}/${avatarLimit}). Upgrade your ${tierName} to create more avatars.`);
        return null;
      }
    }

    try {
      setError(null);
      const { data, error } = await supabase
        .from('avatars')
        .insert({
          user_id: user.id,
          org_id: org?.id || null,
          name: name.trim(),
          theme_settings: {},
          game_preferences: {}
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refresh avatars list
      await loadAvatars(user.id);
      
      logger.info('Avatar created successfully:', {
        avatarId: data.id,
        avatarName: data.name,
        currentCount: currentAvatarsCount + 1,
        tier: org?.subscriptionPlan?.tier
      });
      
      return data;
    } catch (err) {
      logger.error('Error creating avatar:', err);
      setError(err instanceof Error ? err.message : 'Failed to create avatar');
      return null;
    }
  };

  // Refresh avatars from database
  const refreshAvatars = async () => {
    if (user) {
      await loadAvatars(user.id);
    }
  };

  // Sign out the current user
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      logger.error('Error signing out:', err);
      setError('Failed to sign out');
    }
  };

  // View As functionality
  const isViewAs = viewAsRole !== null || viewAsAvatar !== null;
  const resetViewAs = () => {
    setViewAsRole(null);
    setViewAsAvatar(null);
  };

  const contextValue: ExtendedUserContextType = {
    user,
    userProfile,
    avatars,
    currentAvatar,
    loading: !loadingState.isReady, // Simplified loading state for backward compatibility
    error,
    setCurrentAvatar,
    createAvatar,
    refreshAvatars,
    signOut,
    roles,
    org,
    hasRole,
    canAccess,
    getTierLimit,
    viewAsRole,
    viewAsAvatar,
    isViewAs,
    setViewAsRole,
    setViewAsAvatar,
    resetViewAs,
    loadingState, // New: detailed loading state
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): ExtendedUserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export function useAvatar() {
  const { currentAvatar, setCurrentAvatar, avatars, createAvatar } = useUser();
  
  const switchAvatar = useCallback((avatarId: string) => {
    const avatar = avatars.find(a => a.id === avatarId);
    if (avatar) {
      setCurrentAvatar(avatar);
    }
  }, [avatars, setCurrentAvatar]);

  return {
    currentAvatar,
    setCurrentAvatar,
    avatars,
    switchAvatar,
    createAvatar
  };
}

export function useRoleGuard() {
  const { hasRole, canAccess, roles, loadingState } = useUser();
  
  // Backward compatible hasRole function 
  const guardedHasRole = useCallback((roleName: string) => {
    return loadingState.isReady && hasRole(roleName);
  }, [hasRole, loadingState.isReady]);
  
  const requireRole = useCallback((requiredRole: string) => {
    if (!loadingState.isReady) return { allowed: false, reason: 'Loading...' };
    const allowed = hasRole(requiredRole);
    return {
      allowed,
      reason: allowed ? undefined : `Requires ${requiredRole} role`
    };
  }, [hasRole, loadingState.isReady]);
  
  const requireFeature = useCallback((feature: string) => {
    if (!loadingState.isReady) return { allowed: false, reason: 'Loading...' };
    const allowed = canAccess(feature);
    return {
      allowed,
      reason: allowed ? undefined : `Feature ${feature} not available in current plan`
    };
  }, [canAccess, loadingState.isReady]);

  return {
    // Backward compatible interface
    hasRole: guardedHasRole,
    isReady: loadingState.isReady,
    roles: loadingState.isReady ? roles : [],
    
    // New enhanced interface
    requireRole,
    requireFeature
  };
} 