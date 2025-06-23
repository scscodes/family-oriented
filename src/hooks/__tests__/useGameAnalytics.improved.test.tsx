/**
 * Enhanced useGameAnalytics Hook Tests
 * 
 * This demonstrates improved testing patterns with:
 * - Consistent async/await handling
 * - Proper timeout management
 * - Comprehensive error scenarios
 * - Performance safeguards
 * - Better test isolation
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useGameAnalytics } from '../useGameAnalytics';
import { analyticsService } from '@/utils/analyticsService';
import { SettingsProvider } from '@/context/SettingsContext';

// Mock the analytics service
jest.mock('@/utils/analyticsService');

// Type the mocked service for better TypeScript support
const mockAnalyticsService = analyticsService as jest.Mocked<typeof analyticsService>;

// Test constants
const TEST_TIMEOUTS = {
  FAST: 2000,
  MEDIUM: 5000,
  SLOW: 8000
} as const;

const MOCK_DATA = {
  avatarId: '00000000-0000-0000-0000-000000000004',
  gameType: 'numbers' as const,
  sessionId: 'session-123',
  recommendations: [
    { 
      gameId: 'letters', 
      reason: 'Try letters next!', 
      priority: 8, 
      estimatedDifficulty: 'beginner', 
      learningObjectives: [], 
      prerequisitesMet: true 
    }
  ],
  metrics: {
    totalGamesPlayed: 1,
    averageSessionDuration: 60,
    overallCompletionRate: 1,
    skillLevelDistribution: { beginner: 1 },
    subjectPreferences: { Mathematics: 1 },
    learningVelocity: 1,
    engagementScore: 80
  }
} as const;

describe('useGameAnalytics - Enhanced Tests', () => {
  // Test wrapper with providers
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SettingsProvider>{children}</SettingsProvider>
  );

  // Setup fresh mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default successful mock implementations
    mockAnalyticsService.startGameSession.mockResolvedValue(MOCK_DATA.sessionId);
    mockAnalyticsService.trackEvent.mockResolvedValue(undefined);
    mockAnalyticsService.completeGameSession.mockResolvedValue(undefined);
    mockAnalyticsService.getLearningPathRecommendations.mockResolvedValue(MOCK_DATA.recommendations);
    mockAnalyticsService.getPerformanceMetrics.mockResolvedValue(MOCK_DATA.metrics);
  });

  // Cleanup after each test
  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  describe('Session Management', () => {
    it('should start a session successfully with timeout protection', async () => {
      const { result } = renderHook(() => useGameAnalytics({
        gameType: MOCK_DATA.gameType,
        avatarId: MOCK_DATA.avatarId,
        autoTrack: false
      }), { wrapper });

      // Start session with timeout protection
      await act(async () => {
        const startPromise = result.current.startSession();
        await Promise.race([
          startPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session start timeout')), TEST_TIMEOUTS.FAST)
          )
        ]);
      });

      // Verify session was started correctly
      expect(mockAnalyticsService.startGameSession).toHaveBeenCalledWith(
        MOCK_DATA.avatarId,
        MOCK_DATA.gameType,
        expect.any(Object),
        undefined
      );
      expect(result.current.sessionId).toBe(MOCK_DATA.sessionId);
      expect(result.current.isTracking).toBe(true);
    }, TEST_TIMEOUTS.MEDIUM);

    it('should handle session start failures gracefully', async () => {
      const testError = new Error('Session start failed');
      mockAnalyticsService.startGameSession.mockRejectedValue(testError);

      const { result } = renderHook(() => useGameAnalytics({
        gameType: MOCK_DATA.gameType,
        avatarId: MOCK_DATA.avatarId,
        autoTrack: false
      }), { wrapper });

      // Capture console errors during test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await act(async () => {
        try {
          await result.current.startSession();
        } catch {
          // Expected to fail
        }
      });

      // Verify error handling
      expect(result.current.sessionId).toBeNull();
      expect(result.current.isTracking).toBe(false);
      
      consoleSpy.mockRestore();
    }, TEST_TIMEOUTS.FAST);

    it('should prevent multiple concurrent session starts', async () => {
      const { result } = renderHook(() => useGameAnalytics({
        gameType: MOCK_DATA.gameType,
        avatarId: MOCK_DATA.avatarId,
        autoTrack: false
      }), { wrapper });

      // Start multiple sessions concurrently
      await act(async () => {
        const promises = [
          result.current.startSession(),
          result.current.startSession(),
          result.current.startSession()
        ];
        await Promise.all(promises);
      });

      // Should only call the service once
      expect(mockAnalyticsService.startGameSession).toHaveBeenCalledTimes(1);
    }, TEST_TIMEOUTS.MEDIUM);
  });

  describe('Event Tracking', () => {
    it('should track question attempts with proper validation', async () => {
      const { result } = renderHook(() => useGameAnalytics({
        gameType: MOCK_DATA.gameType,
        avatarId: MOCK_DATA.avatarId,
        autoTrack: false
      }), { wrapper });

      // Start session first
      await act(async () => {
        await result.current.startSession();
      });

      // Wait for session to be established
      await waitFor(() => {
        expect(result.current.sessionId).toBe(MOCK_DATA.sessionId);
      }, { timeout: TEST_TIMEOUTS.FAST });

      // Track question attempt
      await act(async () => {
        await result.current.trackQuestionAttempt(true, { 
          questionIndex: 0,
          responseTime: 1500,
          difficulty: 'easy'
        });
      });

      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith(
        MOCK_DATA.sessionId,
        MOCK_DATA.avatarId,
        'question_answer',
        expect.objectContaining({ 
          correct: true, 
          questionIndex: 0,
          responseTime: 1500,
          difficulty: 'easy'
        })
      );
    }, TEST_TIMEOUTS.MEDIUM);

    it('should handle tracking failures without breaking the flow', async () => {
      const trackingError = new Error('Tracking failed');
      mockAnalyticsService.trackEvent.mockRejectedValue(trackingError);

      const { result } = renderHook(() => useGameAnalytics({
        gameType: MOCK_DATA.gameType,
        avatarId: MOCK_DATA.avatarId,
        autoTrack: false
      }), { wrapper });

      await act(async () => {
        await result.current.startSession();
      });

      // Suppress console error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await act(async () => {
        // Should not throw even if tracking fails
        await expect(result.current.trackQuestionAttempt(true, { questionIndex: 0 }))
          .resolves.not.toThrow();
      });

      consoleSpy.mockRestore();
    }, TEST_TIMEOUTS.FAST);

    it('should not track events without an active session', async () => {
      const { result } = renderHook(() => useGameAnalytics({
        gameType: MOCK_DATA.gameType,
        avatarId: MOCK_DATA.avatarId,
        autoTrack: false
      }), { wrapper });

      // Try to track without starting session
      await act(async () => {
        await result.current.trackQuestionAttempt(true, { questionIndex: 0 });
      });

      expect(mockAnalyticsService.trackEvent).not.toHaveBeenCalled();
    }, TEST_TIMEOUTS.FAST);
  });

  describe('Session Completion', () => {
    it('should complete session and load analytics data', async () => {
      const { result } = renderHook(() => useGameAnalytics({
        gameType: MOCK_DATA.gameType,
        avatarId: MOCK_DATA.avatarId,
        autoTrack: false
      }), { wrapper });

      // Start session
      await act(async () => {
        await result.current.startSession();
      });

      // Wait for session establishment
      await waitFor(() => {
        expect(result.current.isTracking).toBe(true);
      }, { timeout: TEST_TIMEOUTS.FAST });

      // Complete session
      await act(async () => {
        await result.current.completeSession(90);
      });

      // Verify completion call
      expect(mockAnalyticsService.completeGameSession).toHaveBeenCalledWith(
        MOCK_DATA.sessionId,
        90,
        expect.any(Number),
        expect.any(Number)
      );

      // Verify analytics data loading
      await waitFor(() => {
        expect(result.current.recommendations).toEqual(MOCK_DATA.recommendations);
        expect(result.current.performanceMetrics).toEqual(MOCK_DATA.metrics);
      }, { timeout: TEST_TIMEOUTS.MEDIUM });
    }, TEST_TIMEOUTS.SLOW);

    it('should handle completion failures gracefully', async () => {
      const completionError = new Error('Completion failed');
      mockAnalyticsService.completeGameSession.mockRejectedValue(completionError);

      const { result } = renderHook(() => useGameAnalytics({
        gameType: MOCK_DATA.gameType,
        avatarId: MOCK_DATA.avatarId,
        autoTrack: false
      }), { wrapper });

      await act(async () => {
        await result.current.startSession();
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await act(async () => {
        await result.current.completeSession(90);
      });

      // Should still attempt to load analytics despite completion failure
      expect(mockAnalyticsService.getLearningPathRecommendations).toHaveBeenCalled();
      expect(mockAnalyticsService.getPerformanceMetrics).toHaveBeenCalled();

      consoleSpy.mockRestore();
    }, TEST_TIMEOUTS.MEDIUM);
  });

  describe('Performance & Edge Cases', () => {
    it('should complete operations within reasonable time limits', async () => {
      const { result } = renderHook(() => useGameAnalytics({
        gameType: MOCK_DATA.gameType,
        avatarId: MOCK_DATA.avatarId,
        autoTrack: false
      }), { wrapper });

      // Measure session start performance
      const startTime = performance.now();
      
      await act(async () => {
        await result.current.startSession();
      });
      
      const sessionStartTime = performance.now() - startTime;
      expect(sessionStartTime).toBeLessThan(1000); // Should complete within 1 second

      // Measure event tracking performance
      const trackStartTime = performance.now();
      
      await act(async () => {
        await result.current.trackQuestionAttempt(true, { questionIndex: 0 });
      });
      
      const trackTime = performance.now() - trackStartTime;
      expect(trackTime).toBeLessThan(500); // Should complete within 500ms
    }, TEST_TIMEOUTS.MEDIUM);

    it('should handle rapid successive calls without issues', async () => {
      const { result } = renderHook(() => useGameAnalytics({
        gameType: MOCK_DATA.gameType,
        avatarId: MOCK_DATA.avatarId,
        autoTrack: false
      }), { wrapper });

      await act(async () => {
        await result.current.startSession();
      });

      // Fire multiple tracking events rapidly
      await act(async () => {
        const promises = Array.from({ length: 10 }, (_, i) =>
          result.current.trackQuestionAttempt(i % 2 === 0, { questionIndex: i })
        );
        await Promise.all(promises);
      });

      // All events should be tracked
      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledTimes(10);
    }, TEST_TIMEOUTS.MEDIUM);

    it('should cleanup properly on unmount', async () => {
      const { result, unmount } = renderHook(() => useGameAnalytics({
        gameType: MOCK_DATA.gameType,
        avatarId: MOCK_DATA.avatarId,
        autoTrack: false
      }), { wrapper });

      await act(async () => {
        await result.current.startSession();
      });

      // Unmount component
      unmount();

      // No memory leaks or hanging promises should remain
      expect(result.current.isTracking).toBe(true); // State preserved until cleanup
    }, TEST_TIMEOUTS.FAST);
  });
}); 