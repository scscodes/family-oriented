/**
 * Tier Transition Button Component
 * Simple button that triggers tier transitions with validation
 */

'use client';

import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  CircularProgress,
  Box,
  Chip
} from '@mui/material';
import { Upgrade, ArrowDownward } from '@mui/icons-material';
import { useTierTransition, type TierTransitionAnalysis } from '@/hooks/useTierTransition';
import { type SubscriptionTier } from '@/utils/subscriptionService';

interface TierTransitionButtonProps {
  targetTier: SubscriptionTier;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
}

export default function TierTransitionButton({ 
  targetTier, 
  variant = 'contained',
  size = 'medium'
}: TierTransitionButtonProps) {
  const { 
    currentTier,
    analyzeTransition,
    executeTransition,
    getTierDisplayName,
    isLoading,
    error,
    clearError
  } = useTierTransition();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [analysis, setAnalysis] = useState<TierTransitionAnalysis | null>(null);

  // Don't show button if it's the current tier
  if (currentTier === targetTier) {
    return null;
  }

  const handleAnalyze = async () => {
    try {
      clearError();
      const result = await analyzeTransition(targetTier);
      setAnalysis(result);
      setDialogOpen(true);
    } catch (err) {
      console.error('Failed to analyze transition:', err);
    }
  };

  const handleConfirm = async () => {
    try {
      const result = await executeTransition(targetTier);
      if (result.success) {
        setDialogOpen(false);
        setAnalysis(null);
        alert(result.message); // In real app, use proper notification
      }
    } catch (err) {
      console.error('Failed to execute transition:', err);
    }
  };

  const handleClose = () => {
    setDialogOpen(false);
    setAnalysis(null);
    clearError();
  };

  const isUpgrade = analysis?.isUpgrade ?? false;
  const tierName = getTierDisplayName(targetTier);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleAnalyze}
        disabled={isLoading}
        startIcon={isUpgrade ? <Upgrade /> : <ArrowDownward />}
      >
        {isUpgrade ? 'Upgrade to' : 'Switch to'} {tierName}
      </Button>

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Confirm {isUpgrade ? 'Upgrade' : 'Plan Change'}
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {analysis && (
            <Box>
              <Typography variant="body1" gutterBottom>
                {isUpgrade ? 'Upgrade' : 'Change'} from{' '}
                <Chip label={getTierDisplayName(analysis.fromTier)} size="small" />{' '}
                to{' '}
                <Chip label={getTierDisplayName(analysis.toTier)} size="small" color="primary" />
              </Typography>

              {/* Cost Impact */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Cost Impact:
                </Typography>
                <Typography variant="body2">
                  Monthly cost: ${analysis.costImpact.currentCost} → ${analysis.costImpact.newCost}
                </Typography>
                <Typography 
                  variant="body2" 
                  color={analysis.costImpact.monthlyDifference > 0 ? 'error.main' : 'success.main'}
                >
                  Difference: {analysis.costImpact.monthlyDifference > 0 ? '+' : ''}
                  ${analysis.costImpact.monthlyDifference.toFixed(2)}/month
                </Typography>
                {analysis.costImpact.prorationAmount !== 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {analysis.costImpact.prorationDescription}
                  </Typography>
                )}
              </Box>

              {/* Feature Changes */}
              {analysis.featureChanges.gained.length > 0 && (
                <Box sx={{ mb: 2 }}>
                                                     <Typography variant="subtitle2" color="success.main" gutterBottom>
                    Features you&apos;ll gain:
                  </Typography>
                  <Typography variant="body2">
                    {analysis.featureChanges.gained.join(', ')}
                  </Typography>
                </Box>
              )}

              {analysis.featureChanges.lost.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="error.main" gutterBottom>
                    Features you&apos;ll lose:
                  </Typography>
                  <Typography variant="body2">
                    {analysis.featureChanges.lost.join(', ')}
                  </Typography>
                </Box>
              )}

              {/* Warnings */}
              {analysis.warnings.length > 0 && (
                <Alert severity={analysis.canTransition ? 'warning' : 'error'} sx={{ mb: 2 }}>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {analysis.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={isLoading || !analysis?.canTransition}
            startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
          >
            {isLoading ? 'Processing...' : `Confirm ${isUpgrade ? 'Upgrade' : 'Change'}`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 