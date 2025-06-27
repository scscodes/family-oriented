import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/stores/appStore';
import { getDemoConfig, createDemoSubscriptionPlan, createDemoRoles, createDemoAvatars } from '@/utils/demoConfig';
import { logger } from '@/utils/logger';
import { validateEmail } from '@/utils/emailValidation';
import { validateTestCredentials, findTestAccount } from '@/utils/testAccountStorage';

export const useAuth = () => {
  const router = useRouter();
  const supabase = createClient();
  
  // Get auth-related state and actions from Zustand
  const {
    user,
    setUser,
    setUserProfile,
    setRoles,
    setOrg,
    setAvatars,
    setCurrentAvatar,
    setLoading,
    setError,
    signOut: storeSignOut,
    initializeDemo,
  } = useAppStore();

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading('user', true);
      setError(null);
      
      // Check if this is a test email in development
      const emailValidation = validateEmail(email);
      if (emailValidation.isTestEmail) {
        // Validate credentials against stored test accounts
        if (!validateTestCredentials(email, password)) {
          throw new Error('Invalid test account credentials');
        }
        
        logger.info('Signing in with test email in development mode:', email);
        
        // Get stored test account details
        const testAccount = findTestAccount(email);
        
        // Create a consistent mock user ID based on email
        const userId = `test-${email.replace(/[^a-zA-Z0-9]/g, '-')}`;
        
        const mockUser = {
          id: userId,
          email,
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: testAccount?.createdAt || new Date().toISOString(),
        };
        
        // Set user and basic profile for test account
        setUser(mockUser as any);
        setUserProfile({
          id: mockUser.id,
          email: mockUser.email,
          first_name: testAccount?.firstName || email.split('@')[0] || 'Test',
          last_name: testAccount?.lastName || 'User',
          org_id: `${mockUser.id}-org`,
          account_type: testAccount?.tier || 'personal',
          created_at: mockUser.created_at,
          updated_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          phone: null,
          timezone: null,
          locale: 'en',
        } as any);
        
        // Set up test organization with subscription plan
        const tier = testAccount?.tier || 'personal';
        const tierConfig = {
          personal: { name: 'Personal Plan', avatar_limit: 5 },
          professional: { name: 'Professional Plan', avatar_limit: 50 },
          enterprise: { name: 'Enterprise Plan', avatar_limit: 10000 }
        };
        
        const planConfig = tierConfig[tier as keyof typeof tierConfig];
        setOrg({
          id: `${mockUser.id}-org`,
          name: 'Test Organization',
          subscriptionPlan: {
            id: `test-${tier}-plan`,
            name: planConfig.name,
            tier,
            avatar_limit: planConfig.avatar_limit,
            features_included: {
              analytics: tier !== 'personal',
              user_management: tier === 'enterprise',
              premium_themes: tier !== 'personal',
              custom_branding: tier === 'enterprise',
              collections: true,
              scheduling: tier !== 'personal',
              bulk_operations: tier === 'enterprise',
              api_access: tier === 'enterprise',
              export_data: tier !== 'personal',
              advanced_reporting: tier === 'enterprise'
            }
          }
        });
        
        // Set up test roles
        const roles = [
          {
            id: 'test-role-owner',
            name: 'account_owner',
            description: 'Full administrative access'
          }
        ];
        setRoles(roles);
        
        // Set up test avatars (create 2 default avatars for test accounts)
        const testAvatars = [
          {
            id: `${mockUser.id}-avatar-1`,
            user_id: mockUser.id,
            org_id: `${mockUser.id}-org`,
            name: 'Test Child 1',
            encrypted_pii: null,
            theme_settings: {},
            game_preferences: {},
            last_active: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: `${mockUser.id}-avatar-2`,
            user_id: mockUser.id,
            org_id: `${mockUser.id}-org`,
            name: 'Test Child 2',
            encrypted_pii: null,
            theme_settings: {},
            game_preferences: {},
            last_active: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setAvatars(testAvatars);
        
        // Set the first avatar as current avatar (this fixes the dashboard warning)
        if (testAvatars.length > 0) {
          setCurrentAvatar(testAvatars[0]);
        }
        
        return { success: true };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user);
        // The ZustandProvider will handle loading the rest of the data
        return { success: true };
      }

      return { success: false, error: 'Failed to sign in' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading('user', false);
    }
  }, [supabase, setUser, setUserProfile, setOrg, setRoles, setAvatars, setCurrentAvatar, setLoading, setError]);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setLoading('user', true);
      setError(null);
      
      // Validate email with environment-aware rules
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.error || 'Invalid email address');
      }

      // For test emails in development, bypass actual Supabase auth
      if (emailValidation.isTestEmail) {
        logger.info('Using test email in development mode:', email);
        
        // Create a mock user object for test emails
        const mockUser = {
          id: `test-${Date.now()}`,
          email,
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
        
        return { success: true, user: mockUser as any };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        return { success: true, user: data.user };
      }

      return { success: false, error: 'Failed to create account' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading('user', false);
    }
  }, [supabase, setLoading, setError]);

  const signOut = useCallback(async () => {
    try {
      setLoading('user', true);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Call store signOut to clear all state
      await storeSignOut();
      
      router.push('/');
    } catch (error) {
      logger.error('Sign out error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign out');
    } finally {
      setLoading('user', false);
    }
  }, [supabase, storeSignOut, router, setLoading, setError]);

  const signInAsDemo = useCallback(async (tier: 'personal' | 'professional' | 'enterprise' = 'personal') => {
    try {
      setLoading('user', true);
      setError(null);
      
      // Initialize demo mode
      await initializeDemo(tier);
      
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
      
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialize demo mode';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading('user', false);
    }
  }, [initializeDemo, setUser, setUserProfile, setOrg, setRoles, setAvatars, setLoading, setError]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setLoading('user', true);
      setError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading('user', false);
    }
  }, [supabase, setLoading, setError]);

  return {
    user,
    signIn,
    signUp,
    signOut,
    signInAsDemo,
    resetPassword,
    loading: useAppStore((state) => state.loading.user),
    error: useAppStore((state) => state.error),
  };
}; 