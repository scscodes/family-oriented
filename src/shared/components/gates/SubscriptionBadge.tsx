/**
 * SubscriptionBadge Component
 * Shows current subscription tier with status indicators
 * Provides upgrade prompts and tier comparison
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Chip,
  Typography,
  Popover,
  Card,
  CardContent,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import { 
  Business,
  Star,
  CheckCircle,
  Lock
} from '@mui/icons-material';
import { useSubscription } from '@/hooks/useSubscription';
import { TIER_CONFIGURATIONS, type SubscriptionTier } from '@/utils/subscriptionService';
import TierTransitionButton from '@/features/subscription/components/TierTransitionButton';

interface SubscriptionBadgeProps {
  variant?: 'basic' | 'detailed' | 'compact';
  showUpgradeButton?: boolean;
  showDetails?: boolean;
}

/**
 * Tier color mapping for consistent styling
 */
const TIER_COLORS: Record<SubscriptionTier, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error'> = {
  personal: 'primary',
  professional: 'success', 
  enterprise: 'warning'
};

/**
 * Tier icon mapping
 */
const TIER_ICONS: Record<SubscriptionTier, React.ReactElement> = {
  personal: <Business />,
  professional: <Star />,
  enterprise: <Star sx={{ color: 'gold' }} />
};

/**
 * Main subscription badge component - safe initialization
 */
const SubscriptionBadge = React.memo(({
  variant = 'basic',
  showUpgradeButton = true,
  showDetails = true
}: SubscriptionBadgeProps) => {
  const { tier, subscriptionPlan, isLoaded, getAvailableFeatures } = useSubscription();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (showDetails) {
      setAnchorEl(event.currentTarget);
    }
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const open = Boolean(anchorEl);

  // Memoize computed values to prevent re-renders
  const computedValues = useMemo(() => {
    if (!isLoaded || !subscriptionPlan || !tier) {
      return null;
    }
    
    return {
      tierConfig: TIER_CONFIGURATIONS[tier as SubscriptionTier],
      availableFeatures: getAvailableFeatures(),
      tierIcon: TIER_ICONS[tier as SubscriptionTier],
      tierColor: TIER_COLORS[tier as SubscriptionTier]
    };
  }, [tier, subscriptionPlan, isLoaded, getAvailableFeatures]);
  
  if (!isLoaded) {
    return (
      <Chip 
        label="Loading..." 
        variant="outlined" 
        size="small"
        icon={<CircularProgress size={16} />}
      />
    );
  }
  
  if (!subscriptionPlan || !tier) {
    return (
      <Chip 
        label="No Plan" 
        color="error" 
        variant="outlined"
        size="small"
        icon={<Lock />}
      />
    );
  }

  if (!computedValues) {
    return (
      <Chip 
        label="Loading..." 
        variant="outlined" 
        size="small"
      />
    );
  }
  
  const { tierConfig, availableFeatures, tierIcon, tierColor } = computedValues;
  
  if (variant === 'compact') {
    return (
      <Chip
        icon={tierIcon}
        label={tier.toUpperCase()}
        color={tierColor}
        size="small"
        onClick={showDetails ? handleClick : undefined}
        clickable={showDetails}
      />
    );
  }
  
  if (variant === 'basic') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          icon={tierIcon}
          label={tierConfig?.displayName || tier}
          color={tierColor}
          onClick={showDetails ? handleClick : undefined}
          clickable={showDetails}
        />
        {showUpgradeButton && tier !== 'enterprise' && (
          <TierTransitionButton 
            targetTier={tier === 'personal' ? 'professional' : 'enterprise'}
            size="small"
            variant="outlined"
          />
        )}
        
        {showDetails && (
          <SubscriptionDetailsPopover
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            tier={tier as SubscriptionTier}
            tierConfig={tierConfig}
            availableFeatures={availableFeatures}
          />
        )}
      </Box>
    );
  }

  // Detailed variant
  return (
    <Card sx={{ bgcolor: 'grey.50', border: 1, borderColor: 'grey.200' }}>
      <CardContent>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {tierIcon}
              <Typography variant="h6">
                {tierConfig?.displayName || tier}
              </Typography>
              <Chip 
                label={tier.toUpperCase()}
                color={tierColor}
                size="small"
              />
            </Box>
            
            {showUpgradeButton && tier !== 'enterprise' && (
              <TierTransitionButton 
                targetTier={tier === 'personal' ? 'professional' : 'enterprise'}
                variant="contained"
              />
            )}
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            {tierConfig?.description}
          </Typography>
          
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Available Features ({availableFeatures.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {availableFeatures.slice(0, 6).map((feature) => (
                <Chip
                  key={feature}
                  label={feature.replace(/_/g, ' ')}
                  size="small"
                  variant="outlined"
                  color="success"
                  icon={<CheckCircle />}
                />
              ))}
              {availableFeatures.length > 6 && (
                <Chip
                  label={`+${availableFeatures.length - 6} more`}
                  size="small"
                  variant="outlined"
                  color="info"
                />
              )}
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
});

SubscriptionBadge.displayName = 'SubscriptionBadge';

/**
 * Detailed popover showing subscription information
 */
function SubscriptionDetailsPopover({
  open,
  anchorEl,
  onClose,
  tier,
  tierConfig,
  availableFeatures
}: {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  tier: SubscriptionTier;
  tierConfig: {
    displayName: string;
    description: string;
    limits: {
      avatars: number;
      collections_per_avatar: number;
      sessions_per_month: number;
    };
  };
  availableFeatures: string[];
}) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <Card sx={{ maxWidth: 400 }}>
        <CardContent>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {TIER_ICONS[tier]}
              <Typography variant="h6">
                {tierConfig?.displayName}
              </Typography>
              <Chip 
                label={tier.toUpperCase()}
                color={TIER_COLORS[tier]}
                size="small"
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              {tierConfig?.description}
            </Typography>
            
            <Divider />
            
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle color="success" fontSize="small" />
                Available Features
              </Typography>
              <List dense>
                {availableFeatures.map((feature) => (
                  <ListItem key={feature} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
            
            <Divider />
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Usage Limits
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  Children: {tierConfig?.limits.avatars === 10000 ? 'Unlimited' : tierConfig?.limits.avatars}
                </Typography>
                <Typography variant="body2">
                  Collections per Child: {tierConfig?.limits.collections_per_avatar}
                </Typography>
                <Typography variant="body2">
                  Sessions per Month: {tierConfig?.limits.sessions_per_month.toLocaleString()}
                </Typography>
              </Stack>
            </Box>
            
            {tier !== 'enterprise' && (
              <TierTransitionButton 
                targetTier={tier === 'personal' ? 'professional' : 'enterprise'}
                variant="contained"
              />
            )}
          </Stack>
        </CardContent>
      </Card>
    </Popover>
  );
}

/**
 * Simple tier indicator for use in headers or compact spaces
 */
export function TierIndicator({ 
  showUpgrade = false 
}: { 
  showUpgrade?: boolean 
}) {
  return (
    <SubscriptionBadge 
      variant="compact" 
      showUpgradeButton={showUpgrade}
      showDetails={true}
    />
  );
}

export default SubscriptionBadge; 