jest.mock('@/utils/analyticsService');

import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '../page';
import { analyticsService } from '@/utils/analyticsService';
import * as UserContext from '@/context/UserContext';
import { UserProvider } from '@/context/UserContext';

const mockAvatar = { id: '00000000-0000-0000-0000-000000000003', name: 'Test Avatar' };

const mockProgress = [
  { gameId: 'numbers', skillLevel: 'beginner', masteryScore: 80, lastPlayed: new Date(), learningObjectivesMet: [], prerequisiteCompletion: {}, avatarId: '00000000-0000-0000-0000-000000000003', totalSessions: 2, averagePerformance: 80, improvementTrend: 'improving' }
];
const mockRecommendations = [
  { gameId: 'letters', reason: 'Try letters next!', priority: 8, estimatedDifficulty: 'beginner', learningObjectives: [], prerequisitesMet: true }
];
const mockMetrics = {
  totalGamesPlayed: 2,
  averageSessionDuration: 60,
  overallCompletionRate: 1,
  skillLevelDistribution: { beginner: 2 },
  subjectPreferences: { Mathematics: 2 },
  learningVelocity: 1,
  engagementScore: 80
};

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    analyticsService.getAvatarProgress.mockResolvedValue(mockProgress);
    analyticsService.getLearningPathRecommendations.mockResolvedValue(mockRecommendations);
    analyticsService.getPerformanceMetrics.mockResolvedValue(mockMetrics);
    jest.spyOn(UserContext, 'useAvatar').mockReturnValue({ currentAvatar: mockAvatar });
  });

  it('renders dashboard data', async () => {
    render(
      <UserProvider>
        <DashboardPage />
      </UserProvider>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Learning Progress Dashboard')).toBeInTheDocument();
      expect(screen.getByText('numbers')).toBeInTheDocument();
      expect(screen.getByText('letters')).toBeInTheDocument();
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    });
  });

  it('shows info if no avatar', async () => {
    jest.spyOn(UserContext, 'useAvatar').mockReturnValue({ currentAvatar: null });
    render(
      <UserProvider>
        <DashboardPage />
      </UserProvider>
    );
    expect(screen.getByText(/please select or create an avatar/i)).toBeInTheDocument();
  });

  it('shows error on analytics failure', async () => {
    analyticsService.getAvatarProgress.mockRejectedValue(new Error('fail'));
    render(
      <UserProvider>
        <DashboardPage />
      </UserProvider>
    );
    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('fail');
    });
  });
});
