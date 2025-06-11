"use client";

import { useEffect, useState } from "react";
import { useAvatar } from "@/context/UserContext";
import { analyticsService, type LearningProgressData, type LearningPathRecommendation, type PerformanceMetrics } from "@/utils/analyticsService";
import { Box, Typography, Paper, CircularProgress, Alert, List, ListItem, ListItemText, Divider } from "@mui/material";

/**
 * User Dashboard page for learning progress, recommendations, and metrics.
 * Focuses on robust data flow and error handling.
 */
export default function DashboardPage() {
  const { currentAvatar } = useAvatar();
  const avatarId = currentAvatar?.id;

  const [progress, setProgress] = useState<LearningProgressData[] | null>(null);
  const [recommendations, setRecommendations] = useState<LearningPathRecommendation[] | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!avatarId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      analyticsService.getAvatarProgress(avatarId),
      analyticsService.getLearningPathRecommendations(avatarId, 5),
      analyticsService.getPerformanceMetrics(avatarId)
    ])
      .then(([progressData, recs, metricsData]) => {
        setProgress(progressData);
        setRecommendations(recs);
        setMetrics(metricsData);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      })
      .finally(() => setLoading(false));
  }, [avatarId]);

  if (!avatarId) {
    return <Alert severity="info">Please select or create an avatar to view your dashboard.</Alert>;
  }

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box maxWidth="md" mx="auto" py={4}>
      <Typography variant="h4" gutterBottom>Learning Progress Dashboard</Typography>
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