/**
 * UsageMeter Component
 * Displays subscription usage against limits with visual indicators
 * Shows upgrade prompts when approaching or exceeding limits
 */

import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Stack,
  Button,
  Alert
} from '@mui/material';
import { 
  Warning, 
  Error, 
  CheckCircle,
  Upgrade 
} from '@mui/icons-material';
import { useSubscription } from '@/hooks/useSubscription';
import { type UsageLimit } from '@/utils/subscriptionService';
import TierTransitionButton from '@/features/subscription/components/TierTransitionButton';

interface UsageMeterProps {
  limitType: UsageLimit;
  currentUsage: number;
  label?: string;
  showUpgradePrompt?: boolean;
  compact?: boolean;
  warningThreshold?: number; // Percentage at which to show warning (default 80%)
  hideWhenUnlimited?: boolean;
}

/**
 * Usage meter with subscription-aware limits and upgrade prompts
 */
export default function UsageMeter({
  limitType,
  currentUsage,
  label,
  showUpgradePrompt = true,
  compact = false,
  warningThreshold = 0.8,
  hideWhenUnlimited = true
}: UsageMeterProps) {
  const { checkUsageLimit, formatFeatureMessage, tier } = useSubscription();
  
  const usageResult = checkUsageLimit(limitType, currentUsage);
  const limit = usageResult.limit || 0;
  
  // Hide meter for effectively unlimited plans (like enterprise)
  if (hideWhenUnlimited && limit >= 10000) {
    return null;
  }
  
  const percentage = Math.min((currentUsage / limit) * 100, 100);
  const isWarning = currentUsage / limit >= warningThreshold;
  const isError = !usageResult.allowed;
  
  const displayLabel = label || limitType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Determine color and icon based on usage
  let color: 'primary' | 'warning' | 'error' = 'primary';
  let icon = <CheckCircle color="success" />;
  let statusText = 'Good';
  
  if (isError) {
    color = 'error';
    icon = <Error color="error" />;
    statusText = 'Limit Exceeded';
  } else if (isWarning) {
    color = 'warning';
    icon = <Warning color="warning" />;
    statusText = 'Approaching Limit';
  }
  
  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 200 }}>
        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
          {displayLabel}
        </Typography>
        <Box sx={{ flex: 1 }}>
          <LinearProgress
            variant="determinate"
            value={percentage}
            color={color}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
        <Typography variant="body2" color={isError ? 'error.main' : 'text.primary'} sx={{ minWidth: 50 }}>
          {currentUsage}/{limit === 10000 ? '∞' : limit}
        </Typography>
        {isError && showUpgradePrompt && usageResult.upgradeRequired && (
          <TierTransitionButton 
            targetTier={usageResult.upgradeRequired}
            size="small"
            variant="outlined"
          />
        )}
      </Box>
    );
  }
  
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {displayLabel}
          </Typography>
          <Chip 
            icon={icon}
            label={statusText}
            size="small"
            variant="outlined"
            color={color}
          />
        </Box>
        <Typography 
          variant="body2" 
          color={isError ? 'error.main' : 'text.primary'}
          sx={{ fontWeight: isError ? 'bold' : 'normal' }}
        >
          {currentUsage} / {limit === 10000 ? '∞' : limit}
        </Typography>
      </Box>
      
      <LinearProgress
        variant="determinate"
        value={percentage}
        color={color}
        sx={{ 
          height: 8, 
          borderRadius: 4,
          mb: isError ? 1 : 0
        }}
      />
      
      {isError && (
        <Alert 
          severity="error" 
          sx={{ mt: 2 }}
          action={
            showUpgradePrompt && usageResult.upgradeRequired ? (
              <TierTransitionButton 
                targetTier={usageResult.upgradeRequired}
                size="small"
                variant="contained"
              />
            ) : undefined
          }
        >
          <Typography variant="body2">
            {formatFeatureMessage(usageResult)}
          </Typography>
        </Alert>
      )}
      
      {isWarning && !isError && showUpgradePrompt && (
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="warning.main">
            Approaching your {tier} plan limit
          </Typography>
          <Button 
            size="small" 
            startIcon={<Upgrade />}
            onClick={() => {
              // This would open upgrade flow
              console.log('Open upgrade flow for', limitType);
            }}
          >
            Upgrade
          </Button>
        </Box>
      )}
    </Box>
  );
}

/**
 * Multi-meter component showing all usage limits
 */
export function UsageOverview({ 
  compact = false,
  showUpgradePrompts = true 
}: { 
  compact?: boolean;
  showUpgradePrompts?: boolean;
}) {
  const { currentUsage } = useSubscription();
  
  return (
    <Stack spacing={compact ? 1 : 2}>
      <UsageMeter
        limitType="avatars"
        currentUsage={currentUsage.avatarsCount}
        label="Children (Avatars)"
        compact={compact}
        showUpgradePrompt={showUpgradePrompts}
      />
      
      {/* Add more meters as needed */}
      <UsageMeter
        limitType="collections_per_avatar"
        currentUsage={5} // This would come from actual data
        label="Collections per Child"
        compact={compact}
        showUpgradePrompt={showUpgradePrompts}
      />
      
      <UsageMeter
        limitType="sessions_per_month"
        currentUsage={150} // This would come from analytics
        label="Sessions This Month"
        compact={compact}
        showUpgradePrompt={showUpgradePrompts}
      />
    </Stack>
  );
} 