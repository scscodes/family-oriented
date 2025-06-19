"use client";

/**
 * Dashboard visualization components using Chart.js
 * Implements responsive, accessible charts for learning analytics
 */

import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler,
  TooltipItem
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { Box, Paper, useTheme } from '@mui/material';
import type { LearningProgressData, PerformanceMetrics } from '@/utils/analyticsService';

interface LearningRecommendation {
  gameId: string;
  reason: string;
  priority: number;
}

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
);

interface DashboardChartsProps {
  progress: LearningProgressData[];
  metrics: PerformanceMetrics;
  comparisonData?: {
    progress: LearningProgressData[];
    metrics: PerformanceMetrics;
  };
  comparisonLabel?: string;
}

/**
 * Mastery Progress Chart Component
 * Displays mastery score distribution with accessibility support
 */
const MasteryProgressChart: React.FC<{
  progress: LearningProgressData[];
}> = ({ progress }) => {
  const theme = useTheme();

  const chartData = useMemo(() => ({
    labels: progress.map(p => p.gameId),
    datasets: [{
      label: 'Mastery Score',
      data: progress.map(p => p.masteryScore),
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.primary.light,
      fill: true
    }]
  }), [progress, theme]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Mastery Progress',
        color: theme.palette.text.primary,
        font: {
          size: 16
        }
      },
      legend: {
        position: 'top' as const,
        labels: {
          color: theme.palette.text.primary
        }
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'line'>) => `Mastery: ${(context.raw as number).toFixed(1)}%`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: theme.palette.text.secondary
        },
        grid: {
          color: theme.palette.divider
        }
      },
      x: {
        ticks: {
          color: theme.palette.text.secondary
        },
        grid: {
          color: theme.palette.divider
        }
      }
    }
  }), [theme]);

  return (
    <Paper 
      sx={{ p: 2, height: '100%' }} 
      elevation={2}
      role="img"
      aria-label="Mastery Progress Chart"
    >
      <Box sx={{ height: 300 }}>
        <Line data={chartData} options={chartOptions} />
      </Box>
    </Paper>
  );
};

/**
 * Skill Distribution Chart Component
 * Visualizes skill level distribution with accessibility support
 */
const SkillDistributionChart: React.FC<{
  metrics: PerformanceMetrics;
}> = ({ metrics }) => {
  const theme = useTheme();

  const chartData = useMemo(() => {
    const distribution = metrics?.skillLevelDistribution || {};
    return {
      labels: ['Beginner', 'Intermediate', 'Advanced'],
      datasets: [{
        label: 'Skill Distribution',
        data: [
          distribution['beginner'] || 0,
          distribution['intermediate'] || 0,
          distribution['advanced'] || 0
        ],
        backgroundColor: [
          theme.palette.primary.light,
          theme.palette.primary.main,
          theme.palette.primary.dark
        ]
      }]
    };
  }, [metrics, theme]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Skill Distribution',
        color: theme.palette.text.primary,
        font: {
          size: 16
        }
      },
      legend: {
        position: 'top' as const,
        labels: {
          color: theme.palette.text.primary
        }
      }
    }
  }), [theme]);

  return (
    <Paper 
      sx={{ p: 2, height: '100%' }} 
      elevation={2}
      role="img"
      aria-label="Skill Distribution Chart"
    >
      <Box sx={{ height: 300 }}>
        <Doughnut data={chartData} options={chartOptions} />
      </Box>
    </Paper>
  );
};

/**
 * Engagement Metrics Chart Component
 * Displays engagement metrics with accessibility support
 */
const EngagementMetricsChart: React.FC<{
  metrics: PerformanceMetrics;
}> = ({ metrics }) => {
  const theme = useTheme();

  const chartData = useMemo(() => ({
    labels: ['Engagement', 'Remaining'],
    datasets: [{
      data: [
        metrics.engagementScore || 0,
        100 - (metrics.engagementScore || 0)
      ],
      backgroundColor: [
        theme.palette.success.main,
        theme.palette.grey[200]
      ]
    }]
  }), [metrics, theme]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Engagement Score',
        color: theme.palette.text.primary,
        font: {
          size: 16
        }
      },
      legend: {
        position: 'top' as const,
        labels: {
          color: theme.palette.text.primary
        }
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'doughnut'>) => {
            if (context.label === 'Engagement') {
              return `Engagement: ${(context.raw as number).toFixed(1)}%`;
            }
            return '';
          }
        }
      }
    }
  }), [theme]);

  return (
    <Paper 
      sx={{ p: 2, height: '100%' }} 
      elevation={2}
      role="img"
      aria-label="Engagement Metrics Chart"
    >
      <Box sx={{ height: 300 }}>
        <Doughnut data={chartData} options={chartOptions} />
      </Box>
    </Paper>
  );
};

/**
 * Learning Path Chart Component
 * Visualizes learning progression with accessibility support
 */
const LearningPathChart: React.FC<{
  progress: LearningProgressData[];
  recommendations: LearningRecommendation[];
}> = ({ progress, recommendations }) => {
  const theme = useTheme();

  const chartData = useMemo(() => ({
    labels: progress.map(p => p.gameId),
    datasets: [
      {
        label: 'Mastery Score',
        data: progress.map(p => p.masteryScore),
        borderColor: theme.palette.primary.main,
        tension: 0.1,
        fill: false
      },
      {
        label: 'Skill Level',
        data: progress.map(p => p.skillLevel === 'beginner' ? 1 : p.skillLevel === 'intermediate' ? 2 : 3),
        borderColor: theme.palette.secondary.main,
        tension: 0.1,
        fill: false
      }
    ]
  }), [progress, theme]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Learning Progression',
        color: theme.palette.text.primary,
        font: {
          size: 16
        }
      },
      legend: {
        position: 'top' as const,
        labels: {
          color: theme.palette.text.primary
        }
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const label = context.dataset.label;
            const value = context.raw as number;
            const gameId = progress[context.dataIndex].gameId;
            const recommendation = recommendations.find(r => r.gameId === gameId);
            
            return [
              `${label}: ${value}`,
              recommendation ? `Next: ${recommendation.reason}` : ''
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: theme.palette.text.secondary
        },
        grid: {
          color: theme.palette.divider
        }
      },
      x: {
        ticks: {
          color: theme.palette.text.secondary
        },
        grid: {
          color: theme.palette.divider
        }
      }
    }
  }), [progress, recommendations, theme]);

  return (
    <Paper 
      sx={{ p: 2, height: '100%' }} 
      elevation={2}
      role="img"
      aria-label="Learning Path Chart"
    >
      <Box sx={{ height: 300 }}>
        <Line data={chartData} options={chartOptions} />
      </Box>
    </Paper>
  );
};

/**
 * Comparison Chart Component
 * Visualizes progress comparison between time periods
 */
const ComparisonChart: React.FC<{
  currentProgress: LearningProgressData[];
  comparisonProgress: LearningProgressData[];
  comparisonLabel: string;
}> = ({ currentProgress, comparisonProgress, comparisonLabel }) => {
  const theme = useTheme();

  const chartData = useMemo(() => ({
    labels: currentProgress.map(p => p.gameId),
    datasets: [
      {
        label: 'Current',
        data: currentProgress.map(p => p.masteryScore),
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light,
        fill: false
      },
      {
        label: comparisonLabel,
        data: comparisonProgress.map(p => p.masteryScore),
        borderColor: theme.palette.secondary.main,
        backgroundColor: theme.palette.secondary.light,
        fill: false,
        borderDash: [5, 5]
      }
    ]
  }), [currentProgress, comparisonProgress, comparisonLabel, theme]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Progress Comparison',
        color: theme.palette.text.primary,
        font: {
          size: 16
        }
      },
      legend: {
        position: 'top' as const,
        labels: {
          color: theme.palette.text.primary
        }
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const label = context.dataset.label;
            const value = context.raw as number;
            return `${label}: ${value.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: theme.palette.text.secondary
        },
        grid: {
          color: theme.palette.divider
        }
      },
      x: {
        ticks: {
          color: theme.palette.text.secondary
        },
        grid: {
          color: theme.palette.divider
        }
      }
    }
  }), [theme]);

  return (
    <Paper 
      sx={{ p: 2, height: '100%' }} 
      elevation={2}
      role="img"
      aria-label="Progress Comparison Chart"
    >
      <Box sx={{ height: 300 }}>
        <Line data={chartData} options={chartOptions} />
      </Box>
    </Paper>
  );
};

/**
 * Main dashboard charts component
 */
export default function DashboardCharts({ 
  progress, 
  metrics,
  comparisonData,
  comparisonLabel
}: DashboardChartsProps) {
  const recommendations = useMemo(() => [], []); // TODO: Implement recommendations

  return (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
      gap: 3,
      p: 2
    }}>
      <MasteryProgressChart progress={progress} />
      <SkillDistributionChart metrics={metrics} />
      <EngagementMetricsChart metrics={metrics} />
      <LearningPathChart progress={progress} recommendations={recommendations} />
      {comparisonData && comparisonLabel && (
        <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
          <ComparisonChart
            currentProgress={progress}
            comparisonProgress={comparisonData.progress}
            comparisonLabel={comparisonLabel}
          />
        </Box>
      )}
    </Box>
  );
} 