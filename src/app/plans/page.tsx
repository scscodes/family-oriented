"use client";

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import {
  CheckCircle,
  Star,
  People,
  Business,
  School,
  TrendingUp,
  Security,
  Support,
  Analytics,
  Palette,
  Schedule,
  CloudDownload
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { TIER_CONFIGURATIONS, type SubscriptionTier, type SubscriptionFeature } from '@/utils/subscriptionService';
import { useUser } from '@/context/UserContext';
import { useEnhancedTheme } from '@/theme/EnhancedThemeProvider';

const featureIcons: Record<string, React.ElementType> = {
  analytics: Analytics,
  user_management: People,
  premium_themes: Palette,
  custom_branding: Business,
  collections: School,
  scheduling: Schedule,
  bulk_operations: TrendingUp,
  api_access: Security,
  export_data: CloudDownload,
  advanced_reporting: Analytics
};

const featureDescriptions: Record<string, string> = {
  analytics: 'Track learning progress and performance metrics',
  user_management: 'Add and manage multiple users and roles',
  premium_themes: 'Access exclusive themes and customization options',
  custom_branding: 'White-label the platform with your organization&apos;s branding',
  collections: 'Create and organize custom game collections',
  scheduling: 'Schedule learning sessions and set automatic reminders',
  bulk_operations: 'Perform operations on multiple users at once',
  api_access: 'Integrate with external systems via our REST API',
  export_data: 'Export learning data and progress reports',
  advanced_reporting: 'Detailed analytics with custom reporting capabilities'
};

interface PlanCardProps {
  tier: SubscriptionTier;
  isRecommended?: boolean;
  isCurrentPlan?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ tier, isRecommended, isCurrentPlan }) => {
  const config = TIER_CONFIGURATIONS[tier];
  const router = useRouter();
  const { themeConfig } = useEnhancedTheme();

  const enabledFeatures = Object.entries(config.features)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature);

  const handleSelectPlan = () => {
    if (isCurrentPlan) return;
    
    // For now, redirect to dashboard where user can upgrade
    router.push('/dashboard');
  };

  const getPriceColor = () => {
    if (tier === 'personal') return themeConfig?.primary || '#1976d2';
    if (tier === 'professional') return themeConfig?.secondary || '#9c27b0';
    return themeConfig?.accent || '#ed6c02';
  };

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 8
        }
      }}
    >
      <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header with badges */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          {/* Badges row */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2, minHeight: 32 }}>
            {isRecommended && (
              <Chip
                label="Most Popular"
                color="secondary"
                icon={<Star />}
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            )}
            {isCurrentPlan && (
              <Chip
                label="Current Plan"
                color="success"
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            )}
          </Box>
          
          <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
            {config.displayName}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', mb: 2 }}>
            <Typography 
              variant="h2" 
              component="span" 
              sx={{ 
                fontWeight: 800,
                color: getPriceColor()
              }}
            >
              ${config.basePrice}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ ml: 1 }}>
              /month
            </Typography>
          </Box>
          
          <Typography variant="body1" color="text.secondary">
            {config.description}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Limits */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            What's Included
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: getPriceColor() }}>
                  {config.limits.avatars === 10000 ? '∞' : config.limits.avatars}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Children
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: getPriceColor() }}>
                  {config.limits.sessions_per_month === 50000 ? '∞' : config.limits.sessions_per_month.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sessions/month
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Features */}
        <Box sx={{ flexGrow: 1, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Features
          </Typography>
          <List dense>
            {enabledFeatures.slice(0, 6).map((feature) => {
              const IconComponent = featureIcons[feature] || CheckCircle;
              return (
                <ListItem key={feature} disablePadding>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <IconComponent fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={featureDescriptions[feature] || feature.replace(/_/g, ' ')}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              );
            })}
            {enabledFeatures.length > 6 && (
              <ListItem disablePadding>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircle fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary={`+ ${enabledFeatures.length - 6} more features`}
                  primaryTypographyProps={{ 
                    variant: 'body2', 
                    fontStyle: 'italic' 
                  }}
                />
              </ListItem>
            )}
          </List>
        </Box>

        {/* CTA Button */}
        <Button
          variant={isRecommended ? 'contained' : 'outlined'}
          fullWidth
          size="large"
          onClick={handleSelectPlan}
          disabled={isCurrentPlan}
          sx={{
            py: 1.5,
            fontWeight: 600,
            ...(isRecommended && {
              backgroundColor: themeConfig.secondary,
              '&:hover': {
                backgroundColor: `${themeConfig.secondary}dd`
              }
            })
          }}
        >
          {isCurrentPlan ? 'Current Plan' : 'Get Started'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default function PlansPage() {
  const { org } = useUser();
  const { themeConfig } = useEnhancedTheme();
  
  const currentTier = org?.subscriptionPlan?.tier as SubscriptionTier | undefined;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${themeConfig?.primary || '#1976d2'} 0%, ${themeConfig?.secondary || '#9c27b0'} 100%)`,
          color: 'white',
          py: 8
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
            <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 2 }}>
              Choose Your Learning Plan
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              Unlock the full potential of educational gaming for your family or organization
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              All plans include core educational games, progress tracking, and family-safe content
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Plans Grid */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={4}>
            <PlanCard 
              tier="personal" 
              isCurrentPlan={currentTier === 'personal'}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <PlanCard 
              tier="professional" 
              isRecommended={true}
              isCurrentPlan={currentTier === 'professional'}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <PlanCard 
              tier="enterprise"
              isCurrentPlan={currentTier === 'enterprise'}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Feature Comparison Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" sx={{ 
            textAlign: 'center', 
            fontWeight: 700, 
            mb: 6,
            color: themeConfig?.primary || '#1976d2'
          }}>
            Compare All Features
          </Typography>
          
          <Paper sx={{ overflow: 'hidden' }}>
            <Box sx={{ overflowX: 'auto' }}>
              <Box component="table" sx={{ width: '100%', minWidth: 800 }}>
                <Box component="thead">
                  <Box component="tr" sx={{ bgcolor: 'grey.100' }}>
                    <Box component="th" sx={{ p: 3, textAlign: 'left', fontWeight: 600 }}>
                      Feature
                    </Box>
                    <Box component="th" sx={{ p: 3, textAlign: 'center', fontWeight: 600 }}>
                      Personal
                    </Box>
                    <Box component="th" sx={{ p: 3, textAlign: 'center', fontWeight: 600 }}>
                      Professional
                    </Box>
                    <Box component="th" sx={{ p: 3, textAlign: 'center', fontWeight: 600 }}>
                      Enterprise
                    </Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  {Object.keys(featureDescriptions).map((feature) => (
                    <Box component="tr" key={feature} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Box component="td" sx={{ p: 3 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {featureDescriptions[feature as SubscriptionFeature]}
                        </Typography>
                      </Box>
                      {(['personal', 'professional', 'enterprise'] as SubscriptionTier[]).map((tier) => (
                        <Box component="td" key={tier} sx={{ p: 3, textAlign: 'center' }}>
                          {TIER_CONFIGURATIONS[tier].features[feature as SubscriptionFeature] ? (
                            <CheckCircle color="success" />
                          ) : (
                            <Typography variant="body2" color="text.disabled">
                              —
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Support Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Support sx={{ fontSize: 60, color: themeConfig?.accent || '#ed6c02', mb: 2 }} />
          <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
            Need Help Choosing?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Our team is here to help you find the perfect plan for your family or organization. 
            Contact us for personalized recommendations and volume discounts.
          </Typography>
          <Button 
            variant="outlined" 
            size="large"
            href="mailto:support@family-learning.com"
            sx={{ mr: 2 }}
          >
            Contact Sales
          </Button>
          <Button 
            variant="text" 
            size="large"
            href="/dashboard"
          >
            Start Free Trial
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 