/**
 * FeatureGate Component
 * Conditionally renders content based on subscription tier and feature access
 * Provides upgrade prompts for locked features
 */

'use client';

import React, { ReactNode, useMemo } from 'react';
import {
  Box,
  Alert,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack
} from '@mui/material';
import { 
  Lock,
  CheckCircle 
} from '@mui/icons-material';
import { useSubscription } from '@/hooks/useSubscription';
import { type SubscriptionFeature } from '@/utils/subscriptionService';
import TierTransitionButton from '@/features/subscription/components/TierTransitionButton';

interface FeatureGateProps {
  feature: SubscriptionFeature;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  mode?: 'hide' | 'disable' | 'overlay' | 'alert';
  compact?: boolean;
}

/**
 * Feature gate component with multiple display modes
 */
const FeatureGate = React.memo(({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  mode = 'hide',
  compact = false
}: FeatureGateProps) => {
  const { canAccessFeature, formatFeatureMessage, tier } = useSubscription();
  
  // Memoize access result to prevent unnecessary re-computation
  const accessResult = useMemo(() => {
    return canAccessFeature(feature);
  }, [canAccessFeature, feature]);
  
  // Memoize formatted message
  const formattedMessage = useMemo(() => {
    return formatFeatureMessage(accessResult);
  }, [formatFeatureMessage, accessResult]);
  
  // If access is granted, render children normally
  if (accessResult.allowed) {
    return <>{children}</>;
  }

  // Handle different display modes for denied access
  switch (mode) {
    case 'hide':
      return fallback ? <>{fallback}</> : null;
      
    case 'disable':
      return (
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ 
            opacity: 0.5, 
            pointerEvents: 'none',
            filter: 'grayscale(100%)'
          }}>
            {children}
          </Box>
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            p: 1 
          }}>
            <Chip 
              icon={<Lock />} 
              label={`${accessResult.upgradeRequired?.toUpperCase()} Required`}
              size="small"
              color="default"
            />
          </Box>
        </Box>
      );
      
    case 'overlay':
      return (
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ 
            opacity: 0.3, 
            pointerEvents: 'none',
            filter: 'blur(2px)'
          }}>
            {children}
          </Box>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            bgcolor: 'background.paper',
            p: 2,
            borderRadius: 2,
            boxShadow: 3,
            border: 1,
            borderColor: 'divider'
          }}>
            <Stack spacing={2} alignItems="center">
              <Lock color="action" fontSize="large" />
              <Typography variant="h6" color="text.secondary">
                {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Locked
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formattedMessage}
              </Typography>
              {showUpgradePrompt && accessResult.upgradeRequired && (
                <TierTransitionButton 
                  targetTier={accessResult.upgradeRequired}
                  variant="contained"
                  size="small"
                />
              )}
            </Stack>
          </Box>
        </Box>
      );
      
    case 'alert':
    default:
      if (compact) {
        return (
          <Alert 
            severity="info" 
            icon={<Lock />}
            action={
              showUpgradePrompt && accessResult.upgradeRequired ? (
                <TierTransitionButton 
                  targetTier={accessResult.upgradeRequired}
                  variant="outlined"
                  size="small"
                />
              ) : undefined
            }
          >
            <Typography variant="body2">
              {formattedMessage}
            </Typography>
          </Alert>
        );
      }

      return (
        <Card sx={{ bgcolor: 'grey.50', border: 1, borderColor: 'grey.200' }}>
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lock color="action" />
                <Typography variant="h6" color="text.secondary">
                  {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Not Available
                </Typography>
                <Chip 
                  label={`Current: ${tier?.toUpperCase() || 'NONE'}`}
                  size="small"
                  variant="outlined"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                {formattedMessage}
              </Typography>
              
              {showUpgradePrompt && accessResult.upgradeRequired && (
                <Box>
                                    <TierTransitionButton
                    targetTier={accessResult.upgradeRequired}
                    variant="contained"
                  />
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      );
  }
});

FeatureGate.displayName = 'FeatureGate';

export default FeatureGate;

/**
 * Simple feature checker hook for conditional rendering
 */
export function useFeatureGate(feature: SubscriptionFeature) {
  const { canAccessFeature } = useSubscription();
  return canAccessFeature(feature);
}

/**
 * Feature availability indicator component
 */
export function FeatureAvailabilityChip({ 
  feature, 
  showLabel = true 
}: { 
  feature: SubscriptionFeature;
  showLabel?: boolean; 
}) {
  const { canAccessFeature } = useSubscription();
  const result = canAccessFeature(feature);
  
  const label = showLabel ? feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';
  
  if (result.allowed) {
    return (
      <Chip
        icon={<CheckCircle />}
        label={label || 'Available'}
        color="success"
        size="small"
        variant="filled"
      />
    );
  }
  
  return (
    <Chip
      icon={<Lock />}
      label={label || `${result.upgradeRequired?.toUpperCase()} Required`}
      color="default"
      size="small"
      variant="outlined"
    />
  );
} 