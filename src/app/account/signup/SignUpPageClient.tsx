'use client';

import React, { useState } from 'react';
import { Box, Stepper, Step, StepLabel, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { RegistrationForm } from '@/features/account/components/auth/RegistrationForm';
import { TierSelectionStep } from '@/features/account/components/auth/TierSelectionStep';
import { useRegistration } from '@/features/account/hooks/useRegistration';
import { TestEmailHelper } from '@/shared/components/debug/TestEmailHelper';
import { validateEmail } from '@/utils/emailValidation';

export function SignUpPageClient() {
  const [activeStep, setActiveStep] = useState(0);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const router = useRouter();
  const { registrationData, updateRegistrationData, completeRegistration } = useRegistration();

  const steps = ['User Details', 'Subscription Tier', 'Verification'];

  const handleNext = async (data?: any) => {
    if (data) {
      updateRegistrationData(data);
    }
    
    // If we're on the tier selection step (step 1) and moving to verification (step 2)
    if (activeStep === 1) {
      const result = await completeRegistration();
      if (result.success) {
        setRegistrationComplete(true);
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      } else {
        console.error('Registration failed:', result.error);
        // Stay on current step and show error
        return;
      }
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <TestEmailHelper />
            <RegistrationForm onNext={handleNext} initialData={registrationData} />
          </>
        );
      case 1:
        return <TierSelectionStep onNext={handleNext} onBack={handleBack} initialData={registrationData} />;
      case 2:
        const emailValidation = validateEmail(registrationData.email || '');
        const isTestEmail = emailValidation.isTestEmail;
        
        return (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {isTestEmail ? 'Registration Complete!' : 'Email Verification Required'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {isTestEmail 
                ? 'Your test account has been created successfully! You can now sign in with your credentials.'
                : 'Please check your email to verify your account before signing in.'
              }
            </Typography>
            
            {isTestEmail && (
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  onClick={() => router.push('/account/login')}
                >
                  Go to Sign In
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => router.push('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              </Box>
            )}
            
            {!isTestEmail && (
              <Button 
                variant="outlined" 
                onClick={() => router.push('/account/login')}
              >
                Go to Sign In
              </Button>
            )}
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length ? (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="h6">Registration Complete</Typography>
          <Typography variant="body1">Your account has been created successfully.</Typography>
        </Box>
      ) : (
        <>{getStepContent(activeStep)}</>
      )}
    </Box>
  );
} 