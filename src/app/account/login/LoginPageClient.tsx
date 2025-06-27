'use client';

import React from 'react';
import { Box } from '@mui/material';
import { LoginForm } from '@/features/account/components/auth/LoginForm';
import { SocialLoginButtons } from '@/features/account/components/auth/SocialLoginButtons';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/account/hooks/useAuth';
import { TestAccountList } from '@/shared/components/debug/TestAccountList';

export function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const { signIn } = useAuth();

  const handleLoginSuccess = () => {
    router.push(redirectTo);
  };

  const handleTestAccountSelect = (email: string, password: string) => {
    // Trigger login with selected test account
    signIn(email, password).then((result) => {
      if (result.success) {
        handleLoginSuccess();
      }
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <TestAccountList onAccountSelect={handleTestAccountSelect} />
      <LoginForm onLoginSuccess={handleLoginSuccess} />
      <SocialLoginButtons />
    </Box>
  );
} 