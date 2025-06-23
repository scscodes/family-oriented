/**
 * Demo Configuration System
 * Allows testing different subscription tiers and user scenarios
 */

import type { SubscriptionTier } from './subscriptionService';

export interface DemoUserConfig {
  id: string;
  email: string;
  name?: string;
  tier: SubscriptionTier;
  roles: string[];
  avatarCount: number;
  orgName: string;
}

/**
 * Pre-configured demo scenarios for testing
 */
export const DEMO_SCENARIOS: Record<string, DemoUserConfig> = {
  // Personal plan scenarios
  personal_basic: {
    id: 'demo-personal-basic',
    email: 'personal@demo.com',
    name: 'Personal User',
    tier: 'personal',
    roles: ['account_owner'],
    avatarCount: 2,
    orgName: 'Personal Family'
  },
  
  personal_limit: {
    id: 'demo-personal-limit',
    email: 'personal-limit@demo.com', 
    name: 'Personal At Limit',
    tier: 'personal',
    roles: ['account_owner'],
    avatarCount: 5, // At the 5 avatar limit
    orgName: 'Full Personal Family'
  },

  // Professional plan scenarios  
  professional_educator: {
    id: 'demo-professional-educator',
    email: 'educator@demo.com',
    name: 'Professional Educator',
    tier: 'professional',
    roles: ['account_owner', 'org_admin', 'educator'],
    avatarCount: 15,
    orgName: 'Demo School District'
  },

  professional_admin: {
    id: 'demo-professional-admin',
    email: 'admin@demo.com',
    name: 'Professional Admin',
    tier: 'professional', 
    roles: ['account_owner', 'org_admin'],
    avatarCount: 25,
    orgName: 'Learning Center'
  },

  // Enterprise plan scenarios
  enterprise_full: {
    id: 'demo-enterprise-full',
    email: 'enterprise@demo.com',
    name: 'Enterprise Admin',
    tier: 'enterprise',
    roles: ['account_owner', 'org_admin', 'educator'],
    avatarCount: 150,
    orgName: 'Enterprise Education Corp'
  },

  // Limited role scenarios
  educator_only: {
    id: 'demo-educator-only',
    email: 'teacher@demo.com',
    name: 'Teacher User',
    tier: 'professional',
    roles: ['educator'], // No admin roles
    avatarCount: 0, // Can't create avatars
    orgName: 'School District'
  }
};

/**
 * Get demo configuration from localStorage, environment, or default
 */
export function getDemoConfig(): DemoUserConfig {
  // Priority: localStorage > environment > default
  let scenarioKey = 'professional_educator';
  
  if (typeof window !== 'undefined') {
    scenarioKey = localStorage.getItem('demo_scenario') || scenarioKey;
  }
  
  scenarioKey = process.env.NEXT_PUBLIC_DEMO_SCENARIO || scenarioKey;
  
  const scenario = DEMO_SCENARIOS[scenarioKey];
  
  if (!scenario) {
    console.warn(`Unknown demo scenario: ${scenarioKey}, falling back to professional_educator`);
    return DEMO_SCENARIOS.professional_educator;
  }
  
  console.log(`Using demo scenario: ${scenarioKey}`, scenario);
  return scenario;
}

/**
 * Generate subscription plan from demo config
 */
export function createDemoSubscriptionPlan(config: DemoUserConfig) {
  const tierConfig = {
    personal: {
      name: 'Personal Plan',
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
        advanced_reporting: false
      }
    },
    professional: {
      name: 'Professional Plan', 
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
        advanced_reporting: true
      }
    },
    enterprise: {
      name: 'Enterprise Plan',
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
        advanced_reporting: true
      }
    }
  };

  const planConfig = tierConfig[config.tier];
  
  return {
    id: `demo-${config.tier}-plan`,
    name: planConfig.name,
    tier: config.tier,
    avatar_limit: planConfig.avatar_limit,
    features_included: planConfig.features_included
  };
}

/**
 * Generate demo avatars based on config
 */
export function createDemoAvatars(config: DemoUserConfig) {
  const avatars = [];
  
  for (let i = 0; i < config.avatarCount; i++) {
    avatars.push({
      id: `${config.id}-avatar-${i + 1}`,
      user_id: config.id,
      org_id: `${config.id}-org`,
      name: `Demo Child ${i + 1}`,
      encrypted_pii: null,
      theme_settings: {},
      game_preferences: {},
      last_active: null,
      created_at: null,
      updated_at: null
    });
  }
  
  return avatars;
}

/**
 * Generate demo roles based on config
 */
export function createDemoRoles(config: DemoUserConfig) {
  const roleDefinitions = {
    account_owner: { id: 'role-account-owner', name: 'account_owner', description: 'Full administrative access' },
    org_admin: { id: 'role-org-admin', name: 'org_admin', description: 'Organization management' },
    educator: { id: 'role-educator', name: 'educator', description: 'Teaching and learning management' }
  };

  return config.roles.map(roleName => 
    roleDefinitions[roleName as keyof typeof roleDefinitions] || 
    { id: `role-${roleName}`, name: roleName, description: `${roleName} role` }
  );
}

/**
 * Demo scenario switching for development
 * 
 * @deprecated Use DemoContext.switchScenario() instead for smooth transitions
 * This function is kept for backward compatibility but will cause page reloads
 */
export function switchDemoScenario(scenarioKey: string) {
  console.warn('switchDemoScenario is deprecated. Use DemoContext.switchScenario() for smooth transitions.');
  
  if (typeof window !== 'undefined') {
    // Store scenario preference
    localStorage.setItem('demo_scenario', scenarioKey);
    // Reload to apply new scenario
    window.location.reload();
  }
}

/**
 * Get available demo scenarios for UI
 */
export function getAvailableScenarios() {
  return Object.entries(DEMO_SCENARIOS).map(([key, config]) => ({
    key,
    label: `${config.tier.toUpperCase()}: ${config.name || config.email}`,
    description: `${config.avatarCount} avatars, roles: ${config.roles.join(', ')}`,
    config
  }));
} 