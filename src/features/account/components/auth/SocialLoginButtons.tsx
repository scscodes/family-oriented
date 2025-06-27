'use client';

import React from 'react';
import { Box, Button, Divider, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';

interface SocialLoginButtonsProps {
  onGoogleLogin?: () => void;
  onGitHubLogin?: () => void;
}

export function SocialLoginButtons({
  onGoogleLogin,
  onGitHubLogin,
}: SocialLoginButtonsProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
      <Divider sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary">or continue with</Typography>
      </Divider>
      <Button
        variant="outlined"
        startIcon={<GoogleIcon />}
        fullWidth
        onClick={onGoogleLogin}
        disabled={!onGoogleLogin}
      >
        Sign in with Google
      </Button>
      <Button
        variant="outlined"
        startIcon={<GitHubIcon />}
        fullWidth
        onClick={onGitHubLogin}
        disabled={!onGitHubLogin}
      >
        Sign in with GitHub
      </Button>
    </Box>
  );
} 