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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('Failed to load user profile');
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
      
      // Set first avatar as current if none selected
      if (data && data.length > 0 && !currentAvatar) {
        setCurrentAvatar(data[0]);
      }
    } catch (err) {
      console.error('Error loading avatars:', err);
      setError('Failed to load avatars');
    }
  }, [supabase, currentAvatar]);

  // Create demo user for development/testing
  const createDemoUser = useCallback(async () => {
    try {
      // Create a demo user profile (not in auth, just in our users table)
      const demoUserId = 'demo-user-id';
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

      // Create a demo avatar
      const demoAvatar: Avatar = {
        id: 'demo-avatar-id',
        user_id: demoUserId,
        org_id: null,
        name: 'My Child',
        encrypted_pii: null,
        theme_settings: {},
        game_preferences: {},
        last_active: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setAvatars([demoAvatar]);
      setCurrentAvatar(demoAvatar);
    } catch (err) {
      console.error('Error creating demo user:', err);
      setError('Failed to initialize demo user');
    }
  }, []);

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
          // Create demo user for continued development
          await createDemoUser();
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
        // Create demo user for continued development
        await createDemoUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadAvatars, loadUserProfile, createDemoUser, supabase.auth]);

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