"use client";

import { useEffect, useState, useCallback } from "react";
import { useAvatar, useUser } from "@/context/UserContext";
import { analyticsService, type LearningProgressData, type LearningPathRecommendation, type PerformanceMetrics } from "@/utils/analyticsService";
import { analyticsDebugger } from "@/utils/analyticsDebug";
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
    console.log('Running analytics diagnostic for avatar:', avatarId);
    await analyticsDebugger.runFullDiagnostic(avatarId);
  };

  const createTestData = async () => {
    if (!avatarId) return;
    console.log('Creating simple test data for avatar:', avatarId);
    try {
      const result = await analyticsDebugger.createTestSessionData(avatarId);
      console.log('Test data creation result:', result);
      
      if (result.success) {
        // Reload dashboard data
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to create test data:', err);
    }
  };

  const generateComprehensiveData = async () => {
    console.log('Generating comprehensive mock data for all avatars...');
    try {
      const result = await analyticsDebugger.generateComprehensiveMockData();
      console.log('Comprehensive data generation result:', result);
      
      if (result.success) {
        alert(`✅ Generated mock data!\n\nSummary:\n- Avatars: ${result.summary?.avatarsProcessed}\n- Sessions: ${result.summary?.totalSessions}\n- Abandoned: ${result.summary?.abandonedSessions}\n\nReloading dashboard...`);
        window.location.reload();
      } else {
        alert(`❌ Failed to generate data: ${result.error}`);
      }
    } catch (err) {
      console.error('Failed to generate comprehensive data:', err);
      alert(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleAvatarChange = useCallback((event: SelectChangeEvent<string>) => {
    const selectedAvatar = avatars.find(a => a.id === event.target.value);
    if (selectedAvatar && selectedAvatar.id !== currentAvatar?.id) {
      console.log('Switching avatar from', currentAvatar?.name, 'to', selectedAvatar.name);
      setCurrentAvatar(selectedAvatar);
    }
  }, [avatars, currentAvatar, setCurrentAvatar]);

  useEffect(() => {
    if (!avatarId) {
      setProgress(null);
      setRecommendations(null);
      setMetrics(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    console.log('Dashboard: Loading analytics for avatar:', avatarId);
    
    // Create an abort controller to prevent state updates if component unmounts or avatar changes
    const abortController = new AbortController();
    
    Promise.all([
      analyticsService.getAvatarProgress(avatarId).catch(err => {
        console.error('Error loading avatar progress:', err);
        throw new Error(`Progress: ${err.message}`);
      }),
      analyticsService.getLearningPathRecommendations(avatarId, 5).catch(err => {
        console.error('Error loading recommendations:', err);
        throw new Error(`Recommendations: ${err.message}`);
      }),
      analyticsService.getPerformanceMetrics(avatarId).catch(err => {
        console.error('Error loading performance metrics:', err);
        throw new Error(`Metrics: ${err.message}`);
      })
    ])
      .then(([progressData, recs, metricsData]) => {
        // Only update state if not aborted
        if (!abortController.signal.aborted) {
          console.log('Dashboard: Successfully loaded analytics data', {
            progress: progressData,
            recommendations: recs,
            metrics: metricsData
          });
          setProgress(progressData);
          setRecommendations(recs);
          setMetrics(metricsData);
        }
      })
      .catch((err) => {
        // Only update state if not aborted
        if (!abortController.signal.aborted) {
          console.error('Dashboard: Analytics loading failed:', err);
          setError(err instanceof Error ? err.message : "Failed to load dashboard data");
        }
      })
      .finally(() => {
        // Only update state if not aborted
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      });

    // Cleanup function to abort on unmount or avatar change
    return () => {
      abortController.abort();
    };
  }, [avatarId]);

  if (!avatarId) {
    return <Alert severity="info">Please select or create an avatar to view your dashboard.</Alert>;
  }

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}><CircularProgress /></Box>;
  }

  if (error) {
    return (
      <Box maxWidth="md" mx="auto" py={4}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button variant="outlined" onClick={runDiagnostic}>
            Run Diagnostic
          </Button>
          <Button variant="outlined" onClick={createTestData}>
            Quick Test Data
          </Button>
          <Button variant="contained" color="primary" onClick={generateComprehensiveData}>
            Generate Full Mock Data
          </Button>
          <Button variant="outlined" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box maxWidth="md" mx="auto" py={4}>
      <Typography variant="h4" gutterBottom>Learning Progress Dashboard</Typography>
      
      {/* Avatar Selector */}
      {avatars && avatars.length > 1 && (
        <Box mb={3}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Select Avatar</InputLabel>
            <Select
              value={currentAvatar?.id || ''}
              label="Select Avatar"
              onChange={handleAvatarChange}
            >
              {avatars.map((avatar) => (
                <MenuItem key={avatar.id} value={avatar.id}>
                  {avatar.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Mock Data Generation Controls */}
      <Box mb={3} display="flex" gap={2} flexWrap="wrap">
        <Button variant="outlined" size="small" onClick={runDiagnostic}>
          Run Diagnostic
        </Button>
        <Button variant="outlined" size="small" onClick={createTestData}>
          Quick Test Data
        </Button>
        <Button variant="contained" color="primary" size="small" onClick={generateComprehensiveData}>
          Generate Full Mock Data
        </Button>
      </Box>
      
      <Divider sx={{ mb: 3 }} />

      {/* Learning Progress */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
        <Typography variant="h6" gutterBottom>Learning Progress</Typography>
        {progress && progress.length > 0 ? (
          <List>
            {progress.map((p) => (
              <ListItem key={p.gameId}>
                <ListItemText
                  primary={p.gameId}
                  secondary={`Skill: ${p.skillLevel}, Mastery: ${p.masteryScore}%, Last Played: ${p.lastPlayed.toLocaleDateString()}`}
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
            {recommendations.map((rec) => (
              <ListItem key={rec.gameId}>
                <ListItemText
                  primary={rec.gameId}
                  secondary={rec.reason}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No recommendations available.</Typography>
        )}
      </Paper>

      {/* Performance Metrics */}
      <Paper sx={{ p: 2 }} elevation={2}>
        <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
        {metrics ? (
          <pre style={{ textAlign: 'left', background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
            {JSON.stringify(metrics, null, 2)}
          </pre>
        ) : (
          <Typography>No metrics available.</Typography>
        )}
      </Paper>
    </Box>
  );
} 