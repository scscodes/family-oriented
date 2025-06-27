import { Box } from '@mui/material';
import { AuthHeader } from '@/features/account/components/auth/AuthHeader';
import { ReactNode } from 'react';
import Head from 'next/head';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Head>
        <title>Authentication - Family Oriented</title>
        <meta name="description" content="Login or register to access personalized educational games." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Box
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
        role="main"
        aria-label="Authentication Page"
      >
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            p: 4,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          aria-hidden="true"
        >
          {/* Sidebar content or branding can go here */}
          <Box sx={{ textAlign: 'center' }}>
            <h2>Welcome to Family Oriented</h2>
            <p>Engage in educational games tailored for your family.</p>
          </Box>
        </Box>
        <Box
          sx={{
            p: { xs: 2, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <AuthHeader />
          <Box sx={{ width: '100%', maxWidth: 400, mt: 2 }}>
            {children}
          </Box>
        </Box>
      </Box>
    </>
  );
} 