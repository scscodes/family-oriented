/**
 * Demo Transition Preview Component
 * Shows users what will change when switching demo scenarios
 * Provides validation and preview of tier transitions
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Upgrade,
  ArrowDownward,
  Person
} from '@mui/icons-material';
import { useDemo } from '@/stores/hooks';
import { useUser } from '@/stores/hooks';
import { TIER_CONFIGURATIONS, type SubscriptionTier } from '@/utils/subscriptionService';
import { DEMO_SCENARIOS } from '@/utils/demoConfig';

interface DemoTransitionPreviewProps {
  targetScenarioKey: string;
}

export default function DemoTransitionPreview({ targetScenarioKey }: DemoTransitionPreviewProps) {
  const { currentConfig } = useDemo();
  const { avatars } = useUser();
  
  const targetConfig = DEMO_SCENARIOS[targetScenarioKey];
  
  if (!targetConfig) {
    return null;
  }

  if (!currentConfig) {
    return null;
  }

  const currentTier = currentConfig.tier;
  const targetTier = targetConfig.tier;
  const isUpgrade = getTierPriority(targetTier) > getTierPriority(currentTier);
  const isDowngrade = getTierPriority(targetTier) < getTierPriority(currentTier);
  const isSameTier = currentTier === targetTier;

  const currentTierConfig = TIER_CONFIGURATIONS[currentTier];
  const targetTierConfig = TIER_CONFIGURATIONS[targetTier];

  // Calculate feature changes
  const currentFeatures = Object.entries(currentTierConfig.features)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name);
  
  const targetFeatures = Object.entries(targetTierConfig.features)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name);

  const gainedFeatures = targetFeatures.filter(f => !currentFeatures.includes(f));
  const lostFeatures = currentFeatures.filter(f => !targetFeatures.includes(f));

  // Check avatar limit compatibility
  const currentAvatarCount = avatars?.length || 0;
  const currentAvatarLimit = currentTierConfig.limits.avatars;
  const targetAvatarLimit = targetTierConfig.limits.avatars;
  const avatarLimitIssue = targetAvatarLimit < currentAvatarCount;

  return (
    <Box>
      {/* Tier Change Summary */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Tier Change
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            label={currentTierConfig.displayName} 
            size="small" 
            variant="outlined" 
          />
          {isUpgrade ? <Upgrade color="success" /> : isDowngrade ? <ArrowDownward color="warning" /> : '→'}
          <Chip 
            label={targetTierConfig.displayName} 
            size="small" 
            color={isUpgrade ? 'success' : isDowngrade ? 'warning' : 'default'}
          />
        </Box>
      </Box>

      {/* Avatar Limit Changes */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Avatar Limits
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person sx={{ fontSize: 16 }} />
          <Typography variant="body2">
            {currentAvatarLimit === 10000 ? 'Unlimited' : currentAvatarLimit} → {targetAvatarLimit === 10000 ? 'Unlimited' : targetAvatarLimit}
          </Typography>
          {avatarLimitIssue && (
            <Chip 
              label="⚠️ Over Limit" 
              size="small" 
              color="error" 
              variant="outlined"
            />
          )}
        </Box>
        {avatarLimitIssue && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            Current avatar count ({currentAvatarCount}) exceeds target limit ({targetAvatarLimit}). 
            Some avatars may need to be removed.
          </Alert>
        )}
      </Box>

      {/* Feature Changes */}
      {!isSameTier && (gainedFeatures.length > 0 || lostFeatures.length > 0) && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Feature Changes
          </Typography>
          
          {gainedFeatures.length > 0 && (
            <List dense>
              <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                Gained Features:
              </Typography>
              {gainedFeatures.map((feature) => (
                <ListItem key={feature} sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={formatFeatureName(feature)}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          )}

          {lostFeatures.length > 0 && (
            <List dense>
              <Typography variant="caption" color="error.main" sx={{ fontWeight: 600 }}>
                Lost Features:
              </Typography>
              {lostFeatures.map((feature) => (
                <ListItem key={feature} sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <Cancel sx={{ fontSize: 16, color: 'error.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={formatFeatureName(feature)}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </>
      )}

      {/* Organization Change */}
      <Divider sx={{ my: 2 }} />
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Organization
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {currentConfig.orgName} → {targetConfig.orgName}
        </Typography>
      </Box>
    </Box>
  );
}

// Helper functions
function getTierPriority(tier: SubscriptionTier): number {
  const priorities = { personal: 1, professional: 2, enterprise: 3 };
  return priorities[tier];
}

function formatFeatureName(feature: string): string {
  return feature
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
} 