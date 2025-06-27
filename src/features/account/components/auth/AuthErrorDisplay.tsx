'use client';

import React from 'react';
import { Alert, AlertTitle, Button, Box } from '@mui/material';
import { authErrorMessages } from '@/features/account/utils/authErrors';

interface AuthErrorDisplayProps {
  error: string | null;
  onRetry?: () => void;
  onResetPassword?: () => void;
  onContactSupport?: () => void;
}

export function AuthErrorDisplay({
  error,
  onRetry,
  onResetPassword,
  onContactSupport,
}: AuthErrorDisplayProps) {
  if (!error) return null;

  const errorMessage = authErrorMessages[error] || 'An unexpected error occurred. Please try again.';
  const isRateLimitError = error.includes('rate limit') || error.includes('too many requests');
  const isInvalidCredentials = error.includes('invalid credentials') || error.includes('user not found');

  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      <AlertTitle>Error</AlertTitle>
      {errorMessage}
      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
        {onRetry && <Button variant="outlined" color="error" size="small" onClick={onRetry}>Retry</Button>}
        {isInvalidCredentials && onResetPassword && (
          <Button variant="outlined" color="error" size="small" onClick={onResetPassword}>
            Reset Password
          </Button>
        )}
        {isRateLimitError && onContactSupport && (
          <Button variant="outlined" color="error" size="small" onClick={onContactSupport}>
            Contact Support
          </Button>
        )}
      </Box>
    </Alert>
  );
} 