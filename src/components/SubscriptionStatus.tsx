/**
 * SubscriptionStatus Component
 * Displays current subscription tier, usage, and upgrade options
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Button,
  Alert,
  Grid,
  Stack
} from '@mui/material';
import { 
  Upgrade, 
  AccountCircle, 
  Analytics, 
  Palette, 
  Collections,
  Business,
  Warning
} from '@mui/icons-material';
import { useSubscription } from '@/hooks/useSubscription';
import { TIER_CONFIGURATIONS, type SubscriptionTier } from '@/utils/subscriptionService';

interface SubscriptionStatusProps {
  showUpgradePrompt?: boolean;
  compact?: boolean;
}

/**
 * Usage bar component with visual indicator
 */
const UsageBar: React.FC<{
  label: string;
  current: number;
  limit: number;
  warningThreshold?: number;
}> = ({ label, current, limit, warningThreshold = 0.8 }) => {
  const percentage = Math.min((current / limit) * 100, 100);
  const isWarning = current / limit >= warningThreshold;
  const isOver = current >= limit;

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" color={isOver ? 'error.main' : 'text.primary'}>
          {current} / {limit === 10000 ? '∞' : limit}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        color={isOver ? 'error' : isWarning ? 'warning' : 'primary'}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  );
};

/**
 * Feature availability chip
 */
const FeatureChip: React.FC<{
  feature: string;
  available: boolean;
}> = ({ feature, available }) => (
  <Chip
    label={feature}
    color={available ? 'success' : 'default'}
    variant={available ? 'filled' : 'outlined'}
    size="small"
    sx={{ mr: 1, mb: 1 }}
  />
);

/**
 * Main subscription status component
 */
export default function SubscriptionStatus({ showUpgradePrompt = true, compact = false }: SubscriptionStatusProps) {
  const { 
    subscriptionPlan, 
    tier, 
    isLoaded, 
    currentUsage, 
    getAvailableFeatures,
    canCreateAvatar 
  } = useSubscription();

  // Debug logging
  console.log('SubscriptionStatus Debug:', {
    subscriptionPlan,
    tier,
    isLoaded,
    currentUsage
  });

  if (!isLoaded) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Loading subscription information...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!subscriptionPlan) {
    return (
      <Alert severity="warning" action={
        <Button 
          color="inherit" 
          size="small" 
          startIcon={<Upgrade />}
          onClick={() => {
            // For demo purposes, provide helpful message
            alert('Demo Mode: This would normally redirect to a subscription signup page. Current demo uses Professional plan features.');
          }}
        >
          Get Started
        </Button>
      }>
        No active subscription plan. Please contact support or upgrade to continue.
      </Alert>
    );
  }

  const tierConfig = TIER_CONFIGURATIONS[tier as SubscriptionTier];
  const availableFeatures = getAvailableFeatures();
  const avatarCreationResult = canCreateAvatar();
  const avatarLimit = subscriptionPlan.avatar_limit || tierConfig?.limits.avatars || 5;

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip 
          label={tierConfig?.displayName || tier} 
          color="primary" 
          variant="filled"
        />
        <Typography variant="body2" color="text.secondary">
          {currentUsage.avatarsCount}/{avatarLimit} avatars
        </Typography>
        {!avatarCreationResult.allowed && (
          <Chip 
            label="Limit Reached" 
            color="warning" 
            size="small"
            icon={<Warning />}
          />
        )}
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Plan Information */}
          <Box sx={{ flex: 1 }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Business color="primary" />
                <Typography variant="h6">
                  {tierConfig?.displayName || `${tier} Plan`}
                </Typography>
                <Chip 
                  label={tier?.toUpperCase() || 'UNKNOWN'} 
                  color="primary" 
                  size="small"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                {tierConfig?.description || 'Subscription plan active'}
              </Typography>

              {/* Usage Meters */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Usage Overview
                </Typography>
                
                <UsageBar
                  label="Avatars (Children)"
                  current={currentUsage.avatarsCount}
                  limit={avatarLimit}
                />
                
                {/* Add more usage bars here as needed */}
              </Box>
            </Stack>
          </Box>

          {/* Features & Actions */}
          <Box sx={{ flex: 1 }}>
            <Stack spacing={2}>
              <Typography variant="subtitle2">
                Available Features
              </Typography>
              
              <Box>
                <FeatureChip feature="Analytics" available={availableFeatures.includes('analytics')} />
                <FeatureChip feature="User Management" available={availableFeatures.includes('user_management')} />
                <FeatureChip feature="Premium Themes" available={availableFeatures.includes('premium_themes')} />
                <FeatureChip feature="Collections" available={availableFeatures.includes('collections')} />
                <FeatureChip feature="Scheduling" available={availableFeatures.includes('scheduling')} />
                <FeatureChip feature="Data Export" available={availableFeatures.includes('export_data')} />
              </Box>

              {/* Upgrade prompt if at limits */}
              {showUpgradePrompt && !avatarCreationResult.allowed && (
                <Alert 
                  severity="warning" 
                  action={
                    <Button 
                      color="inherit" 
                      size="small"
                      startIcon={<Upgrade />}
                    >
                      Upgrade Plan
                    </Button>
                  }
                >
                  <Typography variant="body2">
                    {avatarCreationResult.reason}
                  </Typography>
                </Alert>
              )}

              {/* Plan management actions */}
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<Analytics />}
                >
                  View Usage
                </Button>
                <Button 
                  variant="contained" 
                  size="small"
                  startIcon={<Upgrade />}
                >
                  Manage Plan
                </Button>
              </Box>
            </Stack>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

/**
 * Quick subscription info for header/navbar
 */
export function SubscriptionBadge() {
  const { tier, currentUsage, canCreateAvatar } = useSubscription();
  const avatarResult = canCreateAvatar();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Chip 
        label={tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Free'} 
        color="primary" 
        size="small"
      />
      {!avatarResult.allowed && (
        <Chip 
          label="Limit Reached" 
          color="warning" 
          size="small"
          icon={<Warning />}
        />
      )}
    </Box>
  );
} 