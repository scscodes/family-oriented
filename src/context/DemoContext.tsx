/**
 * Demo Context - Smooth Demo Scenario Management
 * Manages demo scenario transitions without page reloads
 * Provides validation, loading states, and error handling
 */

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { logger } from '@/utils/logger';
import { 
  getDemoConfig, 
  getAvailableScenarios, 
  DEMO_SCENARIOS,
  type DemoUserConfig 
} from '@/utils/demoConfig';
import type { SubscriptionTier } from '@/utils/subscriptionService';

interface DemoContextType {
  // Current state
  currentScenario: string;
  currentConfig: DemoUserConfig;
  isTransitioning: boolean;
  error: string | null;
  
  // Available scenarios
  availableScenarios: Array<{
    key: string;
    label: string;
    description: string;
    config: DemoUserConfig;
  }>;
  
  // Actions
  switchScenario: (scenarioKey: string) => Promise<void>;
  validateScenarioSwitch: (scenarioKey: string) => { valid: boolean; reasons: string[] };
  clearError: () => void;
  
  // Utilities
  getCurrentTier: () => SubscriptionTier;
  getScenarioByTier: (tier: SubscriptionTier) => string | null;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [currentScenario, setCurrentScenario] = useState<string>('professional_educator');
  const [currentConfig, setCurrentConfig] = useState<DemoUserConfig>(() => getDemoConfig());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const availableScenarios = getAvailableScenarios();

  // Initialize current scenario from localStorage/environment
  useEffect(() => {
    const initializeScenario = () => {
      try {
        let scenarioKey = 'professional_educator';
        
        // Check localStorage first (browser only)
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('demo_scenario');
          if (stored && DEMO_SCENARIOS[stored]) {
            scenarioKey = stored;
          }
        }
        
        // Check environment variable
        const envScenario = process.env.NEXT_PUBLIC_DEMO_SCENARIO;
        if (envScenario && DEMO_SCENARIOS[envScenario]) {
          scenarioKey = envScenario;
        }
        
        const config = DEMO_SCENARIOS[scenarioKey];
        if (config) {
          setCurrentScenario(scenarioKey);
          setCurrentConfig(config);
          logger.info('Demo scenario initialized:', { scenarioKey, config });
        }
      } catch (err) {
        logger.error('Failed to initialize demo scenario:', err);
        setError('Failed to initialize demo mode');
      }
    };

    initializeScenario();
  }, []);

  // Validate scenario switch before applying
  const validateScenarioSwitch = useCallback((scenarioKey: string): { valid: boolean; reasons: string[] } => {
    const reasons: string[] = [];
    
    // Check if scenario exists
    if (!DEMO_SCENARIOS[scenarioKey]) {
      reasons.push(`Unknown scenario: ${scenarioKey}`);
    }
    
    // Check if already current scenario
    if (scenarioKey === currentScenario) {
      reasons.push('Already using this scenario');
    }
    
    // Add any business logic validation here
    // For example, check if user has unsaved changes, etc.
    
    return {
      valid: reasons.length === 0,
      reasons
    };
  }, [currentScenario]);

  // Smooth scenario switching without page reload
  const switchScenario = useCallback(async (scenarioKey: string): Promise<void> => {
    // Validate the switch first
    const validation = validateScenarioSwitch(scenarioKey);
    if (!validation.valid) {
      const errorMessage = `Cannot switch scenario: ${validation.reasons.join(', ')}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }

    setIsTransitioning(true);
    setError(null);

    try {
      const newConfig = DEMO_SCENARIOS[scenarioKey];
      if (!newConfig) {
        throw new Error(`Scenario ${scenarioKey} not found`);
      }

      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('demo_scenario', scenarioKey);
      }

      // Update state smoothly
      setCurrentScenario(scenarioKey);
      setCurrentConfig(newConfig);

      logger.info('Demo scenario switched successfully:', {
        from: currentScenario,
        to: scenarioKey,
        newConfig
      });

      // Dispatch custom event for other components to react
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('demoScenarioChanged', {
          detail: { scenarioKey, config: newConfig }
        }));
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch scenario';
      setError(errorMessage);
      logger.error('Demo scenario switch failed:', err);
      throw err;
    } finally {
      setIsTransitioning(false);
    }
  }, [currentScenario, validateScenarioSwitch]);

  // Utility functions
  const getCurrentTier = useCallback((): SubscriptionTier => {
    return currentConfig.tier;
  }, [currentConfig.tier]);

  const getScenarioByTier = useCallback((tier: SubscriptionTier): string | null => {
    // Find first scenario with matching tier
    const entry = Object.entries(DEMO_SCENARIOS).find(([, config]) => config.tier === tier);
    return entry ? entry[0] : null;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const contextValue: DemoContextType = {
    // Current state
    currentScenario,
    currentConfig,
    isTransitioning,
    error,
    
    // Available scenarios
    availableScenarios,
    
    // Actions
    switchScenario,
    validateScenarioSwitch,
    clearError,
    
    // Utilities
    getCurrentTier,
    getScenarioByTier
  };

  return (
    <DemoContext.Provider value={contextValue}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo(): DemoContextType {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}

// Hook for components that only need demo config without full context
export function useDemoConfig(): DemoUserConfig {
  const { currentConfig } = useDemo();
  return currentConfig;
}

// Hook for checking if we're in demo mode
export function useDemoMode(): boolean {
  try {
    useDemo();
    return true;
  } catch {
    return false;
  }
} 