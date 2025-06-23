/**
 * Test Data Factories
 * Functions for creating consistent mock data across tests
 */

import { MOCK_IDS } from './test-constants';

export const mockFactories = {
  /**
   * Creates a mock avatar with required properties
   */
  createMockAvatar: (overrides: Record<string, unknown> = {}) => ({
    id: MOCK_IDS.AVATAR,
    name: 'Test Avatar',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: MOCK_IDS.USER,
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
  createMockUser: (overrides: Record<string, unknown> = {}) => ({
    id: MOCK_IDS.USER,
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
  createMockProgress: (overrides: Record<string, unknown> = {}) => ({
    gameId: 'numbers' as const,
    skillLevel: 'beginner' as const,
    masteryScore: 80,
    lastPlayed: new Date(),
    learningObjectivesMet: [],
    prerequisiteCompletion: {},
    avatarId: MOCK_IDS.AVATAR,
    totalSessions: 2,
    averagePerformance: 80,
    improvementTrend: 'improving' as const,
    ...overrides
  }),

  /**
   * Creates mock analytics metrics
   */
  createMockMetrics: (overrides: Record<string, unknown> = {}) => ({
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