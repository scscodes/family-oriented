import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface AuthLoadingSpinnerProps {
  message?: string;
  size?: number;
  fullHeight?: boolean;
}

export default function AuthLoadingSpinner({
  message = 'Loading...',
  size = 40,
  fullHeight = false,
}: AuthLoadingSpinnerProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: fullHeight ? '100vh' : 'auto',
        minHeight: fullHeight ? '100vh' : 200,
        width: '100%',
        p: 2,
      }}
      role="status"
      aria-label="Loading content"
    >
      <CircularProgress size={size} sx={{ mb: 2 }} />
      <Typography variant="body1">{message}</Typography>
    </Box>
  );
} 