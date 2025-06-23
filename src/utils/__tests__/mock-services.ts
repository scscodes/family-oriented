/**
 * Mock Service Factories
 * Creates consistent mocks for external services
 */

import { mockFactories } from './test-factories';
import { MOCK_IDS } from './test-constants';

export const mockServices = {
  /**
   * Creates a comprehensive analytics service mock
   */
  createAnalyticsServiceMock: () => ({
    startGameSession: jest.fn().mockResolvedValue(MOCK_IDS.SESSION),
    trackEvent: jest.fn().mockResolvedValue(undefined),
    completeGameSession: jest.fn().mockResolvedValue(undefined),
    getAvatarProgress: jest.fn().mockResolvedValue([mockFactories.createMockProgress()]),
    getLearningPathRecommendations: jest.fn().mockResolvedValue([
      { 
        gameId: 'letters', 
        reason: 'Try letters next!', 
        priority: 8, 
        estimatedDifficulty: 'beginner', 
        learningObjectives: [], 
        prerequisitesMet: true 
      }
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