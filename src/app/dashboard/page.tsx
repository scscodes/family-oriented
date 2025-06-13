"use client";

import { useEffect, useState, useCallback } from "react";
import { useAvatar, useUser } from "@/context/UserContext";
import { analyticsService, type LearningProgressData, type LearningPathRecommendation, type PerformanceMetrics } from "@/utils/analyticsService";
import { analyticsDebugger } from "@/utils/analyticsDebug";
import { logger } from "@/utils/logger";
import { Box, Typography, Paper, CircularProgress, Alert, List, ListItem, ListItemText, Divider, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

/**
 * User Dashboard page for learning progress, recommendations, and metrics.
 * Focuses on robust data flow and error handling.
 */
export default function DashboardPage() {
  const { currentAvatar, setCurrentAvatar } = useAvatar();
  const { avatars } = useUser();
  const avatarId = currentAvatar?.id;

  const [progress, setProgress] = useState<LearningProgressData[] | null>(null);
  const [recommendations, setRecommendations] = useState<LearningPathRecommendation[] | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        // Reload dashboard data
        window.location.reload();
      }
    } catch (err) {
      logger.error('Failed to create test data:', err);
    }
  };

  const generateComprehensiveData = async () => {
    logger.info('Generating comprehensive mock data for all avatars...');
    try {
      const result = await analyticsDebugger.generateComprehensiveMockData();
      logger.info('Comprehensive data generation result:', result);
      
      if (result.success) {
        const message = [
          '✅ Generated mock data!',
          '',
          'Summary:',
          `- Avatars: ${result.summary?.avatarsProcessed}`,
          `- Sessions: ${result.summary?.totalSessions}`,
          `- Abandoned: ${result.summary?.abandonedSessions}`,
          '',
          result.message || '',
          '',
          'Reloading dashboard...'
        ].filter(Boolean).join('\n');
        
        alert(message);
        window.location.reload();
      } else {
        alert(`❌ Failed to generate data: ${result.error}`);
      }
    } catch (err) {
      logger.error('Failed to generate comprehensive data:', err);
      alert(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const clearAllData = async () => {
    if (!confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
      return;
    }

    logger.info('Clearing all analytics data...');
    try {
      const result = await analyticsDebugger.clearAllAnalyticsData();
      if (result.success) {
        alert('✅ All analytics data cleared successfully!\n\nReloading dashboard...');
        window.location.reload();
      } else {
        alert(`❌ Failed to clear data: ${result.error}`);
      }
    } catch (err) {
      logger.error('Failed to clear data:', err);
      alert(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleAvatarChange = useCallback((event: SelectChangeEvent<string>) => {
    const selectedAvatar = avatars.find(a => a.id === event.target.value);
    if (selectedAvatar && selectedAvatar.id !== currentAvatar?.id) {
      logger.info('Switching avatar from', currentAvatar?.name, 'to', selectedAvatar.name);
      setCurrentAvatar(selectedAvatar);
    }
  }, [avatars, currentAvatar, setCurrentAvatar]);

  // Load analytics data for the selected avatar
  useEffect(() => {
    const loadData = async () => {
      if (!avatarId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        logger.info('=== DASHBOARD LOADING DATA ===');
        logger.info('Selected avatar ID from state:', avatarId);
        
        // Load progress data
        const progress = await analyticsService.getAvatarProgress(avatarId);
        logger.info('Progress data:', progress);
        setProgress(progress);
        
        // Load recommendations
        const recommendations = await analyticsService.getLearningPathRecommendations(avatarId);
        logger.info('Recommendations:', recommendations);
        setRecommendations(recommendations);
        
        // Load performance metrics
        const metrics = await analyticsService.getPerformanceMetrics(avatarId);
        logger.info('Raw metrics data:', metrics);
        
        // Transform metrics for display
        const transformedMetrics = {
          totalGamesPlayed: metrics.totalGamesPlayed,
          averageSessionDuration: Math.round(metrics.averageSessionDuration / 60), // Convert to minutes
          engagementScore: Math.round(metrics.engagementScore)
        };
        logger.info('Transformed metrics:', transformedMetrics);
        
        setMetrics(transformedMetrics);
        logger.info('=== END DASHBOARD LOADING ===');
      } catch (err) {
        logger.error('Error loading analytics data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics data');
        // Reset state on error
        setProgress(null);
        setRecommendations(null);
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [avatarId]);

  if (!avatarId) {
    return <Alert severity="info">Please select or create an avatar to view your dashboard.</Alert>;
  }

  if (loading) {
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
    <Box maxWidth="md" mx="auto" py={4}>
      <Typography variant="h4" gutterBottom>Learning Progress Dashboard</Typography>
      
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

      {/* Controls */}
      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
        <Button variant="outlined" size="small" onClick={runDiagnostic}>
          Run Diagnostic
        </Button>
        <Button variant="outlined" size="small" onClick={createTestData}>
          Quick Test Data
        </Button>
        <Button variant="contained" color="primary" size="small" onClick={generateComprehensiveData}>
          Generate Full Mock Data
        </Button>
        <Button variant="outlined" color="error" size="small" onClick={clearAllData}>
          Clear All Data
        </Button>
      </Box>
      
      <Divider sx={{ mb: 3 }} />

      {/* Learning Progress */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
        <Typography variant="h6" gutterBottom>Learning Progress</Typography>
        {progress && progress.length > 0 ? (
          <List>
            {progress.map((p) => (
              <ListItem key={`progress-${p.gameId}-${p.lastPlayed}`}>
                <ListItemText
                  primary={p.gameId}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        Skill: {p.skillLevel}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2">
                        Mastery: {p.masteryScore.toFixed(1)}%
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2">
                        Last Played: {new Date(p.lastPlayed).toLocaleDateString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No progress data yet. Play some games to get started!</Typography>
        )}
      </Paper>

      {/* Recommendations */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
        <Typography variant="h6" gutterBottom>Recommended Next Games</Typography>
        {recommendations && recommendations.length > 0 ? (
          <List>
            {recommendations.map((rec, index) => (
              <ListItem key={`rec-${rec.gameId}-${index}`}>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" color="primary">
                      {rec.gameId}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {rec.reason}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2">
                        Priority: {rec.priority}/10
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2">
                        Difficulty: {rec.estimatedDifficulty}
                      </Typography>
                      {rec.learningObjectives && rec.learningObjectives.length > 0 && (
                        <>
                          <br />
                          <Typography component="span" variant="body2">
                            Learning: {rec.learningObjectives.join(', ')}
                          </Typography>
                        </>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No recommendations available.</Typography>
        )}
      </Paper>

      {/* Performance Metrics */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
        <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
        {metrics ? (
          <>
            <List>
              <ListItem>
                <ListItemText
                  primary="Total Games Played"
                  secondary={metrics.totalGamesPlayed || 0}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Average Session Duration"
                  secondary={`${Math.round((metrics.averageSessionDuration || 0) / 60)} minutes`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Engagement Score"
                  secondary={`${(metrics.engagementScore || 0).toFixed(1)}/10`}
                />
              </ListItem>
            </List>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Raw metrics data: {JSON.stringify(metrics, null, 2)}
              </Typography>
            </Box>
          </>
        ) : (
          <Typography>No metrics available yet.</Typography>
        )}
      </Paper>
    </Box>
  );
} 