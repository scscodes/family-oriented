'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/utils/logger'

// Loading states for different operations
interface AuthLoadingState {
  signIn: boolean;
  signUp: boolean;
  resetPassword: boolean;
  updatePassword: boolean;
  resendConfirmation: boolean;
}

// User-friendly error messages
const getAuthErrorMessage = (error: unknown): string => {
  const errorCode = (error as { code?: string; message?: string })?.code || 
                   (error as { code?: string; message?: string })?.message || 
                   'unknown_error';
  
  const errorMessages: Record<string, string> = {
    'invalid_credentials': 'Invalid email or password. Please check your credentials and try again.',
    'email_not_confirmed': 'Please check your email and click the confirmation link before signing in.',
    'too_many_requests': 'Too many attempts. Please wait a few minutes before trying again.',
    'user_not_found': 'No account found with this email address.',
    'email_address_invalid': 'Please enter a valid email address.',
    'password_too_short': 'Password must be at least 6 characters long.',
    'signup_disabled': 'Account creation is currently disabled.',
    'email_address_already_registered': 'An account with this email already exists. Try signing in instead.',
    'weak_password': 'Password is too weak. Please choose a stronger password.',
    'email_rate_limit_exceeded': 'Too many emails sent. Please wait before requesting another.',
    'token_expired': 'Reset link has expired. Please request a new one.',
    'network_error': 'Network error. Please check your connection and try again.',
  };

  // Check for specific error patterns
  if (errorCode.includes('Invalid login credentials')) {
    return errorMessages.invalid_credentials;
  }
  
  if (errorCode.includes('Email not confirmed')) {
    return errorMessages.email_not_confirmed;
  }
  
  if (errorCode.includes('too_many_requests') || errorCode.includes('rate_limit')) {
    return errorMessages.too_many_requests;
  }

  return errorMessages[errorCode] || `Authentication error: ${errorCode}`;
};

export function useAuth() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState<AuthLoadingState>({
    signIn: false,
    signUp: false,
    resetPassword: false,
    updatePassword: false,
    resendConfirmation: false,
  })

  const signUp = async (email: string, password: string, userData: {
    firstName: string
    lastName: string
  }) => {
    setLoading(prev => ({ ...prev, signUp: true }));
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName
          }
        }
      })

      if (error) {
        const friendlyMessage = getAuthErrorMessage(error);
        logger.error('Sign up error:', error);
        return { data: null, error: friendlyMessage };
      }

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            first_name: userData.firstName,
            last_name: userData.lastName
          })

        if (profileError) {
          logger.error('Profile creation error:', profileError);
          return { data: null, error: 'Failed to create user profile. Please try again.' };
        }
      }

      return { data, error: null };
    } catch (error) {
      const friendlyMessage = getAuthErrorMessage(error);
      logger.error('Unexpected sign up error:', error);
      return { data: null, error: friendlyMessage };
    } finally {
      setLoading(prev => ({ ...prev, signUp: false }));
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(prev => ({ ...prev, signIn: true }));
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        const friendlyMessage = getAuthErrorMessage(error);
        logger.error('Sign in error:', error);
        return { data: null, error: friendlyMessage };
      }

      // Successful login - redirect to dashboard
      router.push('/dashboard');
      return { data, error: null };
    } catch (error) {
      const friendlyMessage = getAuthErrorMessage(error);
      logger.error('Unexpected sign in error:', error);
      return { data: null, error: friendlyMessage };
    } finally {
      setLoading(prev => ({ ...prev, signIn: false }));
    }
  }

  const resetPassword = async (email: string) => {
    setLoading(prev => ({ ...prev, resetPassword: true }));
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        const friendlyMessage = getAuthErrorMessage(error);
        logger.error('Password reset error:', error);
        return { success: false, error: friendlyMessage };
      }

      return { success: true, error: null };
    } catch (error) {
      const friendlyMessage = getAuthErrorMessage(error);
      logger.error('Unexpected password reset error:', error);
      return { success: false, error: friendlyMessage };
    } finally {
      setLoading(prev => ({ ...prev, resetPassword: false }));
    }
  }

  const updatePassword = async (newPassword: string) => {
    setLoading(prev => ({ ...prev, updatePassword: true }));
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        const friendlyMessage = getAuthErrorMessage(error);
        logger.error('Password update error:', error);
        return { success: false, error: friendlyMessage };
      }

      return { success: true, error: null };
    } catch (error) {
      const friendlyMessage = getAuthErrorMessage(error);
      logger.error('Unexpected password update error:', error);
      return { success: false, error: friendlyMessage };
    } finally {
      setLoading(prev => ({ ...prev, updatePassword: false }));
    }
  }

  const resendConfirmation = async (email: string) => {
    setLoading(prev => ({ ...prev, resendConfirmation: true }));
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        const friendlyMessage = getAuthErrorMessage(error);
        logger.error('Resend confirmation error:', error);
        return { success: false, error: friendlyMessage };
      }

      return { success: true, error: null };
    } catch (error) {
      const friendlyMessage = getAuthErrorMessage(error);
      logger.error('Unexpected resend confirmation error:', error);
      return { success: false, error: friendlyMessage };
    } finally {
      setLoading(prev => ({ ...prev, resendConfirmation: false }));
    }
  }

  return { 
    signUp, 
    signIn, 
    resetPassword, 
    updatePassword, 
    resendConfirmation, 
    loading 
  }
} 