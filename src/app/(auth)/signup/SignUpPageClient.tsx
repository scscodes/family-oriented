'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
  Paper,
  Divider,
  Link as MuiLink,
  CircularProgress,
  Fade,
  Chip,
} from '@mui/material';
import {
  CheckCircle,
  Lightbulb,
} from '@mui/icons-material';
import RegistrationForm from '@/components/auth/RegistrationForm';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import Link from 'next/link';

const steps = [
  {
    label: 'Account Details',
    description: 'Basic information and credentials',
  },
  {
    label: 'Choose Plan',
    description: 'Select your subscription tier',
  },
  {
    label: 'Complete',
    description: 'Verify email and get started',
  },
];

export default function SignUpPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeStep, setActiveStep] = useState(0);



  const getSuccessContent = () => (
    <Fade in={true}>
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <CheckCircle 
          sx={{ 
            fontSize: 80, 
            color: 'success.main', 
            mb: 3 
          }} 
        />
        
        <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
          Account Created Successfully!
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          Welcome to Family Oriented! Your account has been created successfully. 
          Please check your email for a verification link to activate your account.
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/login')}
            sx={{ py: 1.5 }}
          >
            Go to Login
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push('/games')}
            sx={{ py: 1.5 }}
          >
            Explore Games
          </Button>
        </Box>
      </Box>
    </Fade>
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 4,
        width: '100%',
        maxWidth: 1200,
        mx: 'auto',
        p: 4,
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          fontWeight="bold"
          gutterBottom
        >
          Create Your Account
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Join thousands of families using our educational platform to enhance learning.
        </Typography>

        {/* Progress Stepper */}
        {activeStep < 3 && (
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>
                  <Typography variant="subtitle2">{step.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        )}
      </Box>



      {/* Main Content */}
      <Paper elevation={2} sx={{ p: 4 }}>
        {activeStep === 2 ? (
          getSuccessContent()
        ) : (
          <RegistrationForm
            onSuccess={() => {
              // Show success state
              setActiveStep(2);
            }}
          />
        )}
      </Paper>

      {/* Alternative Options */}
      {activeStep !== 2 && (
        <>
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              or continue with
            </Typography>
          </Divider>

          <SocialLoginButtons />
        </>
      )}

      {/* Login Link */}
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <MuiLink
            component={Link}
            href="/login"
            sx={{ fontWeight: 'bold', textDecoration: 'none' }}
          >
            Sign in
          </MuiLink>
        </Typography>
      </Box>

      {/* Trial Information */}
      {activeStep !== 2 && (
        <Alert 
          severity="info" 
          icon={<Lightbulb />}
          sx={{ mt: 2 }}
        >
          <Typography variant="body2">
            <strong>Start with a 14-day free trial!</strong> No credit card required. 
            You can cancel anytime during the trial period with no charges.
          </Typography>
        </Alert>
      )}
    </Box>
  );
} 