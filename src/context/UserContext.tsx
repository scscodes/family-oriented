'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

// Types
type Avatar = Database['public']['Tables']['avatars']['Row'];
type UserProfile = Database['public']['Tables']['users']['Row'];

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
 */
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [currentAvatar, setCurrentAvatar] = useState<Avatar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Load user profile from database
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('🔍 Loading user profile for ID:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('📊 User profile query result:', { data, error });
      
      if (error) throw error;
      setUserProfile(data);
      console.log('✅ User profile loaded successfully');
    } catch (err) {
      console.error('❌ Error loading user profile:', err);
      throw err; // Re-throw to trigger fallback in loadDemoUser
    }
  }, [supabase]);

  // Load avatars for the current user
  const loadAvatars = useCallback(async (userId: string) => {
    try {
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
      console.error('Error loading avatars:', err);
      setError('Failed to load avatars');
    }
  }, [supabase]);

  // Load demo user for development/testing
  const loadDemoUser = useCallback(async () => {
    try {
      const demoUserId = '00000000-0000-0000-0000-000000000001';
      
      // Create a mock User object for demo purposes
      const demoUser = {
        id: demoUserId,
        email: 'demo@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: { first_name: 'Demo', last_name: 'User' },
        email_confirmed_at: new Date().toISOString()
      } as any; // Using 'any' to avoid complex Supabase User type issues
      
      setUser(demoUser);
      
      // Try to load demo user profile from database, fallback to in-memory if needed
      try {
        await loadUserProfile(demoUserId);
        console.log('✅ Demo user profile loaded from database');
      } catch (profileErr) {
        console.warn('⚠️ Could not load demo user profile from database, using fallback:', profileErr);
        // Fallback to in-memory demo profile
        const demoProfile: UserProfile = {
          id: demoUserId,
          email: 'demo@example.com',
          first_name: 'Demo',
          last_name: 'User',
          phone: null,
          timezone: 'UTC',
          locale: 'en-US',
          org_id: null,
          account_type: 'personal',
          last_login: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setUserProfile(demoProfile);
        console.log('✅ Using fallback demo user profile');
      }
      
      // Try to load demo avatars from database, fallback to in-memory if needed
      try {
        await loadAvatars(demoUserId);
        console.log('✅ Demo avatars loaded from database');
      } catch (avatarErr) {
        console.warn('⚠️ Could not load demo avatars from database, using fallback:', avatarErr);
        // Fallback to in-memory demo avatars
        const demoAvatars: Avatar[] = [
          {
            id: '00000000-0000-0000-0000-000000000002',
            user_id: demoUserId,
            org_id: null,
            name: 'My Child',
            encrypted_pii: null,
            theme_settings: {},
            game_preferences: {},
            last_active: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '00000000-0000-0000-0000-000000000012',
            user_id: demoUserId,
            org_id: null,
            name: 'Quick Learner',
            encrypted_pii: null,
            theme_settings: {},
            game_preferences: {},
            last_active: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '00000000-0000-0000-0000-000000000013',
            user_id: demoUserId,
            org_id: null,
            name: 'Struggling Student',
            encrypted_pii: null,
            theme_settings: {},
            game_preferences: {},
            last_active: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '00000000-0000-0000-0000-000000000014',
            user_id: demoUserId,
            org_id: null,
            name: 'Consistent Player',
            encrypted_pii: null,
            theme_settings: {},
            game_preferences: {},
            last_active: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '00000000-0000-0000-0000-000000000015',
            user_id: demoUserId,
            org_id: null,
            name: 'Math Enthusiast',
            encrypted_pii: null,
            theme_settings: {},
            game_preferences: {},
            last_active: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setAvatars(demoAvatars);
        setCurrentAvatar(demoAvatars[0]);
        console.log('✅ Using fallback demo avatars');
      }
      
      // Clear any previous errors since we successfully loaded demo data
      setError(null);
    } catch (err) {
      console.error('❌ Error loading demo user:', err);
      setError(`Failed to load demo user: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [loadUserProfile, loadAvatars]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
          await loadAvatars(session.user.id);
        } else {
          // Load demo user for continued development
          await loadDemoUser();
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setError('Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
        await loadAvatars(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
        setAvatars([]);
        setCurrentAvatar(null);
        // Load demo user for continued development
        await loadDemoUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserProfile, loadDemoUser, supabase.auth]);

  // Create a new avatar
  const createAvatar = async (name: string): Promise<Avatar | null> => {
    if (!user) {
      setError('Must be logged in to create avatar');
      return null;
    }

    try {
      setError(null);
      const { data, error } = await supabase
        .from('avatars')
        .insert({
          user_id: user.id,
          name: name.trim(),
          theme_settings: {},
          game_preferences: {}
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refresh avatars list
      await loadAvatars(user.id);
      
      return data;
    } catch (err) {
      console.error('Error creating avatar:', err);
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
      console.error('Error signing out:', err);
      setError('Failed to sign out');
    }
  };

  const contextValue: UserContextType = {
    user,
    userProfile,
    avatars,
    currentAvatar,
    loading,
    error,
    setCurrentAvatar,
    createAvatar,
    refreshAvatars,
    signOut
  };

  return (
    <UserContext.Provider value={contextValue}>
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