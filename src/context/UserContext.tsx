'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { logger } from '@/utils/logger';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';

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
  features_included: any;
  [key: string]: any;
}

interface OrgInfo {
  id: string;
  name: string;
  subscriptionPlan: SubscriptionPlan | null;
}

/**
 * Consolidated loading state for better UX
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

const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * User provider that manages authentication state and avatar context
 * Integrates with Supabase for persistent user and avatar management
 * 
 * Enhanced with:
 * - Consolidated loading states
 * - Proper demo mode support
 * - Elimination of flashing UI elements
 */
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [currentAvatar, setCurrentAvatar] = useState<Avatar | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [org, setOrg] = useState<OrgInfo | null>(null);
  const router = useRouter();
  const [demoMode, setDemoMode] = useState<boolean>(false);
  
  // View As state
  const [viewAsRole, setViewAsRole] = useState<string | null>(null);
  const [viewAsAvatar, setViewAsAvatar] = useState<Avatar | null>(null);

  // Consolidated loading state
  const [loadingState, setLoadingState] = useState<LoadingState>({
    user: true,
    roles: true,
    avatars: true,
    isReady: false
  });

  const supabase = createClient();

  // Helper to update loading state
  const updateLoadingState = useCallback((updates: Partial<LoadingState>) => {
    setLoadingState(prev => {
      const newState = { ...prev, ...updates };
      // Calculate if everything is ready for role-based rendering
      newState.isReady = !newState.user && !newState.roles && !newState.avatars;
      return newState;
    });
  }, []);

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
      updateLoadingState({ avatars: true });
      const { data, error } = await supabase
        .from('avatars')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setAvatars(data || []);
      
      // Set first avatar as current if none selected and we have avatars
      if (data && data.length > 0) {
        setCurrentAvatar(prev => prev || data[0]);
      }
    } catch (err) {
      logger.error('Error loading avatars:', err);
      setError('Failed to load avatars');
      setAvatars([]);
    } finally {
      updateLoadingState({ avatars: false });
    }
  }, [supabase, updateLoadingState]);

  // Fetch roles and org info
  const fetchRolesAndOrg = useCallback(async (userId: string) => {
    try {
      updateLoadingState({ roles: true });
      
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
      
      const userRoles: Role[] = (userPolicies || []).map((up: any) => ({
        id: up.permission_policies.id,
        name: up.permission_policies.policy_name,
        description: up.permission_policies.description,
      }));
      setRoles(userRoles);
      
    } catch (err) {
      logger.error('Error fetching roles/org info:', err);
      setOrg(null);
      setRoles([]);
      setError('Failed to load organization or roles.');
    } finally {
      updateLoadingState({ roles: false });
    }
  }, [supabase, updateLoadingState]);

  // Enhanced demo user/org/roles fallback
  const loadDemoUserContext = useCallback(async () => {
    try {
      updateLoadingState({ user: true, roles: true, avatars: true });
      setDemoMode(true);
      
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
        let demoRoles = [];
        if (demoUser) {
          const { data: userPolicies } = await supabase
            .from('user_policies')
            .select('policy_id, permission_policies(id, policy_name, description)')
            .eq('user_id', demoUser.id);
          demoRoles = (userPolicies || []).map((up: any) => ({
            id: up.permission_policies.id,
            name: up.permission_policies.policy_name,
            description: up.permission_policies.description,
          }));
        }
        
        // Set context state from database
        if (demoUser) {
          setUser(demoUser);
          setUserProfile(demoUser);
          setOrg(demoOrg ? { id: demoOrg.id, name: demoOrg.name, subscriptionPlan: demoPlan } : null);
          setRoles(demoRoles.length > 0 ? demoRoles : [{ id: '1', name: 'account_owner' }]);
          // Load demo avatars
          await loadAvatars(demoUser.id);
          return;
        }
      } catch (dbError) {
        logger.warn('Database demo user not found, using hardcoded fallback');
      }
      
      // Fallback to hardcoded demo context
      const hardcodedDemoUser = { id: 'demo-user', email: 'demo@example.com' } as any;
      setUser(hardcodedDemoUser);
      setUserProfile({ id: 'demo-user', email: 'demo@example.com', org_id: 'demo-org' } as any);
      setOrg({ 
        id: 'demo-org', 
        name: 'Demo Organization', 
        subscriptionPlan: { 
          id: 'demo-plan', 
          name: 'Professional Plan', 
          tier: 'professional', 
          avatar_limit: 30, 
          features_included: { analytics: true, user_management: true } 
        } 
      });
      setRoles([
        { id: '1', name: 'account_owner', description: 'Full administrative access' },
        { id: '2', name: 'org_admin', description: 'Organization management' }
      ]);
      setAvatars([{ 
        id: 'demo-avatar', 
        user_id: 'demo-user', 
        org_id: 'demo-org', 
        name: 'Demo Child', 
        encrypted_pii: null, 
        theme_settings: {}, 
        game_preferences: {}, 
        last_active: null, 
        created_at: null, 
        updated_at: null 
      }]);
      setCurrentAvatar({ 
        id: 'demo-avatar', 
        user_id: 'demo-user', 
        org_id: 'demo-org', 
        name: 'Demo Child', 
        encrypted_pii: null, 
        theme_settings: {}, 
        game_preferences: {}, 
        last_active: null, 
        created_at: null, 
        updated_at: null 
      });
      
    } catch (err) {
      logger.error('Error in demo user context:', err);
      setError('Failed to initialize demo mode');
    } finally {
      // Complete all loading states for demo mode
      updateLoadingState({ user: false, roles: false, avatars: false });
    }
  }, [supabase, loadAvatars, updateLoadingState]);

  // Main user loading effect
  useEffect(() => {
    const loadUser = async () => {
      try {
        updateLoadingState({ user: true });
        setError(null);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Real user authentication
          setUser(session.user);
          updateLoadingState({ user: false });
          await loadUserProfile(session.user.id);
          
          // Load roles and avatars in parallel
          await Promise.all([
            fetchRolesAndOrg(session.user.id),
            loadAvatars(session.user.id)
          ]);
        } else if (process.env.NEXT_PUBLIC_USE_DEMO_USER === 'true') {
          // Demo mode
          await loadDemoUserContext();
        } else {
          setError('No user session found. Please log in.');
          updateLoadingState({ user: false, roles: false, avatars: false });
        }
      } catch (err) {
        logger.error('Error loading user:', err);
        setError('Failed to load user context.');
        updateLoadingState({ user: false, roles: false, avatars: false });
      }
    };
    
    loadUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        updateLoadingState({ user: false });
        await loadUserProfile(session.user.id);
        
        // Load roles and avatars in parallel
        await Promise.all([
          fetchRolesAndOrg(session.user.id),
          loadAvatars(session.user.id)
        ]);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
        setAvatars([]);
        setCurrentAvatar(null);
        setRoles([]);
        setOrg(null);
        // Load demo user for continued development
        await loadDemoUserContext();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserProfile, loadDemoUserContext, supabase.auth, loadAvatars, fetchRolesAndOrg, updateLoadingState]);

  // Utility functions
  const hasRole = useCallback((roleName: string) => {
    // Only return true if we're ready and actually have the role
    return loadingState.isReady && roles.some(r => r.name === roleName);
  }, [roles, loadingState.isReady]);
  
  const canAccess = useCallback((feature: string) => {
    // Only return true if we're ready and have access
    if (!loadingState.isReady || !org?.subscriptionPlan) return false;
    const features = org.subscriptionPlan.features_included || {};
    return features[feature] === true;
  }, [org, loadingState.isReady]);
  
  const getTierLimit = useCallback((feature: string) => {
    return org?.subscriptionPlan?.[`${feature}_limit`];
  }, [org]);

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
      {demoMode && (
        <Box sx={{ bgcolor: 'warning.main', color: 'black', p: 1, textAlign: 'center' }}>
          <b>Demo Mode:</b> You are using a demo user context. Features may be simulated.
        </Box>
      )}
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook to access user context
 * Provides user authentication state and avatar management
 */
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

/**
 * Hook specifically for avatar context
 * Convenience hook for components that only need avatar information
 */
export function useAvatar() {
  const { currentAvatar, avatars, setCurrentAvatar } = useUser();
  return {
    currentAvatar,
    avatars,
    setCurrentAvatar
  };
}

/**
 * Hook for role-based rendering with loading safety
 * Only returns true for roles when the user context is fully loaded
 */
export function useRoleGuard() {
  const { hasRole, loadingState, roles } = useUser();
  
  const isReady = loadingState.isReady;
  
  const guardedHasRole = useCallback((roleName: string) => {
    return isReady && hasRole(roleName);
  }, [isReady, hasRole]);
  
  return {
    hasRole: guardedHasRole,
    isReady,
    roles: isReady ? roles : []
  };
} 