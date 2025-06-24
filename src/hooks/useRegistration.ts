'use client';

import { useState } from 'react';
import { useAuth } from './useAuth';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/utils/logger';
import type { SubscriptionTier } from '@/utils/subscriptionService';

export interface RegistrationData {
  // User Details
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  
  // Account Configuration
  accountType: 'personal' | 'organization';
  organizationName?: string;
  selectedTier: SubscriptionTier;
  billingPeriod: 'monthly' | 'yearly';
  
  // Terms Agreement
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

interface RegistrationResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
  };
  organization?: {
    id: string;
    name: string;
  };
  subscription?: {
    id: string;
    tier: SubscriptionTier;
  };
  error?: string;
  requiresEmailVerification?: boolean;
}

interface RegistrationState {
  isLoading: boolean;
  currentStep: 'user' | 'profile' | 'organization' | 'subscription' | 'complete';
  error: string | null;
}

export function useRegistration() {
  const { signUp } = useAuth();
  const supabase = createClient();
  
  const [state, setState] = useState<RegistrationState>({
    isLoading: false,
    currentStep: 'user',
    error: null,
  });

  const updateState = (updates: Partial<RegistrationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const completeRegistration = async (data: RegistrationData): Promise<RegistrationResult> => {
    updateState({ isLoading: true, error: null, currentStep: 'user' });

    try {
      // Step 1: Create Supabase Auth User
      logger.info('Starting registration process', { 
        email: data.email, 
        accountType: data.accountType,
        tier: data.selectedTier 
      });

      updateState({ currentStep: 'user' });
      const authResult = await signUp(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName,
      });

      if (authResult.error || !authResult.data?.user) {
        logger.error('Auth user creation failed', authResult.error);
        return {
          success: false,
          error: authResult.error || 'Failed to create user account',
        };
      }

      const user = authResult.data.user;
      logger.info('Auth user created successfully', { userId: user.id });

      // Step 2: Create User Profile
      updateState({ currentStep: 'profile' });
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          first_name: data.firstName,
          last_name: data.lastName,
          account_type: data.accountType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        logger.error('Profile creation failed', profileError);
        return {
          success: false,
          error: 'Failed to create user profile. Please try again.',
        };
      }

      logger.info('User profile created successfully');

      let organizationId: string | undefined;
      
      // Step 3: Create Organization (if needed)
      if (data.accountType === 'organization' && data.organizationName) {
        updateState({ currentStep: 'organization' });
        
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: data.organizationName,
            created_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (orgError || !orgData) {
          logger.error('Organization creation failed', orgError);
          return {
            success: false,
            error: 'Failed to create organization. Please try again.',
          };
        }

        organizationId = orgData.id;
        logger.info('Organization created successfully', { organizationId });

        // Link user to organization by updating user's org_id
        const { error: userOrgError } = await supabase
          .from('users')
          .update({ 
            org_id: organizationId,
            account_type: 'organization',
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (userOrgError) {
          logger.error('User-organization linking failed', userOrgError);
          return {
            success: false,
            error: 'Failed to link user to organization. Please contact support.',
          };
        }

        logger.info('User linked to organization successfully');
      }

      // Step 4: Create Subscription Plan
      updateState({ currentStep: 'subscription' });
      
      // Calculate pricing based on tier and billing period
      const basePrices = {
        personal: 9.99,
        professional: 19.99,
        enterprise: 49.99,
      };
      
      const basePrice = basePrices[data.selectedTier];
      const durationMonths = data.billingPeriod === 'yearly' ? 12 : 1;
      
      const subscriptionData = {
        tier: data.selectedTier,
        name: data.selectedTier === 'personal' ? 'Personal Plan' : 
              data.selectedTier === 'professional' ? 'Professional Plan' : 'Enterprise Plan',
        base_price: basePrice,
        duration_months: durationMonths,
        avatar_limit: 0, // Will be updated below
        active: true,
        created_at: new Date().toISOString(),
      };

      const { data: subscriptionResult, error: subscriptionError } = await supabase
        .from('subscription_plans')
        .insert(subscriptionData)
        .select('id, tier')
        .single();

      if (subscriptionError || !subscriptionResult) {
        logger.error('Subscription creation failed', subscriptionError);
        return {
          success: false,
          error: 'Failed to set up subscription plan. Please contact support.',
        };
      }

      logger.info('Subscription plan created successfully', { 
        subscriptionId: subscriptionResult.id,
        tier: subscriptionResult.tier 
      });

      // Step 5: Set up tier-specific features and limits
      const tierConfig = {
        personal: {
          avatar_limit: 5,
          features_included: {
            analytics: true,
            user_management: false,
            premium_themes: false,
            custom_branding: false,
            collections: true,
            scheduling: false,
            bulk_operations: false,
            api_access: false,
            export_data: false,
            advanced_reporting: false,
          }
        },
        professional: {
          avatar_limit: 30,
          features_included: {
            analytics: true,
            user_management: true,
            premium_themes: true,
            custom_branding: false,
            collections: true,
            scheduling: true,
            bulk_operations: true,
            api_access: false,
            export_data: true,
            advanced_reporting: true,
          }
        },
        enterprise: {
          avatar_limit: 10000,
          features_included: {
            analytics: true,
            user_management: true,
            premium_themes: true,
            custom_branding: true,
            collections: true,
            scheduling: true,
            bulk_operations: true,
            api_access: true,
            export_data: true,
            advanced_reporting: true,
          }
        }
      };

      const tierFeatures = tierConfig[data.selectedTier];
      
      // Update subscription with tier-specific settings
      const { error: updateError } = await supabase
        .from('subscription_plans')
        .update({
          avatar_limit: tierFeatures.avatar_limit,
          features_included: tierFeatures.features_included,
        })
        .eq('id', subscriptionResult.id);

      if (updateError) {
        logger.warn('Failed to update subscription features, continuing anyway', updateError);
      }

      // Link organization to subscription plan if organization was created
      if (organizationId) {
        const { error: orgSubError } = await supabase
          .from('organizations')
          .update({
            subscription_plan_id: subscriptionResult.id,
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
            updated_at: new Date().toISOString(),
          })
          .eq('id', organizationId);

        if (orgSubError) {
          logger.warn('Failed to link organization to subscription, continuing anyway', orgSubError);
        }
      }

      updateState({ currentStep: 'complete' });
      
      logger.info('Registration completed successfully', {
        userId: user.id,
        organizationId,
        subscriptionId: subscriptionResult.id,
        tier: data.selectedTier,
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email!,
        },
        organization: organizationId ? {
          id: organizationId,
          name: data.organizationName!,
        } : undefined,
        subscription: {
          id: subscriptionResult.id,
          tier: data.selectedTier,
        },
        requiresEmailVerification: !user.email_confirmed_at, // Check if email verification is needed
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during registration';
      logger.error('Registration process failed', error);
      
      updateState({ error: errorMessage });
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      updateState({ isLoading: false });
    }
  };

  const clearError = () => {
    updateState({ error: null });
  };

  const resetState = () => {
    setState({
      isLoading: false,
      currentStep: 'user',
      error: null,
    });
  };

  return {
    completeRegistration,
    clearError,
    resetState,
    isLoading: state.isLoading,
    currentStep: state.currentStep,
    error: state.error,
  };
} 