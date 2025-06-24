'use client';

import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Google as GoogleIcon, GitHub as GitHubIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const SocialButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  fontSize: '0.875rem',
  fontWeight: 500,
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.paper,
  width: '100%',
  justifyContent: 'flex-start',
  gap: theme.spacing(2),
  
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderColor: theme.palette.action.hover,
  },
  
  '&:focus': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
  },
  
  '&:disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
    borderColor: theme.palette.action.disabled,
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 20,
  height: 20,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}));

interface SocialLoginButtonsProps {
  onGoogleLogin?: () => void;
  onGitHubLogin?: () => void;
  disabled?: boolean;
  showMessage?: boolean;
}

export default function SocialLoginButtons({
  onGoogleLogin,
  onGitHubLogin,
  disabled = false,
  showMessage = true,
}: SocialLoginButtonsProps) {
  
  const handleGoogleLogin = () => {
    if (onGoogleLogin) {
      onGoogleLogin();
    } else {
      // Placeholder for future social login implementation
      console.log('Google login not yet implemented');
      alert('Google login will be available soon!');
    }
  };

  const handleGitHubLogin = () => {
    if (onGitHubLogin) {
      onGitHubLogin();
    } else {
      // Placeholder for future social login implementation
      console.log('GitHub login not yet implemented');
      alert('GitHub login will be available soon!');
    }
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 2,
        width: '100%',
      }}
      role="group"
      aria-label="Social login options"
    >
      {showMessage && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', mb: 1 }}
        >
          Continue with your social account
        </Typography>
      )}

      {/* Google Login Button */}
      <SocialButton
        onClick={handleGoogleLogin}
        disabled={disabled}
        variant="outlined"
        aria-label="Sign in with Google"
      >
        <IconWrapper>
          <GoogleIcon sx={{ color: '#4285F4' }} />
        </IconWrapper>
        <Typography
          component="span"
          sx={{
            flex: 1,
            textAlign: 'left',
            pl: 1,
          }}
        >
          Continue with Google
        </Typography>
      </SocialButton>

      {/* GitHub Login Button */}
      <SocialButton
        onClick={handleGitHubLogin}
        disabled={disabled}
        variant="outlined"
        aria-label="Sign in with GitHub"
      >
        <IconWrapper>
          <GitHubIcon sx={{ color: '#333' }} />
        </IconWrapper>
        <Typography
          component="span"
          sx={{
            flex: 1,
            textAlign: 'left',
            pl: 1,
          }}
        >
          Continue with GitHub
        </Typography>
      </SocialButton>
    </Box>
  );
} 