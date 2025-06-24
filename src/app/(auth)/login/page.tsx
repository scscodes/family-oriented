import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { CircularProgress, Box } from '@mui/material';
import LoginPageClient from './LoginPageClient';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your account to access educational games and activities.',
  robots: 'noindex, nofollow',
};

function LoginPageFallback() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
      }}
    >
      <CircularProgress />
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageClient />
    </Suspense>
  );
} 