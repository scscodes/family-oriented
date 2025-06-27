import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import { validateEmail } from '@/utils/emailValidation';
import { storeTestAccount } from '@/utils/testAccountStorage';

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organization?: string;
  tier: string;
  billingCycle: 'monthly' | 'yearly';
}

export function useRegistration() {
  const [registrationData, setRegistrationData] = useState<Partial<RegistrationData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const supabase = createClient();

  const updateRegistrationData = useCallback((data: Partial<RegistrationData>) => {
    setRegistrationData(prev => ({ ...prev, ...data }));
  }, []);

  const completeRegistration = useCallback(async (): Promise<{ success: boolean, error?: string }> => {
    setLoading(true);
    setError(null);
    try {
      if (!registrationData.email || !registrationData.password) {
        throw new Error('Email and password are required for registration.');
      }

      // Register the user with Supabase Auth (simplified call)
      const signUpResult = await signUp(registrationData.email, registrationData.password);

      if (!signUpResult.success) {
        throw new Error(signUpResult.error || 'Failed to register user.');
      }

      // Store test account credentials for future login (development only)
      const emailValidation = validateEmail(registrationData.email);
      if (emailValidation.isTestEmail) {
        storeTestAccount({
          email: registrationData.email,
          password: registrationData.password,
          firstName: registrationData.firstName || '',
          lastName: registrationData.lastName || '',
          tier: registrationData.tier || 'personal',
        });
      }

      // After successful auth signup, create user profile with metadata
      // Skip database operations for test emails
      if (signUpResult.user && !emailValidation.isTestEmail) {
        const { error: profileError } = await supabase.from('users').update({
          first_name: registrationData.firstName,
          last_name: registrationData.lastName,
          account_type: registrationData.tier,
          updated_at: new Date().toISOString(),
        }).eq('id', signUpResult.user.id);

        if (profileError) {
          console.error('Failed to update user profile:', profileError);
        }
      }

      // Additional logic for organization creation for non-personal tiers
      // Skip database operations for test emails
      if (registrationData.tier !== 'personal' && registrationData.organization && signUpResult.user && !emailValidation.isTestEmail) {
        const { data: orgData, error } = await supabase.from('organizations').insert([
          {
            name: registrationData.organization,
            status: 'active',
          },
        ]).select('id').single();

        if (error) {
          console.error('Failed to create organization:', error.message);
          // Not critical, can continue with registration
        } else if (orgData) {
          // Link user to organization by updating the user's org_id
          await supabase.from('users').update({
            org_id: orgData.id,
          }).eq('id', signUpResult.user.id);
        }
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during registration.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [registrationData, signUp, supabase]);

  return {
    registrationData,
    updateRegistrationData,
    completeRegistration,
    loading,
    error,
  };
} 