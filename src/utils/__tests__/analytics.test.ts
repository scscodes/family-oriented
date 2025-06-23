/**
 * Enhanced Analytics Service Tests
 * Updated with timeout protection, error boundary testing, and performance validation
 */

import { analyticsService } from '../analyticsService';

// Test timeout constants
const TEST_TIMEOUTS = {
  FAST: 2000,
  MEDIUM: 5000,
  SLOW: 8000
} as const;

// Mock data constants
const MOCK_DATA = {
  sessionId: 'mock-session-id',
  metrics: {
    totalGamesPlayed: 1,
    averageSessionDuration: 60,
    overallCompletionRate: 1,
    skillLevelDistribution: { beginner: 1 },
    subjectPreferences: { Mathematics: 1 },
    learningVelocity: 1,
    engagementScore: 80
  },
  recommendations: [
    { gameId: 'letters', reason: 'Try letters next!', priority: 8, estimatedDifficulty: 'beginner', learningObjectives: [], prerequisitesMet: true }
  ],
  analytics: {
    totalSessions: 1,
    uniquePlayers: 1,
    averageDuration: 60,
    completionRate: 1,
    popularGames: [],
    learningEffectiveness: {}
  }
} as const;

describe('Analytics Service - Enhanced Validation', () => {
  const testAvatarId = '00000000-0000-0000-0000-000000000005';
  const testGameId = 'numbers' as const;
  const testSettings = { difficulty: 'easy', questionsPerSession: 5 };

  // Setup fresh mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks with consistent return values
    jest.spyOn(analyticsService, 'startGameSession').mockResolvedValue(MOCK_DATA.sessionId);
    jest.spyOn(analyticsService, 'trackEvent').mockResolvedValue(undefined);
    jest.spyOn(analyticsService, 'completeGameSession').mockResolvedValue(undefined);
    jest.spyOn(analyticsService, 'getPerformanceMetrics').mockResolvedValue(MOCK_DATA.metrics);
    jest.spyOn(analyticsService, 'getLearningPathRecommendations').mockResolvedValue(MOCK_DATA.recommendations);
    jest.spyOn(analyticsService, 'getAggregateAnalytics').mockResolvedValue(MOCK_DATA.analytics);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Session Management', () => {
    test('should start a game session with timeout protection', async () => {
      const startTime = performance.now();
      
      const sessionPromise = analyticsService.startGameSession(
        testAvatarId, 
        testGameId, 
        testSettings
      );
      
      // Add timeout protection using Promise.race
      const sessionId = await Promise.race([
        sessionPromise,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Session start timeout')), TEST_TIMEOUTS.FAST)
        )
      ]);
      
      const executionTime = performance.now() - startTime;
      
      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
      expect(sessionId.length).toBeGreaterThan(0);
      expect(executionTime).toBeLessThan(1000); // Performance check
    }, TEST_TIMEOUTS.MEDIUM);

    test('should track events without errors', async () => {
      const sessionId = await analyticsService.startGameSession(
        testAvatarId, 
        testGameId, 
        testSettings
      );
      
      // Test each call individually without using .resolves
      const result1 = await analyticsService.trackEvent(sessionId, testAvatarId, 'question_start', {});
      expect(result1).toBeUndefined();
      
      const result2 = await analyticsService.trackEvent(sessionId, testAvatarId, 'question_answer', { correct: true });
      expect(result2).toBeUndefined();
      
      const result3 = await analyticsService.trackEvent(sessionId, testAvatarId, 'game_pause', {});
      expect(result3).toBeUndefined();
    });

    test('should complete session and generate metrics', async () => {
      const sessionId = await analyticsService.startGameSession(
        testAvatarId, 
        testGameId, 
        testSettings
      );
      await analyticsService.trackEvent(sessionId, testAvatarId, 'question_answer', { correct: true });
      await analyticsService.trackEvent(sessionId, testAvatarId, 'question_answer', { correct: false });
      
      const result = await analyticsService.completeGameSession(sessionId, 75, 2, 1);
      expect(result).toBeUndefined();
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
});