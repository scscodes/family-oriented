/**
 * Plan Comparison Component
 * Displays subscription tiers side by side with features and pricing
 * Handles upgrade/downgrade actions with proper validation
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Upgrade,
  ArrowDownward,
  Star,
  Business
} from '@mui/icons-material';
import { useTierTransition, type TierTransitionAnalysis } from '@/hooks/useTierTransition';
import { TIER_CONFIGURATIONS, type SubscriptionTier } from '@/utils/subscriptionService';

interface PlanCardProps {
  tier: SubscriptionTier;
  isCurrentPlan: boolean;
  onSelectPlan: (tier: SubscriptionTier) => void;
  disabled?: boolean;
  recommended?: boolean;
}

/**
 * Individual plan card component
 */
const PlanCard: React.FC<PlanCardProps> = ({ 
  tier, 
  isCurrentPlan, 
  onSelectPlan, 
  disabled = false,
  recommended = false 
}) => {
  const { getTierDisplayName, getTierPrice } = useTierTransition();
  const config = TIER_CONFIGURATIONS[tier];
  
  const features = Object.entries(config.features)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature.replace('_', ' '));

  const price = getTierPrice(tier);

  return (
    <Card 
      sx={{ 
        height: '100%', 
        border: isCurrentPlan ? 2 : 1,
        borderColor: isCurrentPlan ? 'primary.main' : 'divider',
        position: 'relative',
        backgroundColor: recommended ? 'action.hover' : 'background.paper'
      }}
    >
      {recommended && (
        <Chip
          label="Recommended"
          color="primary"
          size="small"
          icon={<Star />}
          sx={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)' }}
        />
      )}
      
      {isCurrentPlan && (
        <Chip
          label="Current Plan"
          color="success"
          size="small"
          sx={{ position: 'absolute', top: 8, right: 8 }}
        />
      )}
      
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {getTierDisplayName(tier)}
        </Typography>
        
        <Typography variant="h4" color="primary" gutterBottom>
          ${price}
          <Typography component="span" variant="body2" color="text.secondary">
            /month
          </Typography>
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {config.description}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom>
          Features:
        </Typography>
        <List dense sx={{ mb: 2 }}>
          <ListItem disablePadding>
            <ListItemIcon>
              <Business fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={`${config.limits.avatars} avatars`} />
          </ListItem>
          {features.slice(0, 4).map((feature) => (
            <ListItem key={feature} disablePadding>
              <ListItemIcon>
                <CheckCircle fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary={feature} />
            </ListItem>
          ))}
          {features.length > 4 && (
            <ListItem disablePadding>
              <ListItemText 
                primary={`+ ${features.length - 4} more features`}
                sx={{ fontStyle: 'italic' }}
              />
            </ListItem>
          )}
        </List>
        
        <Button
          variant={isCurrentPlan ? 'outlined' : 'contained'}
          fullWidth
          disabled={disabled || isCurrentPlan}
          onClick={() => onSelectPlan(tier)}
          startIcon={isCurrentPlan ? <CheckCircle /> : <Upgrade />}
        >
          {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
        </Button>
      </CardContent>
    </Card>
  );
};

/**
 * Transition confirmation dialog
 */
interface TransitionDialogProps {
  open: boolean;
  onClose: () => void;
  analysis: TierTransitionAnalysis | null;
  onConfirm: () => void;
  loading: boolean;
}

const TransitionDialog: React.FC<TransitionDialogProps> = ({
  open,
  onClose,
  analysis,
  onConfirm,
  loading
}) => {
  const { getTierDisplayName } = useTierTransition();
  
  if (!analysis) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {analysis.isUpgrade ? <Upgrade /> : <ArrowDownward />}
          {analysis.isUpgrade ? 'Upgrade' : 'Change'} to {getTierDisplayName(analysis.toTier)}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Cost Impact */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Cost Impact
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Current: ${analysis.costImpact.currentCost}/month
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  New: ${analysis.costImpact.newCost}/month
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography 
                  variant="body1" 
                  color={analysis.costImpact.monthlyDifference > 0 ? 'error.main' : 'success.main'}
                  fontWeight="medium"
                >
                  Monthly difference: {analysis.costImpact.monthlyDifference > 0 ? '+' : ''}
                  ${analysis.costImpact.monthlyDifference.toFixed(2)}
                </Typography>
              </Grid>
              {analysis.costImpact.prorationAmount !== 0 && (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mt: 1 }}>
                    {analysis.costImpact.prorationDescription}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Feature Changes */}
        {(analysis.featureChanges.gained.length > 0 || analysis.featureChanges.lost.length > 0) && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Feature Changes
              </Typography>
              
              {analysis.featureChanges.gained.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" color="success.main" gutterBottom>
                    Features you'll gain:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {analysis.featureChanges.gained.map((feature) => (
                      <Chip
                        key={feature}
                        label={feature.replace('_', ' ')}
                        size="small"
                        color="success"
                        icon={<CheckCircle />}
                      />
                    ))}
                  </Box>
                </Box>
              )}
              
              {analysis.featureChanges.lost.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="error.main" gutterBottom>
                    Features you'll lose:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {analysis.featureChanges.lost.map((feature) => (
                      <Chip
                        key={feature}
                        label={feature.replace('_', ' ')}
                        size="small"
                        color="error"
                        icon={<Cancel />}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Warnings */}
        {analysis.warnings.length > 0 && (
          <Alert severity={analysis.canTransition ? 'warning' : 'error'} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {analysis.canTransition ? 'Please note:' : 'Cannot proceed:'}
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {analysis.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Usage Impact */}
        {analysis.usageImpact.overLimitItems.length > 0 && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Usage Impact
              </Typography>
              <List dense>
                {analysis.usageImpact.overLimitItems.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Cancel color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${item.type}: ${item.current} → ${item.newLimit}`}
                      secondary={item.impact}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading || !analysis.canTransition}
                      startIcon={loading ? <CircularProgress size={16} /> : (analysis.isUpgrade ? <Upgrade /> : <ArrowDownward />)}
        >
          {loading ? 'Processing...' : `Confirm ${analysis.isUpgrade ? 'Upgrade' : 'Change'}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * Main plan comparison component
 */
export default function PlanComparison() {
  const { 
    currentTier, 
    availableUpgrades, 
    availableDowngrades,
    analyzeTransition,
    executeTransition,
    isLoading,
    error,
    clearError
  } = useTierTransition();
  
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [analysis, setAnalysis] = useState<TierTransitionAnalysis | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const allTiers: SubscriptionTier[] = ['personal', 'professional', 'enterprise'];
  
  const handleSelectPlan = async (tier: SubscriptionTier) => {
    if (!currentTier || tier === currentTier) return;
    
    try {
      clearError();
      const result = await analyzeTransition(tier);
      setSelectedTier(tier);
      setAnalysis(result);
      setDialogOpen(true);
    } catch (err) {
      console.error('Failed to analyze transition:', err);
    }
  };

  const handleConfirmTransition = async () => {
    if (!selectedTier) return;
    
    try {
      const result = await executeTransition(selectedTier);
      if (result.success) {
        setDialogOpen(false);
        setSelectedTier(null);
        setAnalysis(null);
        // In a real app, you might want to show a success message or refresh the page
        alert(result.message);
      }
    } catch (err) {
      console.error('Failed to execute transition:', err);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTier(null);
    setAnalysis(null);
    clearError();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Choose Your Plan
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Compare our subscription plans and upgrade or downgrade as needed.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {allTiers.map((tier, index) => (
          <Grid item xs={12} md={4} key={tier}>
            <PlanCard
              tier={tier}
              isCurrentPlan={tier === currentTier}
              onSelectPlan={handleSelectPlan}
              disabled={isLoading}
              recommended={index === 1} // Professional plan is recommended
            />
          </Grid>
        ))}
      </Grid>

      {currentTier && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Available Changes
          </Typography>
          
          {availableUpgrades.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="success.main" gutterBottom>
                Upgrades Available:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {availableUpgrades.map((tier) => (
                  <Chip
                    key={tier}
                    label={TIER_CONFIGURATIONS[tier].displayName}
                    color="success"
                    onClick={() => handleSelectPlan(tier)}
                    clickable
                    disabled={isLoading}
                  />
                ))}
              </Box>
            </Box>
          )}
          
          {availableDowngrades.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="warning.main" gutterBottom>
                Downgrades Available:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {availableDowngrades.map((tier) => (
                  <Chip
                    key={tier}
                    label={TIER_CONFIGURATIONS[tier].displayName}
                    color="warning"
                    onClick={() => handleSelectPlan(tier)}
                    clickable
                    disabled={isLoading}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}

      <TransitionDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        analysis={analysis}
        onConfirm={handleConfirmTransition}
        loading={isLoading}
      />
    </Box>
  );
} 