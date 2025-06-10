/**
 * Basic validation tests for analytics service
 */

import { analyticsService } from '../analyticsService';

describe('Analytics Service Validation', () => {
  const testAvatarId = 'test-avatar-123';
  const testGameId = 'numbers' as const;
  const testSettings = { difficulty: 'easy', questionsPerSession: 5 };

  test('should start a game session successfully', () => {
    const sessionId = analyticsService.startGameSession(
      testAvatarId, 
      testGameId, 
      testSettings
    );
    
    expect(sessionId).toBeDefined();
    expect(typeof sessionId).toBe('string');
    expect(sessionId.length).toBeGreaterThan(0);
  });

  test('should track events without errors', () => {
    const sessionId = analyticsService.startGameSession(
      testAvatarId, 
      testGameId, 
      testSettings
    );
    
    expect(() => {
      analyticsService.trackEvent(sessionId, testAvatarId, 'question_start', {});
      analyticsService.trackEvent(sessionId, testAvatarId, 'question_answer', { correct: true });
      analyticsService.trackEvent(sessionId, testAvatarId, 'game_pause', {});
    }).not.toThrow();
  });

  test('should complete session and generate metrics', () => {
    const sessionId = analyticsService.startGameSession(
      testAvatarId, 
      testGameId, 
      testSettings
    );
    
    // Track some events
    analyticsService.trackEvent(sessionId, testAvatarId, 'question_answer', { correct: true });
    analyticsService.trackEvent(sessionId, testAvatarId, 'question_answer', { correct: false });
    
    expect(() => {
      analyticsService.completeGameSession(sessionId, 75, 2, 1);
    }).not.toThrow();
  });

  test('should generate performance metrics', () => {
    const metrics = analyticsService.getPerformanceMetrics(testAvatarId);
    
    expect(metrics).toBeDefined();
    expect(typeof metrics.totalGamesPlayed).toBe('number');
    expect(typeof metrics.averageSessionDuration).toBe('number');
    expect(typeof metrics.overallCompletionRate).toBe('number');
    expect(typeof metrics.engagementScore).toBe('number');
  });

  test('should generate learning path recommendations', () => {
    const recommendations = analyticsService.getLearningPathRecommendations(testAvatarId, 3);
    
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

  test('should generate aggregate analytics', () => {
    const analytics = analyticsService.getAggregateAnalytics();
    
    expect(analytics).toBeDefined();
    expect(typeof analytics.totalSessions).toBe('number');
    expect(typeof analytics.uniquePlayers).toBe('number');
    expect(typeof analytics.averageDuration).toBe('number');
    expect(typeof analytics.completionRate).toBe('number');
    expect(Array.isArray(analytics.popularGames)).toBe(true);
  });
}); 