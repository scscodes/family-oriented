"use client";

import React, { useEffect, useState } from "react";
import { useAvatar, useUser, useRoleGuard } from "@/context/UserContext";
import { useDemo } from "@/context/DemoContext";
import { analyticsService, type LearningProgressData, type PerformanceMetrics } from "@/utils/analyticsService";
import { logger } from "@/utils/logger";
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Button, 
  Card, 
  CardContent
} from "@mui/material";
import { Settings } from '@mui/icons-material';
import dynamic from 'next/dynamic';

import { FeatureGate, UsageOverview, SubscriptionBadge } from '@/shared/components';
import { useSubscription } from '@/hooks/useSubscription';
import { useEnhancedTheme } from '@/theme/EnhancedThemeProvider';

// Dynamically import DashboardCharts to avoid SSR issues with Chart.js
const DashboardCharts = dynamic(() => import('@/features/analytics/components/DashboardCharts'), {
  ssr: false,
  loading: () => (
    <Box sx={{ p: 2, textAlign: 'center' }}>
      <CircularProgress />
    </Box>
  )
});

/**
 * Check if all contexts are ready for dashboard rendering
 */
function useIsDashboardReady() {
  const { isHydrated } = useEnhancedTheme();
  const { loadingState } = useUser();
  const { isTransitioning } = useDemo();
  
  // Wait for theme, user context, and no ongoing demo transitions
  return isHydrated && loadingState.isReady && !isTransitioning;
}

/**
 * User Dashboard page for learning progress, recommendations, and metrics.
 * Focuses on robust data flow and error handling.
 * Uses role guard to prevent flashing of admin-only content.
 * Enhanced with demo context awareness for smooth scenario switching.
 */
export default function DashboardPage() {
  const isDashboardReady = useIsDashboardReady();
  const { currentAvatar } = useAvatar();
  const { error: userError, loadingState } = useUser();
  const { hasRole, isReady } = useRoleGuard();
  const { isTransitioning, currentScenario, error: demoError } = useDemo();
  const { } = useSubscription();
  const avatarId = currentAvatar?.id;

  const [progress, setProgress] = useState<LearningProgressData[] | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastLoadedAvatarId, setLastLoadedAvatarId] = useState<string | null>(null);

  // Enhanced analytics loading with demo scenario awareness
  useEffect(() => {
    const loadData = async () => {
      // Don't load during demo transitions
      if (isTransitioning) {
        logger.debug('Skipping analytics load during demo transition');
        return;
      }

      // Wait for user context to be ready
      if (!loadingState.isReady) {
        logger.debug('Waiting for user context to be ready');
        return;
      }

      if (!avatarId) {
        logger.debug('No avatar ID, clearing dashboard data');
        setProgress(null);
        setMetrics(null);
        setDashboardLoading(false);
        setLastLoadedAvatarId(null);
        return;
      }

      // Skip if already loaded for this avatar (prevents unnecessary reloads)
      if (lastLoadedAvatarId === avatarId) {
        logger.debug('Analytics already loaded for this avatar:', avatarId);
        return;
      }

      setDashboardLoading(true);
      setError(null);

      try {
        logger.info('🔄 Loading analytics data for avatar:', avatarId, 'in scenario:', currentScenario);

        const [progressData, metricsData] = await Promise.all([
          analyticsService.getAvatarProgress(avatarId),
          analyticsService.getPerformanceMetrics(avatarId)
        ]);

        logger.debug('📊 Analytics data loaded successfully:', { 
          progress: progressData?.length || 0, 
          metrics: metricsData?.totalGamesPlayed || 0,
          avatarId,
          scenario: currentScenario
        });

        setProgress(progressData);
        setMetrics(metricsData);
        setLastLoadedAvatarId(avatarId);
        
      } catch (err) {
        logger.error('❌ Error loading analytics data:', {
          error: err,
          avatarId,
          scenario: currentScenario,
          isDemo: avatarId?.startsWith('demo-') || avatarId?.startsWith('00000000')
        });
        
        const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics data';
        setError(`Analytics Error: ${errorMessage}`);
        
        // Clear data on error
        setProgress(null);
        setMetrics(null);
        setLastLoadedAvatarId(null);
      } finally {
        setDashboardLoading(false);
      }
    };

    loadData();
  }, [avatarId, isTransitioning, loadingState.isReady, currentScenario, lastLoadedAvatarId]);

  // Reset loading state when demo scenario changes
  useEffect(() => {
    if (isTransitioning) {
      logger.debug('Demo transition started, resetting dashboard state');
      setError(null);
      setLastLoadedAvatarId(null); // Force reload after transition
    }
  }, [isTransitioning]);

  // Handle demo scenario transition loading
  if (isTransitioning) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>Switching demo scenario...</Typography>
      </Box>
    );
  }

  // Wait for full hydration before showing dashboard
  if (!isDashboardReady) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  // Handle demo context errors
  if (demoError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          Demo Error: {demoError}
          <br />
          <Button variant="outlined" sx={{ mt: 1 }} onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </Alert>
      </Box>
    );
  }

  // Handle user context errors
  if (userError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          User Context Error: {userError}
          <br />
          <Button variant="outlined" sx={{ mt: 1 }} onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </Alert>
      </Box>
    );
  }

  // Handle no avatar case
  if (!avatarId) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No avatar selected. Please create or select an avatar to view your dashboard.
        {currentScenario && (
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
            Current demo scenario: {currentScenario}
          </Typography>
        )}
      </Alert>
    );
  }

  // Handle loading state
  if (dashboardLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading analytics for {currentAvatar?.name || 'avatar'}...
        </Typography>
      </Box>
    );
  }

  // Handle analytics errors
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert 
          severity="warning" 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => {
                setError(null);
                setLastLoadedAvatarId(null);
              }}
            >
              Retry
            </Button>
          }
        >
          {error}
          <Typography variant="body2" sx={{ mt: 1 }}>
            Avatar: {currentAvatar?.name} ({avatarId})
            <br />
            Scenario: {currentScenario}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Subscription Badge */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentAvatar?.name} • {currentScenario}
          </Typography>
        </Box>
        <SubscriptionBadge variant="basic" />
      </Box>

      {/* Feature Gate for Analytics */}
      <FeatureGate 
        feature="analytics" 
        mode="alert"
        fallback={
          <Alert severity="warning" sx={{ mb: 3 }}>
            Analytics dashboard requires a subscription plan. Please upgrade to access learning insights.
          </Alert>
        }
      >
        {/* Subscription Usage Overview */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Subscription Usage
            </Typography>
            <UsageOverview compact={true} />
          </CardContent>
        </Card>

        {/* Advanced Reporting Gate */}
        <FeatureGate 
          feature="advanced_reporting" 
          mode="overlay"
          fallback={
            <Alert severity="info" sx={{ mb: 2 }}>
              Advanced reporting requires Professional plan. Upgrade to access detailed analytics.
            </Alert>
          }
        >
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Advanced Analytics
              </Typography>
              <DashboardCharts 
                progress={progress || []}
                metrics={metrics || {
                  totalGamesPlayed: 0,
                  averageSessionDuration: 0,
                  overallCompletionRate: 0,
                  skillLevelDistribution: {},
                  subjectPreferences: {},
                  learningVelocity: 0,
                  engagementScore: 0
                }}
              />
            </CardContent>
          </Card>
        </FeatureGate>

        {/* Regular Analytics Content */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
          gap: 3 
        }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Learning Progress
              </Typography>
              {progress && progress.length > 0 ? (
                <Box>
                  {progress.map((p, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="body1">{p.gameId}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Mastery: {p.masteryScore}% • Level: {p.skillLevel}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No progress data available yet. Play some games to see your progress!
                </Typography>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Summary
              </Typography>
              {metrics ? (
                <Box>
                  <Typography variant="body2">
                    Games Played: {metrics.totalGamesPlayed}
                  </Typography>
                  <Typography variant="body2">
                    Avg Session: {Math.round(metrics.averageSessionDuration / 60)} minutes
                  </Typography>
                  <Typography variant="body2">
                    Completion Rate: {Math.round(metrics.overallCompletionRate * 100)}%
                  </Typography>
                  <Typography variant="body2">
                    Engagement Score: {Math.round(metrics.engagementScore)}%
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No performance data available yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </FeatureGate>

      {/* User Management Access for Account Owners */}
      {isReady && hasRole('account_owner') && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <FeatureGate 
              feature="user_management" 
              mode="alert"
              compact={true}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">
                    User Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage users, roles, and avatars for your organization
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  href="/dashboard/user-management"
                  startIcon={<Settings />}
                >
                  Manage Users
                </Button>
              </Box>
            </FeatureGate>
          </CardContent>
        </Card>
      )}

    </Box>
  );
} 