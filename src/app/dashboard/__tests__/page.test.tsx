jest.mock('@/utils/analyticsService');
jest.mock('@/features/analytics/components/DashboardCharts', () => {
  return function MockDashboardCharts() {
    return <div data-testid="dashboard-charts">Mock Charts</div>;
  };
});

import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '../page';
import { analyticsService } from '@/utils/analyticsService';
import * as UserContext from '@/context/UserContext';
import { UserProvider } from '@/context/UserContext';
import { act } from 'react';

// Create proper mock avatar with all required properties
const mockAvatar = { 
  id: '00000000-0000-0000-0000-000000000003', 
  name: 'Test Avatar',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  user_id: 'test-user',
  org_id: null,
  last_active: new Date().toISOString(),
  encrypted_pii: {},
  game_preferences: {},
  theme_settings: {}
};

const mockProgress = [
  { gameId: 'numbers' as const, skillLevel: 'beginner' as const, masteryScore: 80, lastPlayed: new Date(), learningObjectivesMet: [], prerequisiteCompletion: {}, avatarId: '00000000-0000-0000-0000-000000000003', totalSessions: 2, averagePerformance: 80, improvementTrend: 'improving' as const }
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

// Mock the analytics service methods
const mockAnalyticsService = analyticsService as jest.Mocked<typeof analyticsService>;

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAnalyticsService.getAvatarProgress.mockResolvedValue(mockProgress);
    mockAnalyticsService.getLearningPathRecommendations.mockResolvedValue(mockRecommendations);
    mockAnalyticsService.getPerformanceMetrics.mockResolvedValue(mockMetrics);
    
    // Mock consistent user context
    jest.spyOn(UserContext, 'useAvatar').mockReturnValue({ 
      currentAvatar: mockAvatar,
      avatars: [mockAvatar],
      setCurrentAvatar: jest.fn(),
      createAvatar: jest.fn()
    });
    jest.spyOn(UserContext, 'useUser').mockReturnValue({ 
      user: { id: 'test-user', email: 'test@example.com' },
      userProfile: null,
      avatars: [mockAvatar],
      currentAvatar: mockAvatar,
      loading: false,
      error: null,
      setCurrentAvatar: jest.fn(),
      createAvatar: jest.fn(),
      refreshAvatars: jest.fn(),
      signOut: jest.fn(),
      roles: [],
      org: {
        id: 'test-org',
        name: 'Test Organization',
        subscriptionPlan: {
          id: 'test-plan',
          name: 'Test Plan',
          tier: 'professional',
          avatar_limit: 30,
          features_included: {}
        }
      },
      hasRole: jest.fn().mockReturnValue(false),
      canAccess: jest.fn().mockReturnValue(false),
      getTierLimit: jest.fn().mockReturnValue(5),
      viewAsRole: null,
      viewAsAvatar: null,
      isViewAs: false,
      setViewAsRole: jest.fn(),
      setViewAsAvatar: jest.fn(),
      resetViewAs: jest.fn(),
      loadingState: { user: false, roles: false, avatars: false, isReady: true }
    });
    jest.spyOn(UserContext, 'useRoleGuard').mockReturnValue({
      hasRole: jest.fn().mockReturnValue(false),
      isReady: true,
      roles: []
    });
  });

  it('renders dashboard data', async () => {
    await act(async () => {
      render(
        <UserProvider>
          <DashboardPage />
        </UserProvider>
      );
    });
    
    // Check for basic dashboard elements
    await waitFor(() => {
      expect(screen.getByText('Learning Progress Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    }, { timeout: 8000 });
    
    // Check for analytics data being called
    expect(mockAnalyticsService.getAvatarProgress).toHaveBeenCalledWith(mockAvatar.id);
    expect(mockAnalyticsService.getLearningPathRecommendations).toHaveBeenCalledWith(mockAvatar.id);
    expect(mockAnalyticsService.getPerformanceMetrics).toHaveBeenCalledWith(mockAvatar.id);
    
    // Check that progress and recommendations sections are rendered
    await waitFor(() => {
      expect(screen.getByText('Learning Progress')).toBeInTheDocument();
      expect(screen.getByText('Recommended Learning Path')).toBeInTheDocument();
    });
  });

  it('shows info if no avatar', async () => {
    jest.spyOn(UserContext, 'useAvatar').mockReturnValue({ 
      currentAvatar: null,
      avatars: [],
      setCurrentAvatar: jest.fn()
    });
    await act(async () => {
      render(
        <UserProvider>
          <DashboardPage />
        </UserProvider>
      );
    });
    await waitFor(() => {
      expect(screen.getByText(/please select or create an avatar/i)).toBeInTheDocument();
    });
  });

  it('shows error on analytics failure', async () => {
    // Reset analytics mocks to return rejected promise
    mockAnalyticsService.getAvatarProgress.mockRejectedValue(new Error('fail'));
    mockAnalyticsService.getLearningPathRecommendations.mockRejectedValue(new Error('fail'));
    mockAnalyticsService.getPerformanceMetrics.mockRejectedValue(new Error('fail'));
    
    await act(async () => {
      render(
        <UserProvider>
          <DashboardPage />
        </UserProvider>
      );
    });
    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('fail');
    }, { timeout: 8000 });
  });
});
