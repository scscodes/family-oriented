'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
  Alert,
  Collapse
} from '@mui/material';
import {
  CheckCircle,
  Star,
  Business,
  Domain,
  Verified,
  Lightbulb,
  TrendingUp,
  Groups,
  Analytics,
  Schedule,
  Palette,
  Api,
  CloudDownload,
  Assessment
} from '@mui/icons-material';
import { TIER_CONFIGURATIONS, type SubscriptionTier } from '@/utils/subscriptionService';

interface TierSelectionStepProps {
  selectedTier: SubscriptionTier;
  onTierChange: (tier: SubscriptionTier) => void;
  disabled?: boolean;
  showTrialInfo?: boolean;
}

/**
 * Feature icon mapping for better visual presentation
 */
const FEATURE_ICONS: Record<string, React.ReactElement> = {
  analytics: <Analytics fontSize="small" />,
  user_management: <Groups fontSize="small" />,
  premium_themes: <Palette fontSize="small" />,
  custom_branding: <Verified fontSize="small" />,
  collections: <Business fontSize="small" />,
  scheduling: <Schedule fontSize="small" />,
  bulk_operations: <TrendingUp fontSize="small" />,
  api_access: <Api fontSize="small" />,
  export_data: <CloudDownload fontSize="small" />,
  advanced_reporting: <Assessment fontSize="small" />
};

/**
 * Feature display names for better UX
 */
const FEATURE_NAMES: Record<string, string> = {
  analytics: 'Learning Analytics',
  user_management: 'User Management',
  premium_themes: 'Premium Themes',
  custom_branding: 'Custom Branding',
  collections: 'Game Collections',
  scheduling: 'Session Scheduling',
  bulk_operations: 'Bulk Operations',
  api_access: 'API Access',
  export_data: 'Data Export',
  advanced_reporting: 'Advanced Reports'
};

/**
 * Tier card component optimized for registration flow
 */
interface TierCardProps {
  tier: SubscriptionTier;
  isSelected: boolean;
  onSelect: (tier: SubscriptionTier) => void;
  billingPeriod: 'monthly' | 'yearly';
  disabled?: boolean;
  recommended?: boolean;
}

const TierCard: React.FC<TierCardProps> = ({
  tier,
  isSelected,
  onSelect,
  billingPeriod,
  disabled = false,
  recommended = false
}) => {
  const config = TIER_CONFIGURATIONS[tier];
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  
  // Calculate pricing based on billing period
  const monthlyPrice = config.basePrice;
  const yearlyPrice = Math.round(monthlyPrice * 12 * 0.83); // 17% discount for yearly
  const displayPrice = billingPeriod === 'yearly' ? yearlyPrice : monthlyPrice;
  const pricePerMonth = billingPeriod === 'yearly' ? Math.round(yearlyPrice / 12 * 100) / 100 : monthlyPrice;
  
  // Get features for this tier
  const availableFeatures = Object.entries(config.features)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature);
    
  const mainFeatures = availableFeatures.slice(0, 5);
  const additionalFeatures = availableFeatures.slice(5);

  // Tier-specific styling
  const tierColors = {
    personal: 'primary',
    professional: 'success',
    enterprise: 'warning'
  } as const;

  const tierIcons = {
    personal: <Business />,
    professional: <Star />,
    enterprise: <Domain />
  };

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        border: 2,
        borderColor: isSelected ? `${tierColors[tier]}.main` : 'divider',
        backgroundColor: isSelected ? `${tierColors[tier]}.50` : 'background.paper',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': disabled ? {} : {
          borderColor: `${tierColors[tier]}.main`,
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={() => !disabled && onSelect(tier)}
    >
      {recommended && (
        <Badge
          badgeContent="Most Popular"
          color="secondary"
          sx={{
            position: 'absolute',
            top: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            '& .MuiBadge-badge': {
              fontSize: '0.75rem',
              fontWeight: 'bold',
              px: 1,
            }
          }}
        />
      )}

      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
            {tierIcons[tier]}
            <Typography variant="h5" component="h3" fontWeight="bold">
              {config.displayName}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {config.description}
          </Typography>

          {/* Pricing */}
          <Box sx={{ mb: 1 }}>
            <Typography variant="h3" component="div" color={`${tierColors[tier]}.main`} fontWeight="bold">
              ${billingPeriod === 'yearly' ? pricePerMonth : displayPrice}
              <Typography component="span" variant="h6" color="text.secondary">
                /month
              </Typography>
            </Typography>
            
            {billingPeriod === 'yearly' && (
              <Typography variant="body2" color="success.main" fontWeight="bold">
                Save 17% with yearly billing
              </Typography>
            )}
          </Box>

          {/* Trial Information */}
          <Chip
            label="14-day free trial"
            color={tierColors[tier]}
            variant="outlined"
            size="small"
            icon={<Lightbulb />}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Key Stats */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            What&apos;s Included:
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Groups fontSize="small" color={tierColors[tier]} />
              <Typography variant="body2">
                <strong>{config.limits.avatars === 10000 ? 'Unlimited' : config.limits.avatars}</strong> children
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp fontSize="small" color={tierColors[tier]} />
              <Typography variant="body2">
                <strong>{config.limits.sessions_per_month.toLocaleString()}</strong> sessions/month
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CloudDownload fontSize="small" color={tierColors[tier]} />
              <Typography variant="body2">
                <strong>{config.limits.data_retention_months}</strong> months data retention
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Feature List */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Features:
          </Typography>
          
          <List dense sx={{ py: 0 }}>
            {mainFeatures.map((feature) => (
              <ListItem key={feature} disablePadding sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {FEATURE_ICONS[feature] || <CheckCircle fontSize="small" color="success" />}
                </ListItemIcon>
                <ListItemText 
                  primary={FEATURE_NAMES[feature] || feature.replace('_', ' ')}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>

          {additionalFeatures.length > 0 && (
            <>
              <Collapse in={showAllFeatures}>
                <List dense sx={{ py: 0 }}>
                  {additionalFeatures.map((feature) => (
                    <ListItem key={feature} disablePadding sx={{ py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {FEATURE_ICONS[feature] || <CheckCircle fontSize="small" color="success" />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={FEATURE_NAMES[feature] || feature.replace('_', ' ')}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
              
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllFeatures(!showAllFeatures);
                }}
                sx={{ mt: 1, fontSize: '0.75rem' }}
              >
                {showAllFeatures ? 'Show Less' : `+${additionalFeatures.length} More Features`}
              </Button>
            </>
          )}
        </Box>

        {/* Selection Button */}
        <Button
          variant={isSelected ? 'contained' : 'outlined'}
          color={tierColors[tier]}
          fullWidth
          size="large"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(tier);
          }}
          startIcon={isSelected ? <CheckCircle /> : tierIcons[tier]}
          sx={{ 
            mt: 2, 
            py: 1.5,
            fontWeight: 'bold',
            textTransform: 'none',
          }}
        >
          {isSelected ? 'Selected' : 'Choose Plan'}
        </Button>
      </CardContent>
    </Card>
  );
};

/**
 * Main tier selection component for registration
 */
export default function TierSelectionStep({
  selectedTier,
  onTierChange,
  disabled = false,
  showTrialInfo = true
}: TierSelectionStepProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleBillingChange = (
    _event: React.MouseEvent<HTMLElement>,
    newPeriod: 'monthly' | 'yearly' | null,
  ) => {
    if (newPeriod !== null) {
      setBillingPeriod(newPeriod);
    }
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 4,
        width: '100%',
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          variant="h4"
          component="h2"
          fontWeight="bold"
          gutterBottom
        >
          Choose Your Plan
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Select the plan that best fits your needs. You can always upgrade or change plans later.
        </Typography>

        {/* Billing Period Toggle */}
        <ToggleButtonGroup
          value={billingPeriod}
          exclusive
          onChange={handleBillingChange}
          aria-label="billing period"
          disabled={disabled}
          sx={{ mb: 2 }}
        >
          <ToggleButton value="monthly" aria-label="monthly billing">
            Monthly
          </ToggleButton>
          <ToggleButton 
            value="yearly" 
            aria-label="yearly billing"
            sx={{ position: 'relative' }}
          >
            Yearly
            <Chip
              label="Save 17%"
              color="success"
              size="small"
              sx={{ 
                position: 'absolute',
                top: -8,
                right: -12,
                fontSize: '0.6rem',
                height: 16,
              }}
            />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Trial Information */}
      {showTrialInfo && (
        <Alert 
          severity="info" 
          icon={<Lightbulb />}
          sx={{ mb: 2 }}
        >
          <Typography variant="body2">
            <strong>Start with a 14-day free trial!</strong> No credit card required. 
            You can cancel anytime during the trial period with no charges.
          </Typography>
        </Alert>
      )}

      {/* Tier Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(3, 1fr)'
          },
          gap: 3,
          alignItems: 'stretch',
        }}
      >
        <TierCard
          tier="personal"
          isSelected={selectedTier === 'personal'}
          onSelect={onTierChange}
          billingPeriod={billingPeriod}
          disabled={disabled}
        />
        
        <TierCard
          tier="professional"
          isSelected={selectedTier === 'professional'}
          onSelect={onTierChange}
          billingPeriod={billingPeriod}
          disabled={disabled}
          recommended={true}
        />
        
        <TierCard
          tier="enterprise"
          isSelected={selectedTier === 'enterprise'}
          onSelect={onTierChange}
          billingPeriod={billingPeriod}
          disabled={disabled}
        />
      </Box>

      {/* Additional Information */}
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          All plans include access to our full library of educational games and basic customer support.
          <br />
          You can upgrade, downgrade, or cancel your subscription at any time.
        </Typography>
      </Box>
    </Box>
  );
} 