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
import { useDemo } from '@/context/DemoContext';
import { TIER_CONFIGURATIONS } from '@/utils/subscriptionService';

export default function DemoSuccessNotification() {
  const { currentConfig, isTransitioning } = useDemo();
  const [showSuccess, setShowSuccess] = useState(false);
  const [previousTransitioning, setPreviousTransitioning] = useState(false);

  // Show success notification when transition completes
  useEffect(() => {
    if (previousTransitioning && !isTransitioning) {
      setShowSuccess(true);
    }
    setPreviousTransitioning(isTransitioning);
  }, [isTransitioning, previousTransitioning]);

  const handleClose = () => {
    setShowSuccess(false);
  };

  const tierConfig = TIER_CONFIGURATIONS[currentConfig.tier];

  return (
    <Snackbar
      open={showSuccess}
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
          {currentConfig.name} • {currentConfig.avatarCount} avatars • {currentConfig.orgName}
        </Typography>
      </Alert>
    </Snackbar>
  );
} 