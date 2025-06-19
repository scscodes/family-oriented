/**
 * useTierTransition Hook
 * Provides tier transition functionality for subscription plan changes
 * Handles analysis, validation, and execution of tier changes
 */

import { useState, useCallback, useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import { useSubscription } from '@/hooks/useSubscription';
import { 
  SubscriptionService, 
  type SubscriptionTier,
  type UsageData 
} from '@/utils/subscriptionService';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/utils/logger';

export interface TierTransitionAnalysis {
  fromTier: SubscriptionTier;
  toTier: SubscriptionTier;
  isUpgrade: boolean;
  isDowngrade: boolean;
  featureChanges: {
    gained: string[];
    lost: string[];
  };
  usageImpact: {
    overLimitItems: Array<{
      type: string;
      current: number;
      newLimit: number;
      impact: string;
    }>;
  };
  costImpact: {
    currentCost: number;
    newCost: number;
    monthlyDifference: number;
    prorationAmount: number;
    prorationDescription: string;
  };
  warnings: string[];
  canTransition: boolean;
}

export interface UseTierTransitionReturn {
  // Current state
  currentTier: SubscriptionTier | null;
  availableUpgrades: SubscriptionTier[];
  availableDowngrades: SubscriptionTier[];
  isLoading: boolean;
  error: string | null;
  
  // Analysis
  analyzeTransition: (targetTier: SubscriptionTier) => Promise<TierTransitionAnalysis>;
  
  // Execution
  executeTransition: (targetTier: SubscriptionTier) => Promise<{
    success: boolean;
    message: string;
  }>;
  
  // Utilities
  getTierDisplayName: (tier: SubscriptionTier) => string;
  getTierPrice: (tier: SubscriptionTier) => number;
  validateTransition: (targetTier: SubscriptionTier) => { valid: boolean; reasons: string[] };
  
  // State management
  clearError: () => void;
}

/**
 * Main tier transition hook
 */
export function useTierTransition(): UseTierTransitionReturn {
  const { org } = useUser();
  const { subscriptionPlan, tier, currentUsage } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  // Current tier and available transitions
  const currentTier = tier as SubscriptionTier | null;
  const { upgrades: availableUpgrades, downgrades: availableDowngrades } = useMemo(() => {
    if (!currentTier) return { upgrades: [], downgrades: [] };
    return SubscriptionService.getAvailableTransitions(currentTier);
  }, [currentTier]);

  // Get current usage data
  const getCurrentUsageData = useCallback(async (): Promise<UsageData> => {
    if (!org) {
      return {
        avatarsCount: 0,
        collectionsCount: 0,
        sessionsThisMonth: 0,
        dataRetentionMonths: 12
      };
    }

    try {
      // Get avatar count
      const { data: avatars } = await supabase
        .from('avatars')
        .select('id')
        .eq('org_id', org.id);

      // Get collections count (simplified - would normally be per-avatar)
      const { data: collections } = await supabase
        .from('game_collections')
        .select('id')
        .in('avatar_id', (avatars || []).map((a: { id: string }) => a.id));

      // Get sessions this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('id')
        .eq('org_id', org.id)
        .gte('created_at', startOfMonth.toISOString());

      return {
        avatarsCount: avatars?.length || 0,
        collectionsCount: collections?.length || 0,
        sessionsThisMonth: sessions?.length || 0,
        dataRetentionMonths: 12 // Default
      };
    } catch (err) {
      logger.error('Failed to get usage data:', err);
      return {
        avatarsCount: currentUsage.avatarsCount,
        collectionsCount: 0,
        sessionsThisMonth: 0,
        dataRetentionMonths: 12
      };
    }
  }, [org, supabase, currentUsage.avatarsCount]);

  // Analyze transition impact
  const analyzeTransition = useCallback(async (targetTier: SubscriptionTier): Promise<TierTransitionAnalysis> => {
    if (!currentTier || !subscriptionPlan) {
      throw new Error('No current subscription to analyze');
    }

    setIsLoading(true);
    setError(null);

    try {
      const usageData = await getCurrentUsageData();
      
      // Get basic analysis
      const analysis = SubscriptionService.analyzeTierTransition(currentTier, targetTier, usageData);
      
      // Get cost information
      const currentCost = parseFloat(subscriptionPlan.base_price.toString());
      const newCost = getTierPrice(targetTier);
      const monthlyDifference = newCost - currentCost;
      
      const proration = SubscriptionService.calculateProration(currentCost, newCost);

      return {
        fromTier: currentTier,
        toTier: targetTier,
        isUpgrade: analysis.isUpgrade,
        isDowngrade: analysis.isDowngrade,
        featureChanges: {
          gained: analysis.featureChanges.gained,
          lost: analysis.featureChanges.lost
        },
        usageImpact: {
          overLimitItems: analysis.usageImpact.overLimitItems
        },
        costImpact: {
          currentCost,
          newCost,
          monthlyDifference,
          prorationAmount: proration.prorationAmount,
          prorationDescription: proration.description
        },
        warnings: analysis.warnings,
        canTransition: analysis.canTransition
      };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze transition';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentTier, subscriptionPlan, getCurrentUsageData]);

  // Execute tier transition
  const executeTransition = useCallback(async (targetTier: SubscriptionTier): Promise<{
    success: boolean;
    message: string;
  }> => {
    if (!org || !currentTier) {
      throw new Error('No organization or current tier found');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate transition first
      const usageData = await getCurrentUsageData();
      const validation = SubscriptionService.validateTierTransition(currentTier, targetTier, usageData);
      
      if (!validation.valid) {
        throw new Error(`Transition not allowed: ${validation.reasons.join(', ')}`);
      }

      // Get new subscription plan
      const { data: newPlan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('tier', targetTier)
        .eq('active', true)
        .order('base_price', { ascending: true })
        .limit(1)
        .single();

      if (planError) throw planError;

      // Update organization subscription
      const { error: updateError } = await supabase
        .from('organizations')
        .update({
          subscription_plan_id: newPlan.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', org.id);

      if (updateError) throw updateError;

      // Log the transition
      logger.info('Tier transition completed:', {
        orgId: org.id,
        fromTier: currentTier,
        toTier: targetTier,
        timestamp: new Date().toISOString()
      });

      const tierDisplayName = getTierDisplayName(targetTier);
      const action = SubscriptionService.analyzeTierTransition(currentTier, targetTier, usageData).isUpgrade 
        ? 'upgraded' 
        : 'changed';

      return {
        success: true,
        message: `Successfully ${action} to ${tierDisplayName}!`
      };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to execute transition';
      setError(message);
      logger.error('Tier transition failed:', err);
      
      return {
        success: false,
        message
      };
    } finally {
      setIsLoading(false);
    }
  }, [org, currentTier, supabase, getCurrentUsageData]);

  // Utility functions
  const getTierDisplayName = useCallback((tier: SubscriptionTier): string => {
    const tierNames = {
      personal: 'Personal Plan',
      professional: 'Professional Plan',
      enterprise: 'Enterprise Plan'
    };
    return tierNames[tier];
  }, []);

  const getTierPrice = useCallback((tier: SubscriptionTier): number => {
    const prices = {
      personal: 9.99,
      professional: 199.99,
      enterprise: 1499.99
    };
    return prices[tier];
  }, []);

  const validateTransition = useCallback((targetTier: SubscriptionTier): { valid: boolean; reasons: string[] } => {
    if (!currentTier) {
      return { valid: false, reasons: ['No current tier found'] };
    }

    // Use current usage data synchronously (fallback values)
    const usageData: UsageData = {
      avatarsCount: currentUsage.avatarsCount,
      collectionsCount: 0, // Would need to fetch this
      sessionsThisMonth: 0, // Would need to fetch this
      dataRetentionMonths: 12
    };

    return SubscriptionService.validateTierTransition(currentTier, targetTier, usageData);
  }, [currentTier, currentUsage.avatarsCount]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Current state
    currentTier,
    availableUpgrades,
    availableDowngrades,
    isLoading,
    error,
    
    // Analysis
    analyzeTransition,
    
    // Execution
    executeTransition,
    
    // Utilities
    getTierDisplayName,
    getTierPrice,
    validateTransition,
    
    // State management
    clearError
  };
} 