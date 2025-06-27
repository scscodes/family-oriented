/**
 * useSubscription Hook - React hook for subscription tier management
 * Provides subscription feature gating and usage limit checking
 */

import { useMemo, useCallback } from 'react';
import { useUser } from '@/stores/hooks';
import { 
  SubscriptionService, 
  type SubscriptionFeature, 
  type SubscriptionTier,
  type UsageLimit, 
  type FeatureGateResult,
  type UsageData
} from '@/utils/subscriptionService';

import { logger } from '@/utils/logger';

/**
 * Hook return type - Enhanced with comprehensive subscription management
 */
type UpgradeRecommendation = {
  recommended: boolean;
  targetTier: SubscriptionTier;
  reasons: string[];
  benefits: string[];
  urgency: 'low' | 'medium' | 'high';
};

interface UseSubscriptionReturn {
  // Subscription plan info
  subscriptionPlan: {
    id: string;
    tier: string;
    avatar_limit: number;
    features_included: Record<string, boolean>;
  } | null;
  tier: string | null;
  isLoaded: boolean;
  
  // Feature checking
  canAccessFeature: (feature: SubscriptionFeature) => FeatureGateResult;
  hasFeature: (feature: SubscriptionFeature) => boolean;
  checkMultipleFeatures: (features: SubscriptionFeature[]) => Record<SubscriptionFeature, FeatureGateResult>;
  
  // Usage checking
  canCreateAvatar: () => FeatureGateResult;
  canCreateCollection: (avatarId?: string) => FeatureGateResult;
  checkUsageLimit: (limitType: UsageLimit, currentUsage: number) => FeatureGateResult;
  
  // Smart recommendations
  getUpgradeRecommendation: (lockedFeaturesAccessed?: SubscriptionFeature[]) => UpgradeRecommendation;
  getLockedFeatures: () => SubscriptionFeature[];
  
  // Utility methods
  getAvailableFeatures: () => SubscriptionFeature[];
  getUsageSummary: (usageData: UsageData) => Record<UsageLimit, FeatureGateResult>;
  formatFeatureMessage: (result: FeatureGateResult) => string;
  
  // Feature access shortcuts for common UI patterns
  featureAccess: {
    dashboard: FeatureGateResult;
    userManagement: FeatureGateResult;
    premiumThemes: FeatureGateResult;
    customBranding: FeatureGateResult;
    collections: FeatureGateResult;
    scheduling: FeatureGateResult;
    bulkOperations: FeatureGateResult;
    apiAccess: FeatureGateResult;
    exportData: FeatureGateResult;
    advancedReporting: FeatureGateResult;
  };
  
  // Current usage data
  currentUsage: {
    avatarsCount: number;
    isLoadingUsage: boolean;
  };
}

/**
 * Enhanced subscription management hook with comprehensive feature gating
 */
export function useSubscription(): UseSubscriptionReturn {
  const { org, avatars, loadingState } = useUser();
  
  // Memoize basic values to prevent unnecessary re-renders
  const subscriptionPlan = useMemo(() => org?.subscriptionPlan || null, [org?.subscriptionPlan]);
  const tier = useMemo(() => subscriptionPlan?.tier || null, [subscriptionPlan?.tier]);
  const isLoaded = useMemo(() => loadingState.isReady, [loadingState.isReady]);

  // Removed debug logging to prevent excessive console output
  
  // Current usage calculations - memoized to prevent re-renders
  const currentUsage = useMemo(() => ({
    avatarsCount: avatars?.length || 0,
    isLoadingUsage: loadingState.avatars
  }), [avatars?.length, loadingState.avatars]);

  // Enhanced feature checking functions - memoized with stable dependencies
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

  // Bulk feature checking for UI optimization
  const checkMultipleFeatures = useCallback((features: SubscriptionFeature[]) => {
    if (!isLoaded) {
      return features.reduce((acc, feature) => {
        acc[feature] = { allowed: false, reason: 'Loading...' };
        return acc;
      }, {} as Record<SubscriptionFeature, FeatureGateResult>);
    }
    
    return SubscriptionService.checkMultipleFeatures(subscriptionPlan, features);
  }, [subscriptionPlan, isLoaded]);

  // Enhanced usage checking with better error handling
  const canCreateAvatar = useCallback((): FeatureGateResult => {
    if (!isLoaded || currentUsage.isLoadingUsage) {
      return {
        allowed: false,
        reason: 'Loading avatar information...'
      };
    }
    
    const result = SubscriptionService.canCreateAvatar(subscriptionPlan, currentUsage.avatarsCount);
    
    // Only log when actually blocked to reduce spam
    if (!result.allowed) {
      logger.info('Avatar creation blocked by subscription limit:', {
        tier,
        currentCount: currentUsage.avatarsCount,
        limit: result.limit
      });
    }
    
    return result;
  }, [subscriptionPlan, currentUsage, isLoaded, tier]);

  const canCreateCollection = useCallback((): FeatureGateResult => {
    if (!isLoaded) {
      return {
        allowed: false,
        reason: 'Loading subscription information...'
      };
    }
    
    // For now, we'll use a simplified check
    // In the future, we could fetch per-avatar collection counts
    const estimatedCollectionsCount = 5; // This would be fetched from database
    
    return SubscriptionService.canCreateCollection(subscriptionPlan, estimatedCollectionsCount);
  }, [subscriptionPlan, isLoaded]);

  const checkUsageLimit = useCallback((
    limitType: UsageLimit, 
    currentUsage: number
  ): FeatureGateResult => {
    if (!isLoaded) {
      return {
        allowed: false,
        reason: 'Loading subscription information...'
      };
    }
    
    return SubscriptionService.checkUsageLimit(subscriptionPlan, limitType, currentUsage);
  }, [subscriptionPlan, isLoaded]);

  // Smart upgrade recommendations
  const getUpgradeRecommendation = useCallback((
    lockedFeaturesAccessed: SubscriptionFeature[] = []
  ) => {
    if (!isLoaded) {
      return {
        recommended: false,
        targetTier: 'personal' as SubscriptionTier,
        reasons: ['Loading...'],
        benefits: [],
        urgency: 'low' as const
      };
    }
    
    const usageData = {
      avatarsCount: currentUsage.avatarsCount,
      collectionsCount: 5, // This would come from actual data
      sessionsThisMonth: 150, // This would come from analytics
      dataRetentionMonths: 12
    };
    
    return SubscriptionService.getSmartUpgradeRecommendation(
      subscriptionPlan,
      usageData,
      lockedFeaturesAccessed
    );
  }, [subscriptionPlan, isLoaded, currentUsage]);

  // Get locked features for upgrade prompts
  const getLockedFeatures = useCallback((): SubscriptionFeature[] => {
    if (!isLoaded) return [];
    return SubscriptionService.getLockedFeatures(subscriptionPlan);
  }, [subscriptionPlan, isLoaded]);

  // Utility functions
  const getAvailableFeatures = useCallback((): SubscriptionFeature[] => {
    if (!isLoaded) return [];
    return SubscriptionService.getAvailableFeatures(subscriptionPlan);
  }, [subscriptionPlan, isLoaded]);

  const getUsageSummary = useCallback((usageData: UsageData) => {
    if (!isLoaded) {
      return {} as Record<UsageLimit, FeatureGateResult>;
    }
    return SubscriptionService.getUsageSummary(subscriptionPlan, usageData);
  }, [subscriptionPlan, isLoaded]);

  const formatFeatureMessage = useCallback((
    result: FeatureGateResult
  ): string => {
    return SubscriptionService.formatFeatureGateMessage(result);
  }, []);

  // Specific feature access shortcuts for common UI patterns - memoized to prevent re-renders
  const featureAccess = useMemo(() => ({
    dashboard: canAccessFeature('analytics'),
    userManagement: canAccessFeature('user_management'),
    premiumThemes: canAccessFeature('premium_themes'),
    customBranding: canAccessFeature('custom_branding'),
    collections: canAccessFeature('collections'),
    scheduling: canAccessFeature('scheduling'),
    bulkOperations: canAccessFeature('bulk_operations'),
    apiAccess: canAccessFeature('api_access'),
    exportData: canAccessFeature('export_data'),
    advancedReporting: canAccessFeature('advanced_reporting')
  }), [canAccessFeature]);

  // Return memoized hook result to prevent unnecessary re-renders
  return useMemo(() => ({
    // Subscription plan info
    subscriptionPlan,
    tier,
    isLoaded,
    
    // Feature checking
    canAccessFeature,
    hasFeature,
    checkMultipleFeatures,
    
    // Usage checking
    canCreateAvatar,
    canCreateCollection,
    checkUsageLimit,
    
    // Smart recommendations
    getUpgradeRecommendation,
    getLockedFeatures,
    
    // Utility methods
    getAvailableFeatures,
    getUsageSummary,
    formatFeatureMessage,
    
    // Feature access shortcuts
    featureAccess,
    
    // Current usage
    currentUsage
  }), [
    subscriptionPlan,
    tier,
    isLoaded,
    canAccessFeature,
    hasFeature,
    checkMultipleFeatures,
    canCreateAvatar,
    canCreateCollection,
    checkUsageLimit,
    getUpgradeRecommendation,
    getLockedFeatures,
    getAvailableFeatures,
    getUsageSummary,
    formatFeatureMessage,
    featureAccess,
    currentUsage
  ]);
}

/**
 * Hook for subscription-specific usage tracking
 */
export function useUsageTracking() {
  const { subscriptionPlan, currentUsage } = useSubscription();
  
  const trackUsage = useCallback(async (
    action: 'avatar_created' | 'collection_created' | 'session_started',
    metadata?: Record<string, unknown>
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