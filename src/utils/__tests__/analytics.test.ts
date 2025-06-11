/**
 * Basic validation tests for analytics service
 */

import { analyticsService } from '../analyticsService';

// Mock all async Supabase calls
beforeAll(() => {
  jest.spyOn(analyticsService, 'startGameSession').mockImplementation(async () => 'mock-session-id');
  jest.spyOn(analyticsService, 'trackEvent').mockImplementation(async () => undefined);
  jest.spyOn(analyticsService, 'completeGameSession').mockImplementation(async () => undefined);
  jest.spyOn(analyticsService, 'getPerformanceMetrics').mockImplementation(async () => ({
    totalGamesPlayed: 1,
    averageSessionDuration: 60,
    overallCompletionRate: 1,
    skillLevelDistribution: { beginner: 1 },
    subjectPreferences: { Mathematics: 1 },
    learningVelocity: 1,
    engagementScore: 80
  }));
  jest.spyOn(analyticsService, 'getLearningPathRecommendations').mockImplementation(async () => ([
    { gameId: 'letters', reason: 'Try letters next!', priority: 8, estimatedDifficulty: 'beginner', learningObjectives: [], prerequisitesMet: true }
  ]));
  jest.spyOn(analyticsService, 'getAggregateAnalytics').mockImplementation(async () => ({
    totalSessions: 1,
    uniquePlayers: 1,
    averageDuration: 60,
    completionRate: 1,
    popularGames: [],
    learningEffectiveness: {}
  }));
});

describe('Analytics Service Validation', () => {
  const testAvatarId = 'test-avatar-123';
  const testGameId = 'numbers' as const;
  const testSettings = { difficulty: 'easy', questionsPerSession: 5 };

  test('should start a game session successfully', async () => {
    const sessionId = await analyticsService.startGameSession(
      testAvatarId, 
      testGameId, 
      testSettings
    );
    expect(sessionId).toBeDefined();
    expect(typeof sessionId).toBe('string');
    expect(sessionId.length).toBeGreaterThan(0);
  });

  test('should track events without errors', async () => {
    const sessionId = await analyticsService.startGameSession(
      testAvatarId, 
      testGameId, 
      testSettings
    );
    await expect(analyticsService.trackEvent(sessionId, testAvatarId, 'question_start', {})).resolves.toBeUndefined();
    await expect(analyticsService.trackEvent(sessionId, testAvatarId, 'question_answer', { correct: true })).resolves.toBeUndefined();
    await expect(analyticsService.trackEvent(sessionId, testAvatarId, 'game_pause', {})).resolves.toBeUndefined();
  });

  test('should complete session and generate metrics', async () => {
    const sessionId = await analyticsService.startGameSession(
      testAvatarId, 
      testGameId, 
      testSettings
    );
    await analyticsService.trackEvent(sessionId, testAvatarId, 'question_answer', { correct: true });
    await analyticsService.trackEvent(sessionId, testAvatarId, 'question_answer', { correct: false });
    await expect(analyticsService.completeGameSession(sessionId, 75, 2, 1)).resolves.toBeUndefined();
  });

  test('should generate performance metrics', async () => {
    const metrics = await analyticsService.getPerformanceMetrics(testAvatarId);
    expect(metrics).toBeDefined();
    expect(typeof metrics.totalGamesPlayed).toBe('number');
    expect(typeof metrics.averageSessionDuration).toBe('number');
    expect(typeof metrics.overallCompletionRate).toBe('number');
    expect(typeof metrics.engagementScore).toBe('number');
  });

  test('should generate learning path recommendations', async () => {
    const recommendations = await analyticsService.getLearningPathRecommendations(testAvatarId, 3);
    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations.length).toBeLessThanOrEqual(3);
    recommendations.forEach(rec => {
      expect(rec).toHaveProperty('gameId');
      expect(rec).toHaveProperty('reason');
      expect(rec).toHaveProperty('priority');
      expect(typeof rec.priority).toBe('number');
      expect(rec.priority).toBeGreaterThanOrEqual(1);
      expect(rec.priority).toBeLessThanOrEqual(10);
    });
  });

  test('should generate aggregate analytics', async () => {
    const analytics = await analyticsService.getAggregateAnalytics();
    expect(analytics).toBeDefined();
    expect(typeof analytics.totalSessions).toBe('number');
    expect(typeof analytics.uniquePlayers).toBe('number');
    expect(typeof analytics.averageDuration).toBe('number');
    expect(typeof analytics.completionRate).toBe('number');
    expect(Array.isArray(analytics.popularGames)).toBe(true);
  });
}); 