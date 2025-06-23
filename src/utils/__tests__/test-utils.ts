/**
 * Standardized Test Utilities
 * 
 * This file provides consistent testing patterns, mocks, and utilities
 * to ensure reliable and maintainable tests across the application.
 */

import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { UserProvider } from '@/context/UserContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { ThemeProvider } from '@/theme/ThemeProvider';

// Test timeout constants
export const TEST_TIMEOUTS = {
  IMMEDIATE: 0,
  FAST: 1000,
  MEDIUM: 3000,
  SLOW: 6000,
  INTEGRATION: 10000,
  CRITICAL: 15000
} as const;

// Mock data factories
export const mockFactories = {
  /**
   * Creates a mock avatar with required properties
   */
  createMockAvatar: (overrides: Partial<any> = {}) => ({
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Test Avatar',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'test-user',
    org_id: null,
    last_active: new Date().toISOString(),
    encrypted_pii: {},
    game_preferences: {},
    theme_settings: {},
    ...overrides
  }),

  /**
   * Creates mock user data
   */
  createMockUser: (overrides: Partial<any> = {}) => ({
    id: 'test-user',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    ...overrides
  }),

  /**
   * Creates mock progress data
   */
  createMockProgress: (overrides: Partial<any> = {}) => ({
    gameId: 'numbers' as const,
    skillLevel: 'beginner' as const,
    masteryScore: 80,
    lastPlayed: new Date(),
    learningObjectivesMet: [],
    prerequisiteCompletion: {},
    avatarId: '00000000-0000-0000-0000-000000000001',
    totalSessions: 2,
    averagePerformance: 80,
    improvementTrend: 'improving' as const,
    ...overrides
  }),

  /**
   * Creates mock analytics metrics
   */
  createMockMetrics: (overrides: Partial<any> = {}) => ({
    totalGamesPlayed: 2,
    averageSessionDuration: 60,
    overallCompletionRate: 1,
    skillLevelDistribution: { beginner: 2 },
    subjectPreferences: { Mathematics: 2 },
    learningVelocity: 1,
    engagementScore: 80,
    ...overrides
  })
};

// Async utilities with timeout protection
export const asyncUtils = {
  /**
   * Waits for a condition to be true with timeout protection
   */
  waitForCondition: async (
    condition: () => boolean,
    timeout: number = TEST_TIMEOUTS.MEDIUM,
    interval: number = 100
  ): Promise<void> => {
    const startTime = Date.now();
    
    while (!condition() && Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    if (!condition()) {
      throw new Error(`Condition not met within ${timeout}ms`);
    }
  },

  /**
   * Creates a controlled promise for testing async operations
   */
  createControlledPromise: <T>() => {
    let resolve!: (value: T) => void;
    let reject!: (reason?: any) => void;
    
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    
    return { promise, resolve, reject };
  },

  /**
   * Creates a promise that resolves after a delay
   */
  delay: (ms: number): Promise<void> => 
    new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Wraps an async function with timeout protection
   */
  withTimeout: async <T>(
    promise: Promise<T>,
    timeout: number = TEST_TIMEOUTS.MEDIUM,
    errorMessage?: string
  ): Promise<T> => {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage || `Operation timed out after ${timeout}ms`)), timeout)
    );
    
    return Promise.race([promise, timeoutPromise]);
  }
};

// Mock service factories
export const mockServices = {
  /**
   * Creates a comprehensive analytics service mock
   */
  createAnalyticsServiceMock: () => ({
    startGameSession: jest.fn().mockResolvedValue('mock-session-id'),
    trackEvent: jest.fn().mockResolvedValue(undefined),
    completeGameSession: jest.fn().mockResolvedValue(undefined),
    getAvatarProgress: jest.fn().mockResolvedValue([mockFactories.createMockProgress()]),
    getLearningPathRecommendations: jest.fn().mockResolvedValue([
      { gameId: 'letters', reason: 'Try letters next!', priority: 8, estimatedDifficulty: 'beginner', learningObjectives: [], prerequisitesMet: true }
    ]),
    getPerformanceMetrics: jest.fn().mockResolvedValue(mockFactories.createMockMetrics()),
    getAggregateAnalytics: jest.fn().mockResolvedValue({
      totalSessions: 1,
      uniquePlayers: 1,
      averageDuration: 60,
      completionRate: 1,
      popularGames: [],
      learningEffectiveness: {}
    })
  }),

  /**
   * Creates a Supabase client mock with common patterns
   */
  createSupabaseMock: () => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      then: jest.fn().mockResolvedValue({ data: [], error: null })
    })),
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
        error: null
      }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null })
    }
  })
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  includeProviders?: boolean;
  userContextValue?: any;
  settingsContextValue?: any;
}

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult => {
  const {
    includeProviders = true,
    userContextValue,
    settingsContextValue,
    ...renderOptions
  } = options;

  const Wrapper = ({ children }: { children: ReactNode }) => {
    if (!includeProviders) {
      return <>{children}</>;
    }

    return (
      <ThemeProvider>
        <UserProvider value={userContextValue}>
          <SettingsProvider value={settingsContextValue}>
            {children}
          </SettingsProvider>
        </UserProvider>
      </ThemeProvider>
    );
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Test isolation utilities
export const testIsolation = {
  /**
   * Cleans up after each test to prevent state leakage
   */
  cleanupAfterEach: () => {
    afterEach(() => {
      // Clear all mocks
      jest.clearAllMocks();
      
      // Clear localStorage
      localStorage.clear();
      
      // Clear any remaining timers
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
      
      // Clear fetch mock
      if (global.fetch && jest.isMockFunction(global.fetch)) {
        (global.fetch as jest.Mock).mockClear();
      }
    });
  },

  /**
   * Sets up fresh mocks before each test
   */
  setupBeforeEach: (setupFn?: () => void) => {
    beforeEach(() => {
      // Reset all mocks to fresh state
      jest.resetAllMocks();
      
      // Setup fresh localStorage
      localStorage.clear();
      
      // Run custom setup
      if (setupFn) {
        setupFn();
      }
    });
  }
};

// Error simulation utilities
export const errorSimulation = {
  /**
   * Creates a mock that fails after n successful calls
   */
  createFailingMock: <T>(successfulCalls: number, errorToThrow: Error, returnValue?: T) => {
    let callCount = 0;
    return jest.fn(() => {
      callCount++;
      if (callCount > successfulCalls) {
        throw errorToThrow;
      }
      return returnValue;
    });
  },

  /**
   * Creates a mock that randomly fails based on failure rate
   */
  createRandomlyFailingMock: <T>(failureRate: number, errorToThrow: Error, returnValue?: T) => {
    return jest.fn(() => {
      if (Math.random() < failureRate) {
        throw errorToThrow;
      }
      return returnValue;
    });
  },

  /**
   * Creates a mock promise that rejects after a delay
   */
  createDelayedRejection: (error: Error, delay: number = 100) => {
    return jest.fn(() => 
      new Promise((_, reject) => setTimeout(() => reject(error), delay))
    );
  }
};

// Performance testing utilities
export const performanceUtils = {
  /**
   * Measures execution time of a function
   */
  measureExecutionTime: async <T>(fn: () => Promise<T>): Promise<{ result: T; timeMs: number }> => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    return { result, timeMs: end - start };
  },

  /**
   * Ensures a function completes within expected time
   */
  expectTimely: async <T>(
    fn: () => Promise<T>,
    maxTimeMs: number,
    message?: string
  ): Promise<T> => {
    const { result, timeMs } = await performanceUtils.measureExecutionTime(fn);
    
    if (timeMs > maxTimeMs) {
      throw new Error(
        message || `Operation took ${timeMs}ms, expected less than ${maxTimeMs}ms`
      );
    }
    
    return result;
  }
}; 