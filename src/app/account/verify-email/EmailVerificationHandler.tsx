'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function EmailVerificationHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const verify = async () => {
      if (!token || !email) {
        setStatus('error');
        setErrorMessage('Missing verification token or email.');
        return;
      }

      try {
        // Supabase automatically handles email verification through the token in the URL
        // We just need to check if the user is authenticated after the redirect
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session) {
          setStatus('success');
          setTimeout(() => router.push('/dashboard'), 3000);
        } else {
          // Try to verify using the token
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token,
            type: 'signup',
            email,
          });
          
          if (verifyError) {
            if (verifyError.message.includes('expired')) {
              setStatus('expired');
              setErrorMessage('Your verification link has expired.');
            } else {
              setStatus('error');
              setErrorMessage(verifyError.message);
            }
          } else {
            setStatus('success');
            setTimeout(() => router.push('/dashboard'), 3000);
          }
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
      }
    };

    verify();
  }, [token, email, router, supabase]);

  const handleResend = async () => {
    if (!email) return;
    setStatus('loading');
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/account/verify-email`,
        },
      });
      
      if (error) {
        throw error;
      }
      
      setStatus('success');
      setErrorMessage('A new verification email has been sent. Please check your inbox.');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to resend email.');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1">Verifying your email...</Typography>
          </Box>
        );
      case 'success':
        return (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="success.main">Verification Successful!</Typography>
            <Typography variant="body1">{errorMessage || 'You will be redirected shortly.'}</Typography>
          </Box>
        );
      case 'expired':
        return (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="error.main">Token Expired</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{errorMessage}</Typography>
            <Button variant="contained" onClick={handleResend}>Resend Verification Email</Button>
          </Box>
        );
      case 'error':
        return (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="error.main">Verification Failed</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{errorMessage}</Typography>
            <Button variant="contained" onClick={() => router.push('/account/login')}>Go to Login</Button>
          </Box>
        );
      default:
        return null;
    }
  };

  return <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto' }}>{renderContent()}</Box>;
} 