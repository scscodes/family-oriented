/**
 * Tests for enhanced SubscriptionService
 * Validates tier transitions, usage limits, and plan comparisons
 */

import { SubscriptionService, type SubscriptionTier, type UsageData } from '../subscriptionService';

// Mock subscription plans for testing
const mockPersonalPlan = {
  id: 'personal',
  tier: 'personal',
  avatar_limit: 3,
  active: true,
  created_at: '2025-01-01',
  addon_discount_percent: null,
  base_price: 9.99,
  basic_themes_included: true,
  custom_branding_included: false,
  data_retention_months: 12,
  priority_support: false,
  sessions_limit: 100
};

const mockProfessionalPlan = {
  id: 'professional',
  tier: 'professional',
  avatar_limit: 10,
  active: true,
  created_at: '2025-01-01',
  addon_discount_percent: 10,
  base_price: 19.99,
  basic_themes_included: true,
  custom_branding_included: true,
  data_retention_months: 24,
  priority_support: true,
  sessions_limit: 500
};

const mockUsageData: UsageData = {
  avatarsCount: 2,
  collectionsCount: 5,
  sessionsThisMonth: 25,
  dataRetentionMonths: 12
};

describe('SubscriptionService Enhanced Features', () => {
  
  describe('Tier Transition Analysis', () => {
    test('should analyze upgrade from personal to professional', () => {
      const analysis = SubscriptionService.analyzeTierTransition(
        'personal',
        'professional',
        mockUsageData
      );

      expect(analysis.isUpgrade).toBe(true);
      expect(analysis.canTransition).toBe(true);
      expect(analysis.costImpact.monthlyDifference).toBeGreaterThan(0);
      expect(analysis.featureChanges.gained.length).toBeGreaterThan(0);
      expect(analysis.warnings).toHaveLength(0);
    });

    test('should identify downgrade risks', () => {
      const highUsageData: UsageData = {
        avatarsCount: 8,
        collectionsCount: 15,
        sessionsThisMonth: 200,
        dataRetentionMonths: 24
      };

      const analysis = SubscriptionService.analyzeTierTransition(
        'professional',
        'personal',
        highUsageData
      );

      expect(analysis.isUpgrade).toBe(false);
      expect(analysis.canTransition).toBe(false);
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.featureChanges.lost.length).toBeGreaterThan(0);
    });

    test('should calculate proration correctly', () => {
      const analysis = SubscriptionService.analyzeTierTransition(
        'personal',
        'professional',
        mockUsageData
      );

      expect(analysis.costImpact.prorationAmount).toBeDefined();
      expect(analysis.costImpact.prorationDescription).toContain('billing cycle');
    });
  });

  describe('Plan Comparison', () => {
    test('should generate comprehensive plan comparison', () => {
      const comparison = SubscriptionService.getPlanComparison();

      expect(comparison.personal).toBeDefined();
      expect(comparison.professional).toBeDefined();
      expect(comparison.enterprise).toBeDefined();

      // Check that professional has more features than personal
      expect(comparison.professional.features.length).toBeGreaterThan(
        comparison.personal.features.length
      );
      
      // Check price progression
      expect(comparison.professional.price).toBeGreaterThan(comparison.personal.price);
      expect(comparison.enterprise.price).toBeGreaterThan(comparison.professional.price);
    });
  });

  describe('Available Transitions', () => {
    test('should return correct upgrade/downgrade options for personal tier', () => {
      const transitions = SubscriptionService.getAvailableTransitions('personal');
      
      expect(transitions.upgrades).toContain('professional');
      expect(transitions.upgrades).toContain('enterprise');
      expect(transitions.downgrades).toHaveLength(0);
    });

    test('should return correct options for professional tier', () => {
      const transitions = SubscriptionService.getAvailableTransitions('professional');
      
      expect(transitions.upgrades).toContain('enterprise');
      expect(transitions.downgrades).toContain('personal');
    });

    test('should return only downgrades for enterprise tier', () => {
      const transitions = SubscriptionService.getAvailableTransitions('enterprise');
      
      expect(transitions.upgrades).toHaveLength(0);
      expect(transitions.downgrades).toContain('professional');
      expect(transitions.downgrades).toContain('personal');
    });
  });

  describe('Usage Validation', () => {
    test('should allow avatar creation within limits', () => {
      const result = SubscriptionService.canCreateAvatar(mockPersonalPlan, 2);
      
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    test('should block avatar creation at limit', () => {
      const result = SubscriptionService.canCreateAvatar(mockPersonalPlan, 3);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('limit');
      expect(result.upgradeRequired).toBe('professional');
    });

    test('should validate tier transitions against usage', () => {
      const highUsageData: UsageData = {
        avatarsCount: 5,
        collectionsCount: 15,
        sessionsThisMonth: 200,
        dataRetentionMonths: 24
      };

      const validation = SubscriptionService.validateTierTransition(
        'professional',
        'personal',
        highUsageData
      );

      expect(validation.valid).toBe(false);
      expect(validation.reasons.length).toBeGreaterThan(0);
    });
  });

  describe('Feature Access Control', () => {
    test('should grant analytics access for professional plan', () => {
      const result = SubscriptionService.canAccessFeature(mockProfessionalPlan, 'analytics');
      
      expect(result.allowed).toBe(true);
    });

    test('should deny user management for personal plan', () => {
      const result = SubscriptionService.canAccessFeature(mockPersonalPlan, 'user_management');
      
      expect(result.allowed).toBe(false);
      expect(result.upgradeRequired).toBe('professional');
    });

    test('should return correct available features for each tier', () => {
      const personalFeatures = SubscriptionService.getAvailableFeatures(mockPersonalPlan);
      const professionalFeatures = SubscriptionService.getAvailableFeatures(mockProfessionalPlan);

      expect(personalFeatures).not.toContain('user_management');
      expect(professionalFeatures).toContain('user_management');
      expect(professionalFeatures).toContain('analytics');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid tier transitions gracefully', () => {
      expect(() => {
        SubscriptionService.analyzeTierTransition(
          'invalid' as SubscriptionTier,
          'professional',
          mockUsageData
        );
      }).not.toThrow();
    });

    test('should handle null subscription plans', () => {
      const result = SubscriptionService.canAccessFeature(null, 'analytics');
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('subscription plan');
    });
  });

  describe('Usage Summary', () => {
    test('should generate complete usage summary', () => {
      const summary = SubscriptionService.getUsageSummary(mockPersonalPlan, mockUsageData);
      
      expect(summary.avatars).toBeDefined();
      expect(summary.collections_per_avatar).toBeDefined();
      expect(summary.sessions_per_month).toBeDefined();
      expect(summary.data_retention_months).toBeDefined();

      // Should show green status for within limits
      expect(summary.avatars.allowed).toBe(true);
    });

    test('should identify over-limit usage in summary', () => {
      const overLimitUsage: UsageData = {
        avatarsCount: 5,
        collectionsCount: 25,
        sessionsThisMonth: 150,
        dataRetentionMonths: 18
      };

      const summary = SubscriptionService.getUsageSummary(mockPersonalPlan, overLimitUsage);
      
      // Should show red status for over limits
      expect(summary.avatars.allowed).toBe(false);
    });
  });
}); 