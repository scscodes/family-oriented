'use client';

import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { useRouter } from 'next/navigation';
import { styled } from '@mui/material/styles';

const StyledHeader = styled('header')(({ theme }) => ({
  padding: theme.spacing(3, 2),
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4, 3),
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  cursor: 'pointer',
  transition: theme.transitions.create(['transform', 'opacity'], {
    duration: theme.transitions.duration.short,
  }),
  
  '&:hover': {
    transform: 'scale(1.02)',
    opacity: 0.8,
  },
  
  '&:focus': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '4px',
    borderRadius: theme.shape.borderRadius,
  },
}));

interface AuthHeaderProps {
  title?: string;
  subtitle?: string;
}

export function AuthHeader({ 
  title = 'Family Learning Platform',
  subtitle = 'Educational games and activities for children'
}: AuthHeaderProps) {

  const router = useRouter();

  const handleLogoClick = () => {
    router.push('/');
  };

  return (
    <StyledHeader
      role="banner"
      aria-label="Authentication page header"
    >
      <LogoContainer
        onClick={handleLogoClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleLogoClick();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Go to homepage"
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 1,
            fontSize: { xs: '1.75rem', sm: '2.125rem' },
          }}
        >
          {title}
        </Typography>
        
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            maxWidth: '400px',
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          {subtitle}
        </Typography>
      </LogoContainer>
    </StyledHeader>
  );
} 