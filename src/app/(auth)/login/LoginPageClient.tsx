'use client';

import React, { useEffect, useState } from 'react';
import { Paper, Box, Typography, Divider, Alert } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';

export default function LoginPageClient() {
  const searchParams = useSearchParams();
  const [urlParams, setUrlParams] = useState<{
    redirectTo?: string;
    error?: string;
    message?: string;
  }>({});

  useEffect(() => {
    // Extract URL parameters client-side
    setUrlParams({
      redirectTo: searchParams.get('redirectTo') || undefined,
      error: searchParams.get('error') || undefined,
      message: searchParams.get('message') || undefined,
    });
  }, [searchParams]);

  const { redirectTo, error, message } = urlParams;

  // Show demo mode information in development
  const isDemoMode = process.env.NODE_ENV === 'development';

  return (
    <>
      {/* Demo Mode Banner for Development */}
      {isDemoMode && (
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3,
            '& .MuiAlert-message': {
              fontSize: '0.875rem',
            },
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            Demo Mode Active
          </Typography>
          <Typography variant="body2">
            You can explore the platform without creating an account. Real authentication is available for production.
          </Typography>
        </Alert>
      )}

      {/* Error Message from URL Parameters */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          role="alert"
          aria-live="polite"
        >
          {decodeURIComponent(error)}
        </Alert>
      )}

      {/* Success/Info Message from URL Parameters */}
      {message && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          role="alert"
          aria-live="polite"
        >
          {decodeURIComponent(message)}
        </Alert>
      )}

      {/* Main Login Card */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 4 },
          width: '100%',
          maxWidth: '400px',
          mx: 'auto',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 3,
        }}
        role="main"
        aria-label="Login form container"
      >
        {/* Social Login Buttons */}
        <SocialLoginButtons disabled={false} />

        {/* Divider */}
        <Divider sx={{ my: 1 }}>
          <Typography variant="body2" color="text.secondary">
            or continue with email
          </Typography>
        </Divider>

        {/* Login Form */}
        <LoginForm 
          redirectTo={redirectTo}
          onSuccess={() => {
            // Optional success callback - form handles redirect internally
            console.log('Login successful');
          }}
        />
      </Paper>

      {/* Development Helper */}
      {isDemoMode && (
        <Box 
          sx={{ 
            mt: 3, 
            p: 2, 
            backgroundColor: 'background.default',
            borderRadius: 1,
            border: 1,
            borderColor: 'divider'
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>
            Development Helper:
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            • Demo mode is active - you can explore without real authentication<br/>
            • Social login buttons show placeholder alerts<br/>
            • Form validation is fully functional<br/>
            • Real Supabase authentication available when configured
          </Typography>
        </Box>
      )}
    </>
  );
} 