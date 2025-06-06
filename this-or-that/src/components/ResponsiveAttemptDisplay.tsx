'use client';

import { Box, Typography, Fade, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material';
import type { ReactNode } from 'react';

/**
 * Represents a generic record of an attempt in a quiz or game.
 * Must include a correctness status and a unique key.
 */
interface AttemptRecord {
  isCorrect: boolean;
  key: string | number; // Unique key for React list rendering
}

interface ResponsiveAttemptDisplayProps<T extends AttemptRecord> {
  /** List of previous attempts/records. */
  items: T[];
  /** Function to render the specific content of each item. */
  renderItemContent: (item: T) => ReactNode;
  /** Optional title for the history section. */
  title?: string;
  /** Additional styles to apply to the root container. */
  sx?: SxProps<Theme>;
}

/**
 * Displays attempt feedback in a responsive way:
 * - Small screens: Toast notification at the top right
 * - Large screens: Fixed position at the bottom of the screen
 */
export default function ResponsiveAttemptDisplay<T extends AttemptRecord>({
  items,
  renderItemContent,
  title,
  sx
}: ResponsiveAttemptDisplayProps<T>) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  // Don't render anything if there are no items to display
  if (!items || items.length === 0) return null;
  
  // Get the most recent attempt
  const latestAttempt = items[items.length - 1];
  
  if (isSmallScreen) {
    // Toast style notification for small screens
    return (
      <Fade in={true} timeout={300}>
        <Box
          sx={{
            position: 'fixed',
            top: 80, // Below the header
            right: 16,
            zIndex: 1000,
            maxWidth: '90%',
            width: 'auto',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            bgcolor: latestAttempt.isCorrect ? 'success.light' : 'error.light',
            color: 'white',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            ...sx
          }}
        >
          {/* Correctness Indicator */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            fontSize: '1.25rem',
            flexShrink: 0
          }}>
            {latestAttempt.isCorrect ? '✓' : '✗'}
          </Box>
          
          {/* Content */}
          {renderItemContent(latestAttempt)}
        </Box>
      </Fade>
    );
  } else {
    // Fixed bottom display for larger screens
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          left: 0,
          right: 0,
          zIndex: 900,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none', // Allow clicking through
          ...sx
        }}
      >
        <Fade in={true} timeout={300}>
          <Box
            sx={{
              maxWidth: 600,
              width: 'auto',
              pointerEvents: 'auto', // Re-enable pointer events
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              bgcolor: latestAttempt.isCorrect ? 'success.light' : 'error.light',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              opacity: 0.9,
              transition: 'opacity 0.2s ease-in-out',
              '&:hover': {
                opacity: 1
              }
            }}
          >
            {/* Correctness Indicator */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              fontSize: '1.5rem',
              flexShrink: 0
            }}>
              {latestAttempt.isCorrect ? '✓' : '✗'}
            </Box>
            
            {/* Content */}
            {renderItemContent(latestAttempt)}
            
            {/* If you want to show attempt count */}
            <Typography 
              variant="caption" 
              sx={{ 
                opacity: 0.8, 
                ml: 'auto', 
                bgcolor: 'rgba(255,255,255,0.2)', 
                px: 1, 
                py: 0.5, 
                borderRadius: 1 
              }}
            >
              {items.length > 1 ? `${items.length} attempts` : '1 attempt'}
            </Typography>
          </Box>
        </Fade>
      </Box>
    );
  }
} 