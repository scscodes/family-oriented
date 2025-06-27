/**
 * Demo Success Notification Component
 * Shows success message when demo scenario transitions complete
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Typography
} from '@mui/material';
import { useDemo } from '@/stores/hooks';
import { TIER_CONFIGURATIONS } from '@/utils/subscriptionService';

export default function DemoSuccessNotification() {
  const { currentConfig, isTransitioning } = useDemo();
  const [open, setOpen] = useState(false);
  const [lastConfigTier, setLastConfigTier] = useState<string | null>(null);

  useEffect(() => {
    // Show notification when config changes and we're not transitioning
    if (currentConfig && !isTransitioning && currentConfig.tier !== lastConfigTier) {
      setOpen(true);
      setLastConfigTier(currentConfig.tier);
    }
  }, [currentConfig, isTransitioning, lastConfigTier]);

  const handleClose = () => {
    setOpen(false);
  };

  if (!currentConfig) {
    return null;
  }

  const tierConfig = TIER_CONFIGURATIONS[currentConfig.tier];

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ mt: 8 }} // Offset for debug banner
    >
      <Alert 
        onClose={handleClose} 
        severity="success" 
        variant="filled"
        sx={{ width: '100%' }}
      >
        <Typography variant="body2">
          🎉 Switched to <strong>{tierConfig.displayName}</strong>
        </Typography>
        <Typography variant="caption" display="block">
          {currentConfig.name} • {currentConfig.avatarLimit} avatars • {currentConfig.orgName}
        </Typography>
      </Alert>
    </Snackbar>
  );
} 