"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Typography, Stepper, Step, StepLabel, Alert, CircularProgress } from '@mui/material';
import { gameWizard } from '@/utils/gameWizardService';
import { useAvatar } from '@/hooks/useAvatar';
import { logger } from '@/utils/logger';

interface GameWizardProps {
  onClose: () => void;
}

/**
 * Game discovery wizard component that guides users through game selection
 * Designed to work within a dialog container
 */
export function GameWizard({ onClose }: GameWizardProps) {
  const router = useRouter();
  const { avatar } = useAvatar();
  const [activeStep, setActiveStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = gameWizard.getSteps();

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      // Final step - get recommendations
      setLoading(true);
      setError(null);
      
      try {
        // Debug log current selections to help diagnose issues
        logger.info('Wizard selections:', selections);
        
        // Validate that we have at least some selections
        const hasSelections = Object.keys(selections).length > 0;
        if (!hasSelections) {
          setError('Please make at least one selection to get personalized recommendations');
          setLoading(false);
          return;
        }

        // Check if all required steps have selections
        const missingSelections = [];
        if (!selections.age) missingSelections.push('Age Range');
        if (!selections.interests) missingSelections.push('Learning Interests');
        if (!selections.time) missingSelections.push('Available Time');
        if (!selections.goals) missingSelections.push('Learning Goals');
        
        if (missingSelections.length > 0) {
          setError(`Please complete these steps: ${missingSelections.join(', ')}`);
          setLoading(false);
          return;
        }

        // Handle avatar more gracefully - create a temporary one if needed
        let avatarId = avatar?.id;
        if (!avatarId) {
          // Create a temporary session ID for users without avatars
          avatarId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          logger.warn('No avatar found, using temporary ID:', avatarId);
        }

        logger.info('Starting wizard session with avatar:', avatarId);

        // Start wizard session with selections
        const session = await gameWizard.startSession(avatarId, selections);
        
        if (!session?.id) {
          setError('Unable to start recommendation session. Please try again.');
          setLoading(false);
          return;
        }
        
        logger.info('Wizard session created:', session.id);

        // Get recommendations - this now uses progressive fallback
        const recommendationSession = await gameWizard.getRecommendations(session.id, selections);
        
        if (!recommendationSession) {
          setError('Unable to generate game recommendations. Please try again or browse all games.');
          setLoading(false);
          return;
        }

        logger.info('Recommendations generated successfully');

        // Navigate to games page with recommendations
        router.push(`/games?wizard=${session.id}`);
        onClose();
        
      } catch (error) {
        logger.error('Wizard error details:', {
          error,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined,
          selections,
          avatarId: avatar?.id,
          hasAvatar: !!avatar
        });
        
        // Provide more specific error messages based on the error type
        if (error instanceof Error) {
          const errorMessage = error.message.toLowerCase();
          
          if (errorMessage.includes('avatar') || errorMessage.includes('auth')) {
            setError('Having trouble with your profile. You can still browse all games or try again.');
          } else if (errorMessage.includes('session') || errorMessage.includes('start')) {
            setError('Unable to start game finder. Please try again or browse all games.');
          } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
            setError('Connection issue. Please check your internet and try again.');
          } else if (errorMessage.includes('parse') || errorMessage.includes('invalid')) {
            setError('There was an issue with your selections. Please try starting over.');
          } else {
            setError('We had trouble finding games for you. You can browse all games or try different preferences.');
          }
        } else {
          setError('Unable to find games right now. You can browse all games or try again later.');
        }
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
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: 600, 
      mx: 'auto'
    }}>
      {/* Header */}
      <Box sx={{ flexShrink: 0, mb: 3 }}>
        <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
          Find the Perfect Games
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 2 }}>
          {steps.map((step) => (
            <Step key={step.id}>
              <StepLabel>{step.title}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, flexShrink: 0 }}>
          <Typography variant="body1" gutterBottom>
            {error}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button 
              size="small" 
              variant="outlined" 
              onClick={() => router.push('/games')}
            >
              Browse All Games
            </Button>
            <Button 
              size="small" 
              variant="text" 
              onClick={() => {
                setError(null);
                setActiveStep(0);
                setSelections({});
              }}
            >
              Start Over
            </Button>
          </Box>
        </Alert>
      )}

      {/* Main content area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Box sx={{ mb: 2, flexShrink: 0 }}>
          <Typography variant="h6" gutterBottom>
            {currentStep.title}
          </Typography>
          <Typography color="text.secondary" paragraph>
            {currentStep.description}
          </Typography>
        </Box>

        {/* Selection summary on final step */}
        {activeStep === steps.length - 1 && Object.keys(selections).length > 0 && (
          <Box sx={{ 
            mb: 3, 
            p: 2, 
            bgcolor: 'grey.50', 
            borderRadius: 1, 
            border: 1, 
            borderColor: 'divider',
            flexShrink: 0
          }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Your Selections:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selections.age ? (
                <Typography variant="body2" sx={{ px: 1.5, py: 0.5, bgcolor: 'primary.100', borderRadius: 1 }}>
                  Ages: {Array.isArray(selections.age) ? `${selections.age[0]}-${selections.age[1]}` : String(selections.age)}
                </Typography>
              ) : null}
              {selections.interests ? (
                <Typography variant="body2" sx={{ px: 1.5, py: 0.5, bgcolor: 'secondary.100', borderRadius: 1 }}>
                  Subject: {String(selections.interests)}
                </Typography>
              ) : null}
              {selections.time ? (
                <Typography variant="body2" sx={{ px: 1.5, py: 0.5, bgcolor: 'info.100', borderRadius: 1 }}>
                  Time: {String(selections.time)}
                </Typography>
              ) : null}
              {selections.goals ? (
                <Typography variant="body2" sx={{ px: 1.5, py: 0.5, bgcolor: 'success.100', borderRadius: 1 }}>
                  Level: {String(selections.goals)}
                </Typography>
              ) : null}
            </Box>
          </Box>
        )}

        {/* Options grid - scrollable if needed */}
        <Box sx={{ 
          flex: 1,
          display: 'grid', 
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)'
          },
          gap: 2,
          alignContent: 'start',
          overflow: 'auto',
          mb: 2
        }}>
          {currentStep.options.map((option) => (
            <Button
              key={option.id}
              variant={selections[currentStep.type] === option.value ? 'contained' : 'outlined'}
              onClick={() => handleSelection(currentStep.type, option.value)}
              disabled={loading}
              sx={{ 
                height: { xs: 80, sm: 100 },
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                flexShrink: 0
              }}
            >
              <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {option.icon}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                {option.label}
              </Typography>
            </Button>
          ))}
        </Box>
      </Box>

      {/* Navigation buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexShrink: 0,
        pt: 2,
        borderTop: 1,
        borderColor: 'divider'
      }}>
        <Button
          disabled={activeStep === 0 || loading}
          onClick={handleBack}
          size="large"
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!selections[currentStep.type] || loading}
          size="large"
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            activeStep === steps.length - 1 ? 'Find Games' : 'Next'
          )}
        </Button>
      </Box>
    </Box>
  );
} 