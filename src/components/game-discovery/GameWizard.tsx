"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Card, CardContent, Typography, Stepper, Step, StepLabel, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { gameWizard } from '@/utils/gameWizardService';
import { useAvatar } from '@/hooks/useAvatar';
import { logger } from '@/utils/logger';

interface GameWizardProps {
  onClose: () => void;
}

export function GameWizard({ onClose }: GameWizardProps) {
  const router = useRouter();
  const { avatar } = useAvatar();
  const [activeStep, setActiveStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);

  const steps = gameWizard.getSteps();

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      // Final step - get recommendations
      setLoading(true);
      try {
        if (!avatar?.id) throw new Error('No avatar selected');

        // Start wizard session
        const session = await gameWizard.startSession(avatar.id);
        
        // Get recommendations
        await gameWizard.getRecommendations(session.id, selections);
        
        // Navigate to games page with recommendations
        router.push(`/games?wizard=${session.id}`);
        onClose();
      } catch (error) {
        logger.error('Failed to get recommendations:', error);
        // TODO: Show error message to user
      } finally {
        setLoading(false);
      }
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSelection = (type: string, value: unknown) => {
    setSelections((prev) => ({
      ...prev,
      [type]: value
    }));
  };

  const currentStep = steps[activeStep];

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', my: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      
      <CardContent>
        <Typography variant="h5" gutterBottom align="center">
          Find the Perfect Games
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ my: 4 }}>
          {steps.map((step) => (
            <Step key={step.id}>
              <StepLabel>{step.title}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {currentStep.title}
          </Typography>
          <Typography color="text.secondary" paragraph>
            {currentStep.description}
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
            {currentStep.options.map((option) => (
              <Button
                key={option.id}
                variant={selections[currentStep.type] === option.value ? 'contained' : 'outlined'}
                onClick={() => handleSelection(currentStep.type, option.value)}
                sx={{ 
                  height: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}
              >
                <Typography variant="h4">{option.icon}</Typography>
                <Typography variant="body2">{option.label}</Typography>
              </Button>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!selections[currentStep.type] || loading}
          >
            {activeStep === steps.length - 1 ? 'Find Games' : 'Next'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
} 