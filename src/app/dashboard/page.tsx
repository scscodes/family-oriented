"use client";

import { useEffect, useState, useCallback } from "react";
import { useAvatar, useUser } from "@/context/UserContext";
import { analyticsService, type LearningProgressData, type LearningPathRecommendation, type PerformanceMetrics } from "@/utils/analyticsService";
import { analyticsDebugger } from "@/utils/analyticsDebug";
import { logger } from "@/utils/logger";
import { Box, Typography, Paper, CircularProgress, Alert, List, ListItem, ListItemText, Button, FormControl, InputLabel, Select, MenuItem, Card, CardContent } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import { PlayArrow, Star, History, Download, CompareArrows } from '@mui/icons-material';
import { format } from 'date-fns';
import { useTheme } from '@mui/material/styles';

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
  const [comparisonData, setComparisonData] = useState<{
    progress: LearningProgressData[];
    metrics: PerformanceMetrics;
  } | null>(null);
  const [comparisonLabel] = useState<string>('');
  const [loading, setLoading] = useState(true);
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

  const handleComparisonChange = useCallback(async (value: string) => {
    if (!currentAvatar) return;

    // TODO: Implement historical data comparison once getHistoricalData is available
    logger.info('Comparison feature not yet implemented:', value);
    setError('Historical comparison feature coming soon');
  }, [currentAvatar]);

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
        
        // Transform metrics for display (ensure all required properties are present)
        const transformedMetrics: PerformanceMetrics = {
          totalGamesPlayed: metrics.totalGamesPlayed,
          averageSessionDuration: Math.round(metrics.averageSessionDuration / 60), // Convert to minutes
          engagementScore: Math.round(metrics.engagementScore),
          overallCompletionRate: metrics.overallCompletionRate,
          skillLevelDistribution: metrics.skillLevelDistribution,
          subjectPreferences: metrics.subjectPreferences,
          learningVelocity: metrics.learningVelocity
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
    <Box maxWidth="lg" mx="auto" py={4}>
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

      {/* Quick Access Section */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
        <Typography variant="h6" gutterBottom>Quick Access</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Recently Played */}
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  <History sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Recently Played
                </Typography>
                {progress && progress.length > 0 ? (
                  <List dense>
                    {progress.slice(0, 3).map((p) => (
                      <ListItem key={`recent-${p.gameId}`}>
                        <ListItemText
                          primary={p.gameId}
                          secondary={`Mastery: ${p.masteryScore.toFixed(1)}%`}
                        />
                        <Button size="small" startIcon={<PlayArrow />}>
                          Play Again
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No recent games played
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Recommended Next */}
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  <Star sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Recommended Next
                </Typography>
                {recommendations && recommendations.length > 0 ? (
                  <List dense>
                    {recommendations.slice(0, 3).map((rec, index) => (
                      <ListItem key={`rec-${rec.gameId}-${index}`}>
                        <ListItemText
                          primary={rec.gameId}
                          secondary={rec.reason}
                        />
                        <Button size="small" startIcon={<PlayArrow />}>
                          Play
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No recommendations available
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Paper>

      {/* Analytics Controls */}
      <Paper 
        sx={{ 
          p: 2, 
          mb: 3,
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary
        }} 
        elevation={2}
      >
        <Typography variant="h6" gutterBottom>Analytics Controls</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Export Controls */}
          <Box sx={{ flex: 1 }}>
            <Card sx={{ bgcolor: theme.palette.background.default }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  <Download sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Export Data
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const data = {
                        progress,
                        metrics,
                        comparisonData,
                        timestamp: new Date().toISOString(),
                        avatar: currentAvatar?.name
                      };
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `analytics-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Export JSON
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const csv = [
                        ['Game ID', 'Mastery Score', 'Skill Level', 'Last Played'],
                        ...(progress || []).map(p => [
                          p.gameId,
                          p.masteryScore.toFixed(1),
                          p.skillLevel,
                          new Date(p.lastPlayed).toLocaleDateString()
                        ])
                      ].map(row => row.join(',')).join('\n');
                      
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `progress-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Export CSV
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Comparative Analytics */}
          <Box sx={{ flex: 1 }}>
            <Card sx={{ bgcolor: theme.palette.background.default }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  <CompareArrows sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Compare Progress
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Compare With</InputLabel>
                  <Select
                    value={comparisonLabel ? 'custom' : ''}
                    label="Compare With"
                    onChange={(e) => handleComparisonChange(e.target.value)}
                  >
                    <MenuItem value="last_week">Last Week</MenuItem>
                    <MenuItem value="last_month">Last Month</MenuItem>
                    <MenuItem value="last_quarter">Last Quarter</MenuItem>
                  </Select>
                </FormControl>
                {comparisonData && (
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    onClick={() => setComparisonData(null)}
                  >
                    Clear Comparison
                  </Button>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Paper>

      {/* Analytics Charts */}
      {progress && metrics && (
        <Box sx={{ mb: 4 }}>
          <DashboardCharts 
            progress={progress} 
            metrics={metrics}
            comparisonData={comparisonData || undefined}
            comparisonLabel={comparisonLabel}
          />
        </Box>
      )}

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

      {/* Debug Controls */}
      <Paper sx={{ p: 2 }} elevation={2}>
        <Typography variant="h6" gutterBottom>Debug Tools</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
      </Paper>
    </Box>
  );
} 