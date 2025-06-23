"use client";

import React, { useEffect, useState } from "react";
import { useAvatar, useUser, useRoleGuard } from "@/context/UserContext";
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
  
  return isHydrated && loadingState.isReady;
}

/**
 * User Dashboard page for learning progress, recommendations, and metrics.
 * Focuses on robust data flow and error handling.
 * Uses role guard to prevent flashing of admin-only content.
 */
export default function DashboardPage() {
  const isDashboardReady = useIsDashboardReady();
  const { currentAvatar } = useAvatar();
  const { error: userError } = useUser();
  const { hasRole, isReady } = useRoleGuard();
  const { } = useSubscription();
  const avatarId = currentAvatar?.id;

  const [progress, setProgress] = useState<LearningProgressData[] | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    const loadData = async () => {
      if (!avatarId) {
        setDashboardLoading(false);
        return;
      }

      setDashboardLoading(true);
      setError(null);

      try {
        logger.info('🔄 Loading analytics data for avatar:', avatarId);

        const [progressData, metricsData] = await Promise.all([
          analyticsService.getAvatarProgress(avatarId),
          analyticsService.getPerformanceMetrics(avatarId)
        ]);

        logger.debug('📊 Analytics data loaded:', { 
          progress: progressData, 
          metrics: metricsData 
        });

        setProgress(progressData);
        setMetrics(metricsData);
      } catch (err) {
        logger.error('❌ Error loading analytics data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      } finally {
        setDashboardLoading(false);
      }
    };

    loadData();
  }, [avatarId]);

  // Wait for full hydration before showing dashboard
  if (!isDashboardReady) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  if (userError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          {userError} <br />
          <Button variant="outlined" sx={{ mt: 1 }} onClick={() => window.location.reload()}>
            Reload
          </Button>
        </Alert>
      </Box>
    );
  }

  if (!avatarId) {
    return (
      <Alert severity="info">
        Please select or create an avatar to view your dashboard.
      </Alert>
    );
  }

  if (dashboardLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Subscription Badge */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Analytics Dashboard
        </Typography>
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
              {/* Existing analytics components */}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              {/* Existing activity components */}
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