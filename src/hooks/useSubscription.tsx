/**
 * useSubscription Hook - React hook for subscription tier management
 * Provides subscription feature gating and usage limit checking
 */

import React, { useMemo, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import { 
  SubscriptionService, 
  type SubscriptionFeature, 
  type UsageLimit, 
  type FeatureGateResult,
  type UsageData
} from '@/utils/subscriptionService';
import { logger } from '@/utils/logger';

/**
 * Hook return type
 */
interface UseSubscriptionReturn {
  // Subscription plan info
  subscriptionPlan: any | null;
  tier: string | null;
  isLoaded: boolean;
  
  // Feature checking
  canAccessFeature: (feature: SubscriptionFeature) => FeatureGateResult;
  hasFeature: (feature: SubscriptionFeature) => boolean;
  
  // Usage checking
  canCreateAvatar: () => FeatureGateResult;
  canCreateCollection: (avatarId?: string) => FeatureGateResult;
  checkUsageLimit: (limitType: UsageLimit, currentUsage: number) => FeatureGateResult;
  
  // Utility methods
  getAvailableFeatures: () => SubscriptionFeature[];
  getUsageSummary: (usageData: UsageData) => Record<UsageLimit, FeatureGateResult>;
  formatFeatureMessage: (result: FeatureGateResult, feature?: string) => string;
  
  // Current usage data
  currentUsage: {
    avatarsCount: number;
    isLoadingUsage: boolean;
  };
}

/**
 * Subscription management hook
 */
export function useSubscription(): UseSubscriptionReturn {
  const { org, avatars, loadingState } = useUser();
  
  const subscriptionPlan = org?.subscriptionPlan || null;
  const tier = subscriptionPlan?.tier || null;
  const isLoaded = !loadingState.user && !loadingState.roles;

  // Current usage calculations
  const currentUsage = useMemo(() => ({
    avatarsCount: avatars?.length || 0,
    isLoadingUsage: loadingState.avatars
  }), [avatars, loadingState.avatars]);

  // Feature checking functions
  const canAccessFeature = useCallback((feature: SubscriptionFeature): FeatureGateResult => {
    if (!isLoaded) {
      return {
        allowed: false,
        reason: 'Loading subscription information...'
      };
    }
    
    return SubscriptionService.canAccessFeature(subscriptionPlan, feature);
  }, [subscriptionPlan, isLoaded]);

  const hasFeature = useCallback((feature: SubscriptionFeature): boolean => {
    const result = canAccessFeature(feature);
    return result.allowed;
  }, [canAccessFeature]);

  // Usage limit checking
  const canCreateAvatar = useCallback((): FeatureGateResult => {
    if (!isLoaded || currentUsage.isLoadingUsage) {
      return {
        allowed: false,
        reason: 'Loading avatar information...'
      };
    }
    
    const result = SubscriptionService.canCreateAvatar(subscriptionPlan, currentUsage.avatarsCount);
    
    // Log avatar creation attempts for analytics
    if (!result.allowed) {
      logger.info('Avatar creation blocked by subscription limit:', {
        tier,
        currentCount: currentUsage.avatarsCount,
        limit: result.limit
      });
    }
    
    return result;
  }, [subscriptionPlan, currentUsage, isLoaded, tier]);

  const canCreateCollection = useCallback((avatarId?: string): FeatureGateResult => {
    // For now, we'll use a simplified check
    // In the future, we could fetch per-avatar collection counts
    const estimatedCollectionsCount = 5; // This would be fetched from database
    
    return SubscriptionService.canCreateCollection(subscriptionPlan, estimatedCollectionsCount);
  }, [subscriptionPlan]);

  const checkUsageLimit = useCallback((
    limitType: UsageLimit, 
    currentUsage: number
  ): FeatureGateResult => {
    return SubscriptionService.checkUsageLimit(subscriptionPlan, limitType, currentUsage);
  }, [subscriptionPlan]);

  // Utility functions
  const getAvailableFeatures = useCallback((): SubscriptionFeature[] => {
    return SubscriptionService.getAvailableFeatures(subscriptionPlan);
  }, [subscriptionPlan]);

  const getUsageSummary = useCallback((usageData: UsageData) => {
    return SubscriptionService.getUsageSummary(subscriptionPlan, usageData);
  }, [subscriptionPlan]);

  const formatFeatureMessage = useCallback((
    result: FeatureGateResult, 
    feature?: string
  ): string => {
    return SubscriptionService.formatFeatureGateMessage(result, feature);
  }, []);

  return {
    // Subscription plan info
    subscriptionPlan,
    tier,
    isLoaded,
    
    // Feature checking
    canAccessFeature,
    hasFeature,
    
    // Usage checking
    canCreateAvatar,
    canCreateCollection,
    checkUsageLimit,
    
    // Utility methods
    getAvailableFeatures,
    getUsageSummary,
    formatFeatureMessage,
    
    // Current usage
    currentUsage
  };
}

/**
 * Hook for subscription-specific usage tracking
 */
export function useUsageTracking() {
  const { subscriptionPlan, currentUsage } = useSubscription();
  
  const trackUsage = useCallback(async (
    action: 'avatar_created' | 'collection_created' | 'session_started',
    metadata?: Record<string, any>
  ) => {
    // Analytics tracking for subscription usage
    logger.info('Subscription usage tracked:', {
      action,
      tier: subscriptionPlan?.tier,
      currentAvatars: currentUsage.avatarsCount,
      metadata
    });
    
    // Here we could send to analytics service or external tracking
  }, [subscriptionPlan, currentUsage]);
  
  return { trackUsage };
} 