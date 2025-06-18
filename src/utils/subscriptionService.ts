/**
 * Subscription Service - Tier-based Feature Gating and Usage Limits
 * Provides centralized subscription tier enforcement across the application
 */

import { logger } from './logger';
import type { SubscriptionPlan } from '@/lib/supabase/database.types';

// Subscription tier definitions
export type SubscriptionTier = 'personal' | 'professional' | 'enterprise';

// Feature definitions that can be gated by subscription tier
export type SubscriptionFeature = 
  | 'analytics' 
  | 'user_management' 
  | 'premium_themes' 
  | 'custom_branding'
  | 'collections'
  | 'scheduling'
  | 'bulk_operations'
  | 'api_access'
  | 'export_data'
  | 'advanced_reporting';

// Usage limit types
export type UsageLimit = 
  | 'avatars'
  | 'collections_per_avatar'
  | 'sessions_per_month'
  | 'data_retention_months';

/**
 * Default tier configurations
 */
export const TIER_CONFIGURATIONS: Record<SubscriptionTier, {
  features: Record<SubscriptionFeature, boolean>;
  limits: Record<UsageLimit, number>;
  displayName: string;
  description: string;
}> = {
  personal: {
    displayName: 'Personal Plan',
    description: 'Perfect for families with up to 5 children',
    features: {
      analytics: true,
      user_management: false,
      premium_themes: false,
      custom_branding: false,
      collections: true,
      scheduling: false,
      bulk_operations: false,
      api_access: false,
      export_data: false,
      advanced_reporting: false
    },
    limits: {
      avatars: 5,
      collections_per_avatar: 10,
      sessions_per_month: 1000,
      data_retention_months: 12
    }
  },
  professional: {
    displayName: 'Professional Plan',
    description: 'For educators and small organizations with up to 30 children',
    features: {
      analytics: true,
      user_management: true,
      premium_themes: true,
      custom_branding: false,
      collections: true,
      scheduling: true,
      bulk_operations: true,
      api_access: false,
      export_data: true,
      advanced_reporting: true
    },
    limits: {
      avatars: 30,
      collections_per_avatar: 25,
      sessions_per_month: 5000,
      data_retention_months: 24
    }
  },
  enterprise: {
    displayName: 'Enterprise Plan',
    description: 'For large organizations with unlimited children and full customization',
    features: {
      analytics: true,
      user_management: true,
      premium_themes: true,
      custom_branding: true,
      collections: true,
      scheduling: true,
      bulk_operations: true,
      api_access: true,
      export_data: true,
      advanced_reporting: true
    },
    limits: {
      avatars: 10000, // Effectively unlimited
      collections_per_avatar: 100,
      sessions_per_month: 50000,
      data_retention_months: 60
    }
  }
};

/**
 * Usage tracking and enforcement
 */
export interface UsageData {
  avatarsCount: number;
  collectionsCount: number;
  sessionsThisMonth: number;
  dataRetentionMonths: number;
}

export interface FeatureGateResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: SubscriptionTier;
  currentUsage?: number;
  limit?: number;
}

/**
 * Subscription Service Class
 */
export class SubscriptionService {
  
  /**
   * Check if a feature is available for the given subscription plan
   */
  static canAccessFeature(
    subscriptionPlan: SubscriptionPlan | null, 
    feature: SubscriptionFeature
  ): FeatureGateResult {
    if (!subscriptionPlan) {
      return {
        allowed: false,
        reason: 'No active subscription plan',
        upgradeRequired: 'personal'
      };
    }

    const tier = subscriptionPlan.tier as SubscriptionTier;
    const tierConfig = TIER_CONFIGURATIONS[tier];
    
    if (!tierConfig) {
      logger.error('Unknown subscription tier:', tier);
      return {
        allowed: false,
        reason: 'Invalid subscription tier'
      };
    }

    // Check feature inclusion from database or fallback to defaults
    const featuresIncluded = subscriptionPlan.features_included || {};
    const hasFeature = featuresIncluded[feature] ?? tierConfig.features[feature];

    if (hasFeature) {
      return { allowed: true };
    }

    // Determine minimum tier required for this feature
    const upgradeRequired = this.getMinimumTierForFeature(feature);

    return {
      allowed: false,
      reason: `Feature '${feature}' requires ${TIER_CONFIGURATIONS[upgradeRequired].displayName}`,
      upgradeRequired
    };
  }

  /**
   * Check usage against limits
   */
  static checkUsageLimit(
    subscriptionPlan: SubscriptionPlan | null,
    limitType: UsageLimit,
    currentUsage: number
  ): FeatureGateResult {
    if (!subscriptionPlan) {
      return {
        allowed: false,
        reason: 'No active subscription plan',
        upgradeRequired: 'personal'
      };
    }

    const tier = subscriptionPlan.tier as SubscriptionTier;
    const tierConfig = TIER_CONFIGURATIONS[tier];
    
    if (!tierConfig) {
      return {
        allowed: false,
        reason: 'Invalid subscription tier'
      };
    }

    // Get limit from database plan or fallback to defaults
    const limitKey = `${limitType}_limit`;
    const limit = subscriptionPlan[limitKey] ?? tierConfig.limits[limitType];

    if (currentUsage < limit) {
      return { 
        allowed: true, 
        currentUsage, 
        limit 
      };
    }

    // Usage exceeded - suggest upgrade
    const upgradeRequired = this.getNextTierWithHigherLimit(tier, limitType, currentUsage);

    return {
      allowed: false,
      reason: `${limitType} limit exceeded (${currentUsage}/${limit})`,
      upgradeRequired,
      currentUsage,
      limit
    };
  }

  /**
   * Avatar creation enforcement
   */
  static canCreateAvatar(
    subscriptionPlan: SubscriptionPlan | null,
    currentAvatarsCount: number
  ): FeatureGateResult {
    return this.checkUsageLimit(subscriptionPlan, 'avatars', currentAvatarsCount + 1);
  }

  /**
   * Collection creation enforcement
   */
  static canCreateCollection(
    subscriptionPlan: SubscriptionPlan | null,
    currentCollectionsCount: number
  ): FeatureGateResult {
    return this.checkUsageLimit(subscriptionPlan, 'collections_per_avatar', currentCollectionsCount + 1);
  }

  /**
   * Get all available features for a subscription plan
   */
  static getAvailableFeatures(subscriptionPlan: SubscriptionPlan | null): SubscriptionFeature[] {
    if (!subscriptionPlan) return [];

    const tier = subscriptionPlan.tier as SubscriptionTier;
    const tierConfig = TIER_CONFIGURATIONS[tier];
    const featuresIncluded = subscriptionPlan.features_included || {};

    const availableFeatures: SubscriptionFeature[] = [];
    
    for (const feature of Object.keys(tierConfig.features) as SubscriptionFeature[]) {
      const hasFeature = featuresIncluded[feature] ?? tierConfig.features[feature];
      if (hasFeature) {
        availableFeatures.push(feature);
      }
    }

    return availableFeatures;
  }

  /**
   * Get usage summary for a subscription plan
   */
  static getUsageSummary(
    subscriptionPlan: SubscriptionPlan | null,
    usageData: UsageData
  ): Record<UsageLimit, FeatureGateResult> {
    const summary: Record<UsageLimit, FeatureGateResult> = {} as any;

    for (const limitType of Object.keys(TIER_CONFIGURATIONS.personal.limits) as UsageLimit[]) {
      const currentUsage = this.getCurrentUsageValue(usageData, limitType);
      summary[limitType] = this.checkUsageLimit(subscriptionPlan, limitType, currentUsage);
    }

    return summary;
  }

  /**
   * Helper: Get minimum tier required for a feature
   */
  private static getMinimumTierForFeature(feature: SubscriptionFeature): SubscriptionTier {
    const tiers: SubscriptionTier[] = ['personal', 'professional', 'enterprise'];
    
    for (const tier of tiers) {
      if (TIER_CONFIGURATIONS[tier].features[feature]) {
        return tier;
      }
    }
    
    return 'enterprise'; // Fallback to highest tier
  }

  /**
   * Helper: Get next tier with higher limit
   */
  private static getNextTierWithHigherLimit(
    currentTier: SubscriptionTier, 
    limitType: UsageLimit, 
    requiredUsage: number
  ): SubscriptionTier {
    const tiers: SubscriptionTier[] = ['personal', 'professional', 'enterprise'];
    const currentIndex = tiers.indexOf(currentTier);
    
    for (let i = currentIndex + 1; i < tiers.length; i++) {
      const tier = tiers[i];
      if (TIER_CONFIGURATIONS[tier].limits[limitType] >= requiredUsage) {
        return tier;
      }
    }
    
    return 'enterprise'; // Fallback to highest tier
  }

  /**
   * Helper: Extract current usage value from usage data
   */
  private static getCurrentUsageValue(usageData: UsageData, limitType: UsageLimit): number {
    switch (limitType) {
      case 'avatars':
        return usageData.avatarsCount;
      case 'collections_per_avatar':
        return usageData.collectionsCount;
      case 'sessions_per_month':
        return usageData.sessionsThisMonth;
      case 'data_retention_months':
        return usageData.dataRetentionMonths;
      default:
        return 0;
    }
  }

  /**
   * Format feature gate result for UI display
   */
  static formatFeatureGateMessage(result: FeatureGateResult, feature?: string): string {
    if (result.allowed) {
      return 'Feature available';
    }

    if (result.upgradeRequired) {
      const tierName = TIER_CONFIGURATIONS[result.upgradeRequired].displayName;
      return `${result.reason}. Upgrade to ${tierName} to unlock this feature.`;
    }

    return result.reason || 'Feature not available';
  }

  /**
   * Get plan comparison data for upgrade UI
   */
  static getPlanComparison(): Record<SubscriptionTier, {
    displayName: string;
    description: string;
    features: string[];
    limits: string[];
  }> {
    const comparison: Record<SubscriptionTier, any> = {} as any;

    for (const [tier, config] of Object.entries(TIER_CONFIGURATIONS)) {
      const enabledFeatures = Object.entries(config.features)
        .filter(([_, enabled]) => enabled)
        .map(([feature]) => feature);

      const limitsDisplay = Object.entries(config.limits)
        .map(([limit, value]) => `${limit}: ${value === 10000 ? 'Unlimited' : value}`);

      comparison[tier as SubscriptionTier] = {
        displayName: config.displayName,
        description: config.description,
        features: enabledFeatures,
        limits: limitsDisplay
      };
    }

    return comparison;
  }
}

// Export for convenience
export const subscriptionService = SubscriptionService; 