/**
 * Enhanced useGameAnalytics Hook Tests
 * Updated to use new testing standards with simplified approach
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { useGameAnalytics } from '../useGameAnalytics';
import { analyticsService } from '@/utils/analyticsService';

// Mock the analytics service
jest.mock('@/utils/analyticsService', () => ({
  analyticsService: {
    trackGameSession: jest.fn(),
    trackQuestionAttempt: jest.fn(),
    getAvatarProgress: jest.fn(),
    getPerformanceMetrics: jest.fn(),
    getLearningPathRecommendations: jest.fn(),
  },
}));

// Test timeout constants
const TEST_TIMEOUTS = {
  FAST: 2000,
  MEDIUM: 5000,
  SLOW: 8000
} as const;

// Test data constants
const MOCK_DATA = {
  avatarId: '00000000-0000-0000-0000-000000000004',
  gameType: 'numbers' as const,
  sessionId: 'session-123',
  recommendations: [
    { gameId: 'letters', reason: 'Try letters next!', priority: 8, estimatedDifficulty: 'beginner', learningObjectives: [], prerequisitesMet: true }
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

// Type the mocked service
const mockAnalyticsService = analyticsService as jest.Mocked<typeof analyticsService>;

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
});

describe('useGameAnalytics', () => {
  // Test wrapper
  const wrapper = ({ children }: { children: React.ReactNode }) => <>{children}</>;

  describe('Session Management', () => {
    it('should start a session successfully', async () => {
      const { result } = renderHook(() => useGameAnalytics({
        gameType: MOCK_DATA.gameType,
        avatarId: MOCK_DATA.avatarId,
        autoTrack: false
      }), { wrapper });

      // Start session without timeout complexity
      await act(async () => {
        await result.current.startSession();
      });

      expect(mockAnalyticsService.startGameSession).toHaveBeenCalledWith(
        MOCK_DATA.avatarId,
        MOCK_DATA.gameType,
        expect.any(Object),
        undefined
      );
      expect(result.current.sessionId).toBe(MOCK_DATA.sessionId);
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

      expect(result.current.sessionId).toBeNull();
      expect(result.current.isTracking).toBe(false);
      consoleSpy.mockRestore();
    }, TEST_TIMEOUTS.FAST);
  });

  describe('Event Tracking', () => {
    it('should track question attempts with validation', async () => {
      const { result } = renderHook(() => useGameAnalytics({
        gameType: MOCK_DATA.gameType,
        avatarId: MOCK_DATA.avatarId,
        autoTrack: false
      }), { wrapper });

      await act(async () => {
        await result.current.startSession();
      });

      await waitFor(() => {
        expect(result.current.sessionId).toBe(MOCK_DATA.sessionId);
      }, { timeout: TEST_TIMEOUTS.FAST });

      await act(async () => {
        await result.current.trackQuestionAttempt(true, { 
          questionIndex: 0,
          responseTime: 1500
        });
      });

      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith(
        MOCK_DATA.sessionId,
        MOCK_DATA.avatarId,
        'question_answer',
        expect.objectContaining({ 
          correct: true, 
          questionIndex: 0,
          responseTime: 1500
        })
      );
    }, TEST_TIMEOUTS.MEDIUM);
  });

  describe('Session Completion', () => {
    it('should complete session and load analytics data', async () => {
      const { result } = renderHook(() => useGameAnalytics({
        gameType: MOCK_DATA.gameType,
        avatarId: MOCK_DATA.avatarId,
        autoTrack: false
      }), { wrapper });

      await act(async () => {
        await result.current.startSession();
      });

      await waitFor(() => {
        expect(result.current.isTracking).toBe(true);
      }, { timeout: TEST_TIMEOUTS.FAST });

      await act(async () => {
        await result.current.completeSession(90);
      });

      expect(mockAnalyticsService.completeGameSession).toHaveBeenCalledWith(
        MOCK_DATA.sessionId,
        90,
        expect.any(Number),
        expect.any(Number)
      );

      await waitFor(() => {
        expect(result.current.recommendations).toEqual(MOCK_DATA.recommendations);
        expect(result.current.performanceMetrics).toEqual(MOCK_DATA.metrics);
      }, { timeout: TEST_TIMEOUTS.MEDIUM });
    }, TEST_TIMEOUTS.SLOW);
  });
}); 