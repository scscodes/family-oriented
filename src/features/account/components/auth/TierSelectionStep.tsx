'use client';

import React, { useState } from 'react';
import { Box, Button, Typography, Card, CardContent, CardActions, ToggleButtonGroup, ToggleButton } from '@mui/material';

interface TierSelectionStepProps {
  onNext: (data: { tier: string, billingCycle: 'monthly' | 'yearly' }) => void;
  onBack: () => void;
  initialData?: { tier?: string, billingCycle?: 'monthly' | 'yearly' };
}

export function TierSelectionStep({ onNext, onBack, initialData }: TierSelectionStepProps) {
  const [tier, setTier] = useState(initialData?.tier || 'personal');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(initialData?.billingCycle || 'monthly');

  const handleTierChange = (selectedTier: string) => {
    setTier(selectedTier);
  };

  const handleBillingCycleChange = (event: React.MouseEvent<HTMLElement>, newCycle: 'monthly' | 'yearly' | null) => {
    if (newCycle !== null) {
      setBillingCycle(newCycle);
    }
  };

  const handleNext = () => {
    onNext({ tier, billingCycle });
  };

  const tiers = [
    { id: 'personal', name: 'Personal', price: '$0', features: ['5 avatars', 'Basic games', 'Progress tracking'] },
    { id: 'professional', name: 'Professional', price: '$15', features: ['30 avatars', 'Advanced games', 'Analytics', 'Priority support'] },
    { id: 'enterprise', name: 'Enterprise', price: '$50', features: ['Unlimited avatars', 'All games', 'Custom analytics', 'Dedicated support'] }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h6" align="center">Choose Your Plan</Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <ToggleButtonGroup
          value={billingCycle}
          exclusive
          onChange={handleBillingCycleChange}
          aria-label="billing cycle"
        >
          <ToggleButton value="monthly" aria-label="monthly billing">
            Monthly
          </ToggleButton>
          <ToggleButton value="yearly" aria-label="yearly billing">
            Yearly (Save 20%)
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
        gap: 2 
      }}>
        {tiers.map((planTier) => (
          <Card 
            key={planTier.id}
            sx={{ 
              border: tier === planTier.id ? 2 : 1,
              borderColor: tier === planTier.id ? 'primary.main' : 'divider',
              cursor: 'pointer'
            }}
            onClick={() => handleTierChange(planTier.id)}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>{planTier.name}</Typography>
              <Typography variant="h4" color="primary" gutterBottom>
                {planTier.price}
                <Typography component="span" variant="body2" color="text.secondary">
                  /month
                </Typography>
              </Typography>
              <Box sx={{ mt: 2 }}>
                {planTier.features.map((feature, index) => (
                  <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                    ✓ {feature}
                  </Typography>
                ))}
              </Box>
            </CardContent>
            <CardActions>
              <Button 
                variant={tier === planTier.id ? 'contained' : 'outlined'}
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  handleTierChange(planTier.id);
                }}
              >
                {tier === planTier.id ? 'Selected' : 'Select'}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button variant="outlined" onClick={onBack}>Back</Button>
        <Button variant="contained" onClick={handleNext} disabled={!tier}>Next</Button>
      </Box>
    </Box>
  );
} 