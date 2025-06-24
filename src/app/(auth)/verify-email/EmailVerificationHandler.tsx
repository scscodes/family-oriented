'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  CircularProgress,
  Fade,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  ErrorOutline,
  Email,
  Refresh,
  Login,
  Home,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/utils/logger';
import Link from 'next/link';

type VerificationState = 
  | 'loading'
  | 'success' 
  | 'error'
  | 'expired'
  | 'already_verified'
  | 'invalid_token';

interface VerificationResult {
  state: VerificationState;
  message: string;
  email?: string;
  error?: string;
}

export default function EmailVerificationHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resendConfirmation } = useAuth();
  
  const [verificationResult, setVerificationResult] = useState<VerificationResult>({
    state: 'loading',
    message: 'Verifying your email address...',
  });
  const [isResending, setIsResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Extract parameters from URL
  const token = searchParams?.get('token');
  const type = searchParams?.get('type');
  const email = searchParams?.get('email');
  const message = searchParams?.get('message');

  // Handle verification on component mount
  useEffect(() => {
    const verifyEmail = async () => {
      // If no token but has message (from registration), show instruction state
      if (!token && message) {
        setVerificationResult({
          state: 'loading',
          message: decodeURIComponent(message),
          email: email || undefined,
        });
        return;
      }

      // If no token and no message, show error
      if (!token) {
        setVerificationResult({
          state: 'error',
          message: 'Invalid verification link. Please check your email for a valid verification link.',
        });
        return;
      }

      try {
        const supabase = createClient();
        
        // Verify the email token
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email',
        });

        if (error) {
          logger.error('Email verification failed', error);
          
          // Handle specific error cases
          if (error.message.includes('expired')) {
            setVerificationResult({
              state: 'expired',
              message: 'This verification link has expired. Please request a new one.',
              email: email || undefined,
            });
          } else if (error.message.includes('invalid')) {
            setVerificationResult({
              state: 'invalid_token',
              message: 'This verification link is invalid. Please check your email for a valid link.',
            });
          } else if (error.message.includes('already')) {
            setVerificationResult({
              state: 'already_verified',
              message: 'Your email has already been verified. You can now sign in to your account.',
              email: email || undefined,
            });
          } else {
            setVerificationResult({
              state: 'error',
              message: 'Email verification failed. Please try again or contact support.',
              error: error.message,
            });
          }
          return;
        }

        // Success case
        if (data?.user) {
          logger.info('Email verification successful', { userId: data.user.id });
          setVerificationResult({
            state: 'success',
            message: 'Your email has been successfully verified! You can now access all features of your account.',
            email: data.user.email || email || undefined,
          });
          
          // Auto-redirect to dashboard after a delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        } else {
          setVerificationResult({
            state: 'error',
            message: 'Verification completed but user data is incomplete. Please try signing in.',
          });
        }

      } catch (error) {
        logger.error('Email verification process error', error);
        setVerificationResult({
          state: 'error',
          message: 'An unexpected error occurred during verification. Please try again.',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    };

    verifyEmail();
  }, [token, type, email, message, router]);

  // Handle resend confirmation email
  const handleResendConfirmation = async () => {
    if (!verificationResult.email) {
      setVerificationResult({
        ...verificationResult,
        error: 'Email address not available. Please try registering again.',
      });
      return;
    }

    setIsResending(true);
    
    try {
      const result = await resendConfirmation(verificationResult.email);
      
      if (result.error) {
        setVerificationResult({
          ...verificationResult,
          error: result.error,
        });
      } else {
        setResendCount(prev => prev + 1);
        setVerificationResult({
          ...verificationResult,
          message: 'Verification email sent! Please check your inbox and spam folder.',
          error: undefined,
        });
        
        // Set cooldown based on resend count
        const cooldownTime = Math.min(60 * Math.pow(2, resendCount), 300); // Max 5 minutes
        setResendCooldown(cooldownTime);
        
        // Countdown timer
        const interval = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      logger.error('Resend confirmation failed', error);
      setVerificationResult({
        ...verificationResult,
        error: 'Failed to resend verification email. Please try again later.',
      });
    } finally {
      setIsResending(false);
    }
  };

  const getStateIcon = () => {
    switch (verificationResult.state) {
      case 'loading':
        return <CircularProgress size={80} color="primary" />;
      case 'success':
      case 'already_verified':
        return <CheckCircle sx={{ fontSize: 80, color: 'success.main' }} />;
      case 'error':
      case 'expired':
      case 'invalid_token':
        return <ErrorOutline sx={{ fontSize: 80, color: 'error.main' }} />;
      default:
        return <Email sx={{ fontSize: 80, color: 'primary.main' }} />;
    }
  };

  const getStateColor = () => {
    switch (verificationResult.state) {
      case 'success':
      case 'already_verified':
        return 'success';
      case 'error':
      case 'expired':
      case 'invalid_token':
        return 'error';
      default:
        return 'info';
    }
  };

  const getActionButtons = () => {
    switch (verificationResult.state) {
      case 'success':
      case 'already_verified':
        return (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Login />}
              onClick={() => router.push('/login')}
              sx={{ py: 1.5 }}
            >
              Sign In
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Home />}
              onClick={() => router.push('/')}
              sx={{ py: 1.5 }}
            >
              Go Home
            </Button>
          </Box>
        );

      case 'expired':
      case 'error':
        return (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mt: 4 }}>
            {verificationResult.email && (
              <Button
                variant="contained"
                size="large"
                startIcon={isResending ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
                onClick={handleResendConfirmation}
                disabled={isResending || resendCooldown > 0}
                sx={{ py: 1.5 }}
              >
                {isResending ? 'Sending...' : 
                 resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 
                 'Resend Verification Email'}
              </Button>
            )}
            <Button
              variant="outlined"
              size="large"
              startIcon={<Login />}
              onClick={() => router.push('/login')}
              sx={{ py: 1.5 }}
            >
              Back to Login
            </Button>
          </Box>
        );

      case 'loading':
        if (message) {
          return (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mt: 4 }}>
              {verificationResult.email && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={isResending ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
                  onClick={handleResendConfirmation}
                  disabled={isResending || resendCooldown > 0}
                  sx={{ py: 1.5 }}
                >
                  {isResending ? 'Sending...' : 
                   resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 
                   'Resend Verification Email'}
                </Button>
              )}
              <Button
                variant="outlined"
                size="large"
                startIcon={<Login />}
                onClick={() => router.push('/login')}
                sx={{ py: 1.5 }}
              >
                Back to Login
              </Button>
            </Box>
          );
        }
        return null;

      default:
        return (
          <Button
            variant="outlined"
            size="large"
            startIcon={<Home />}
            onClick={() => router.push('/')}
            sx={{ py: 1.5, mt: 4 }}
          >
            Go Home
          </Button>
        );
    }
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 4,
        width: '100%',
        maxWidth: 600,
        mx: 'auto',
        p: 4,
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          fontWeight="bold"
          gutterBottom
        >
          Email Verification
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {verificationResult.state === 'loading' && !message 
            ? 'Please wait while we verify your email address.'
            : 'Confirm your email address to activate your account.'
          }
        </Typography>
      </Box>

      {/* Main Content */}
      <Paper elevation={2} sx={{ p: 4 }}>
        <Fade in={true}>
          <Box sx={{ textAlign: 'center' }}>
            {/* State Icon */}
            <Box sx={{ mb: 3 }}>
              {getStateIcon()}
            </Box>

            {/* State Message */}
            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
              {verificationResult.state === 'loading' && !message ? 'Verifying...' :
               verificationResult.state === 'success' ? 'Email Verified!' :
               verificationResult.state === 'already_verified' ? 'Already Verified' :
               verificationResult.state === 'expired' ? 'Link Expired' :
               verificationResult.state === 'invalid_token' ? 'Invalid Link' :
               verificationResult.state === 'error' ? 'Verification Failed' :
               'Check Your Email'}
            </Typography>

            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}
            >
              {verificationResult.message}
            </Typography>

            {/* Email Display */}
            {verificationResult.email && (
              <Alert 
                severity={getStateColor()} 
                icon={<Email />}
                sx={{ mb: 3, textAlign: 'left' }}
              >
                <Typography variant="body2">
                  Email: <strong>{verificationResult.email}</strong>
                </Typography>
              </Alert>
            )}

            {/* Error Display */}
            {verificationResult.error && (
              <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="body2">
                  {verificationResult.error}
                </Typography>
              </Alert>
            )}

            {/* Success Message for Auto-redirect */}
            {verificationResult.state === 'success' && (
              <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="body2">
                  You will be automatically redirected to your dashboard in a few seconds...
                </Typography>
              </Alert>
            )}

            {/* Action Buttons */}
            {getActionButtons()}

            {/* Resend Count Display */}
            {resendCount > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Verification emails sent: {resendCount}
              </Typography>
            )}
          </Box>
        </Fade>
      </Paper>

      {/* Help Information */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Having trouble?</strong> Check your spam folder or contact support if you continue to have issues.
          Make sure to click the most recent verification link if you&apos;ve requested multiple emails.
        </Typography>
      </Alert>

      {/* Navigation Links */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Need help?{' '}
          <Link href="/support" style={{ color: 'inherit', fontWeight: 'bold' }}>
            Contact Support
          </Link>
          {' • '}
          <Link href="/login" style={{ color: 'inherit', fontWeight: 'bold' }}>
            Back to Login
          </Link>
        </Typography>
      </Box>
    </Box>
  );
} 