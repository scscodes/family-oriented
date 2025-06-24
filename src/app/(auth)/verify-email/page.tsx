import { Suspense } from 'react';
import { Metadata } from 'next';
import { CircularProgress, Box } from '@mui/material';
import EmailVerificationHandler from './EmailVerificationHandler';

export const metadata: Metadata = {
  title: 'Verify Email - Family Oriented',
  description: 'Verify your email address to activate your Family Oriented account and start your educational journey.',
  keywords: 'email verification, activate account, family oriented, educational games',
  openGraph: {
    title: 'Verify Email - Family Oriented',
    description: 'Verify your email address to activate your account.',
    type: 'website',
  },
};

/**
 * Email verification page
 * Server component for static export compatibility
 */
export default function VerifyEmailPage() {
  return (
    <Suspense 
      fallback={
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '400px' 
          }}
        >
          <CircularProgress size={48} />
        </Box>
      }
    >
      <EmailVerificationHandler />
    </Suspense>
  );
} 