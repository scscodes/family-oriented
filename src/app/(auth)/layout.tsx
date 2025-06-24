import React from 'react';
import { Box, Container } from '@mui/material';
import { Metadata } from 'next';
import AuthHeader from '@/components/auth/AuthHeader';

export const metadata: Metadata = {
  title: {
    template: '%s | Family Learning Platform',
    default: 'Authentication | Family Learning Platform',
  },
  description: 'Sign in or create an account to access educational games and activities for children.',
  keywords: ['education', 'children', 'learning', 'games', 'family', 'authentication'],
  robots: 'noindex, nofollow', // Don't index auth pages
  openGraph: {
    title: 'Authentication | Family Learning Platform',
    description: 'Sign in or create an account to access educational games and activities for children.',
    type: 'website',
  },
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        backgroundColor: 'background.default',
      }}
      role="main"
      aria-label="Authentication area"
    >
      {/* Header */}
      <AuthHeader />
      
      {/* Main Content Area */}
      <Container
        maxWidth="sm"
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 4, sm: 6, md: 8 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '400px',
            mx: 'auto',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 3,
          }}
        >
          {children}
        </Box>
      </Container>
      
      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          borderTop: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          textAlign: 'center',
        }}
        role="contentinfo"
        aria-label="Authentication page footer"
      >
        <Box
          sx={{
            fontSize: '0.875rem',
            color: 'text.secondary',
            '& a': {
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
              '&:focus': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: '2px',
                borderRadius: 1,
              },
            },
          }}
        >
          © 2024 Family Learning Platform. All rights reserved.
          {' • '}
          <a href="/privacy" tabIndex={0}>Privacy Policy</a>
          {' • '}
          <a href="/terms" tabIndex={0}>Terms of Service</a>
        </Box>
      </Box>
    </Box>
  );
} 