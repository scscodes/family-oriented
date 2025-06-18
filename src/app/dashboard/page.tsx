"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAvatar, useUser, useRoleGuard } from "@/context/UserContext";
import { analyticsService, type LearningProgressData, type LearningPathRecommendation, type PerformanceMetrics } from "@/utils/analyticsService";
import { analyticsDebugger } from "@/utils/analyticsDebug";
import { logger } from "@/utils/logger";
import SubscriptionStatus from "@/components/SubscriptionStatus";
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert, 
  List, 
  ListItem, 
  ListItemText, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Card, 
  CardContent 
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { PlayArrow, Star, History, Download, CompareArrows } from '@mui/icons-material';
import { format } from 'date-fns';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';

// Dynamically import DashboardCharts to avoid SSR issues with Chart.js
const DashboardCharts = dynamic(() => import('@/components/dashboard/DashboardCharts'), {
  ssr: false,
  loading: () => (
    <Box sx={{ p: 2, textAlign: 'center' }}>
      <CircularProgress />
    </Box>
  )
});

/**
 * User Dashboard page for learning progress, recommendations, and metrics.
 * Focuses on robust data flow and error handling.
 * Uses role guard to prevent flashing of admin-only content.
 */
export default function DashboardPage() {
  const { currentAvatar, setCurrentAvatar } = useAvatar();
  const { avatars, canAccess, error: userError } = useUser();
  const { hasRole, isReady } = useRoleGuard();
  const avatarId = currentAvatar?.id;

  const [progress, setProgress] = useState<LearningProgressData[] | null>(null);
  const [recommendations, setRecommendations] = useState<LearningPathRecommendation[] | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [comparisonData, setComparisonData] = useState<{
    progress: LearningProgressData[];
    metrics: PerformanceMetrics;
  } | null>(null);
  const [comparisonLabel] = useState<string>('');
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();

  const runDiagnostic = async () => {
    if (!avatarId) return;
    logger.info('Running analytics diagnostic for avatar:', avatarId);
    await analyticsDebugger.runFullDiagnostic(avatarId);
  };

  const createTestData = async () => {
    if (!avatarId) return;
    logger.info('Creating simple test data for avatar:', avatarId);
    try {
      const result = await analyticsDebugger.createTestSessionData(avatarId);
      logger.info('Test data creation result:', result);
      
      if (result.success) {
        window.location.reload();
      }
    } catch (err) {
      logger.error('Failed to create test data:', err);
    }
  };

  const handleAvatarChange = (event: SelectChangeEvent) => {
    const avatarId = event.target.value;
    const selectedAvatar = avatars?.find(a => a.id === avatarId);
    if (selectedAvatar) {
      setCurrentAvatar(selectedAvatar);
    }
  };

  const loadAnalyticsData = useCallback(async () => {
    if (!avatarId) {
      setDashboardLoading(false);
      return;
    }

    setDashboardLoading(true);
    setError(null);

    try {
      logger.info('🔄 Loading analytics data for avatar:', avatarId);

      const [progressData, recommendationsData, metricsData] = await Promise.all([
        analyticsService.getAvatarProgress(avatarId),
        analyticsService.getLearningPathRecommendations(avatarId),
        analyticsService.getPerformanceMetrics(avatarId)
      ]);

      logger.debug('📊 Analytics data loaded:', { 
        progress: progressData, 
        recommendations: recommendationsData, 
        metrics: metricsData 
      });

      setProgress(progressData);
      setRecommendations(recommendationsData);
      setMetrics(metricsData);
    } catch (err) {
      logger.error('❌ Error loading analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setDashboardLoading(false);
    }
  }, [avatarId]);

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

        const [progressData, recommendationsData, metricsData] = await Promise.all([
          analyticsService.getAvatarProgress(avatarId),
          analyticsService.getLearningPathRecommendations(avatarId),
          analyticsService.getPerformanceMetrics(avatarId)
        ]);

        logger.debug('📊 Analytics data loaded:', { 
          progress: progressData, 
          recommendations: recommendationsData, 
          metrics: metricsData 
        });

        setProgress(progressData);
        setRecommendations(recommendationsData);
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
    <Box sx={{ maxWidth: 'lg', mx: 'auto', py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Learning Progress Dashboard
      </Typography>

      {/* Subscription Status */}
      <Box sx={{ mb: 3 }}>
        <SubscriptionStatus />
      </Box>

      {/* User Management Dashboard Link (visible to account_owner or org_admin when ready) */}
      {isReady && (hasRole('account_owner') || hasRole('org_admin')) && (
        <Box sx={{ mb: 2 }}>
          <Button variant="contained" color="secondary" href="/dashboard/user-management">
            Manage Users & Roles
          </Button>
        </Box>
      )}

      {/* Avatar Selection */}
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select Avatar</InputLabel>
          <Select
            value={avatarId || ''}
            label="Select Avatar"
            onChange={handleAvatarChange}
          >
            {avatars?.map((avatar) => (
              <MenuItem key={avatar.id} value={avatar.id}>
                {avatar.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Current Avatar Info */}
      {currentAvatar && (
        <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
          <Typography variant="h6" gutterBottom>
            Current Avatar: {currentAvatar.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ID: {currentAvatar.id}
          </Typography>
        </Paper>
      )}

      {/* Quick Access Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>Quick Actions</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            startIcon={<PlayArrow />}
            onClick={() => window.location.href = '/games'}
          >
            Play Games
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Download />}
            onClick={createTestData}
          >
            Create Test Data
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<History />}
            onClick={runDiagnostic}
          >
            Run Diagnostic
          </Button>
        </Box>
      </Box>

      {/* Analytics Charts */}
      {metrics && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Analytics Overview</Typography>
          <DashboardCharts 
            metrics={metrics} 
            progress={progress} 
            comparisonData={comparisonData}
            comparisonLabel={comparisonLabel}
          />
        </Box>
      )}

      {/* Learning Progress */}
      {progress && progress.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
          <Typography variant="h6" gutterBottom>
            <Star sx={{ mr: 1, verticalAlign: 'middle' }} />
            Learning Progress
          </Typography>
          <List>
            {progress.map((item, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${item.subject}: Level ${item.currentLevel}`}
                  secondary={`Mastery: ${Math.round(item.masteryScore * 100)}% | Last Activity: ${
                    item.lastActivity ? format(new Date(item.lastActivity), 'MMM dd, yyyy') : 'Never'
                  }`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
          <Typography variant="h6" gutterBottom>
            <CompareArrows sx={{ mr: 1, verticalAlign: 'middle' }} />
            Recommended Learning Path
          </Typography>
          <List>
            {recommendations.map((rec, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={rec.gameTitle}
                  secondary={`${rec.reason} | Priority: ${rec.priority} | Est. Time: ${rec.estimatedTime} min`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Performance Metrics */}
      {metrics && (
        <Paper sx={{ p: 2 }} elevation={2}>
          <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2">Engagement Score</Typography>
                <Typography variant="h4">{Math.round(metrics.engagementScore * 100)}%</Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2">Learning Velocity</Typography>
                <Typography variant="h4">{metrics.learningVelocity.toFixed(1)}</Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2">Completion Rate</Typography>
                <Typography variant="h4">{Math.round(metrics.completionRate * 100)}%</Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2">Avg Session Time</Typography>
                <Typography variant="h4">{Math.round(metrics.averageSessionTime)} min</Typography>
              </CardContent>
            </Card>
          </Box>
        </Paper>
      )}
    </Box>
  );
} 