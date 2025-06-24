import { Suspense } from 'react';
import { Metadata } from 'next';
import { CircularProgress, Box } from '@mui/material';
import SignUpPageClient from './SignUpPageClient';

export const metadata: Metadata = {
  title: 'Sign Up - Family Oriented',
  description: 'Create your Family Oriented account and start your educational journey with personalized games and learning analytics.',
  keywords: 'sign up, register, family oriented, educational games, kids learning',
  openGraph: {
    title: 'Sign Up - Family Oriented',
    description: 'Create your account and start your educational journey.',
    type: 'website',
  },
};

/**
 * Registration page with multi-step flow
 * Server component for static export compatibility
 */
export default function SignUpPage() {
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
      <SignUpPageClient />
    </Suspense>
  );
} 