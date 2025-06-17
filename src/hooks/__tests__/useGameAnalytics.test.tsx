import { renderHook, act, waitFor } from '@testing-library/react';
import { useGameAnalytics } from '../useGameAnalytics';
import { analyticsService } from '@/utils/analyticsService';
import { SettingsProvider } from '@/context/SettingsContext';

jest.mock('@/utils/analyticsService');

const mockAvatarId = '00000000-0000-0000-0000-000000000004';
const mockGameType = 'numbers';

const mockSessionId = 'session-123';

// Mock the analytics service methods
const mockAnalyticsService = analyticsService as jest.Mocked<typeof analyticsService>;

beforeEach(() => {
  jest.clearAllMocks();
  mockAnalyticsService.startGameSession.mockResolvedValue(mockSessionId);
  mockAnalyticsService.trackEvent.mockResolvedValue(undefined);
  mockAnalyticsService.completeGameSession.mockResolvedValue(undefined);
  mockAnalyticsService.getLearningPathRecommendations.mockResolvedValue([
    { gameId: 'letters', reason: 'Try letters next!', priority: 8, estimatedDifficulty: 'beginner', learningObjectives: [], prerequisitesMet: true }
  ]);
  mockAnalyticsService.getPerformanceMetrics.mockResolvedValue({
    totalGamesPlayed: 1,
    averageSessionDuration: 60,
    overallCompletionRate: 1,
    skillLevelDistribution: { beginner: 1 },
    subjectPreferences: { Mathematics: 1 },
    learningVelocity: 1,
    engagementScore: 80
  });
});

describe('useGameAnalytics', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SettingsProvider>{children}</SettingsProvider>
  );

  it('should start a session and track question attempts', async () => {
    const { result } = renderHook(() => useGameAnalytics({
      gameType: mockGameType,
      avatarId: mockAvatarId,
      autoTrack: false
    }), { wrapper });

    // Start session
    await act(async () => {
      await result.current.startSession();
    });
    expect(mockAnalyticsService.startGameSession).toHaveBeenCalledWith(
      mockAvatarId,
      mockGameType,
      expect.any(Object),
      undefined
    );
    expect(result.current.sessionId).toBe(mockSessionId);

    // Track question attempt
    await act(async () => {
      await result.current.trackQuestionAttempt(true, { questionIndex: 0 });
    });
    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith(
      mockSessionId,
      mockAvatarId,
      'question_answer',
      expect.objectContaining({ correct: true, questionIndex: 0 })
    );
  });

  it('should complete a session and load recommendations/metrics', async () => {
    const { result } = renderHook(() => useGameAnalytics({
      gameType: mockGameType,
      avatarId: mockAvatarId,
      autoTrack: false
    }), { wrapper });
    await act(async () => {
      await result.current.startSession();
    });
    // Wait for sessionId and isTracking to be set
    await waitFor(() => {
      expect(result.current.sessionId).toBe(mockSessionId);
      expect(result.current.isTracking).toBe(true);
    });
    await act(async () => {
      await result.current.completeSession(90);
    });
    expect(mockAnalyticsService.completeGameSession).toHaveBeenCalledWith(
      mockSessionId,
      90,
      expect.any(Number),
      expect.any(Number)
    );
    // Recommendations and metrics should be loaded
    expect(result.current.recommendations.length).toBeGreaterThan(0);
    expect(result.current.performanceMetrics).toBeDefined();
  });
}); 