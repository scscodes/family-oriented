'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Alert,
  Link,
  Divider,
  CircularProgress,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Paper,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  Business,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

// Password strength calculation
const calculatePasswordStrength = (password: string): {
  score: number;
  feedback: string[];
  color: 'error' | 'warning' | 'success';
} => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) {
    score += 25;
  } else {
    feedback.push('At least 8 characters');
  }

  if (/[a-z]/.test(password)) {
    score += 25;
  } else {
    feedback.push('Lowercase letter');
  }

  if (/[A-Z]/.test(password)) {
    score += 25;
  } else {
    feedback.push('Uppercase letter');
  }

  if (/[0-9]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Number');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 10;
  } else {
    feedback.push('Special character');
  }

  let color: 'error' | 'warning' | 'success' = 'error';
  if (score >= 75) color = 'success';
  else if (score >= 50) color = 'warning';

  return { score, feedback, color };
};

// Validation schema using Zod
const registrationSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  organizationName: z
    .string()
    .optional(),
  accountType: z.enum(['personal', 'organization']),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, 'You must agree to the terms and conditions'),
  agreeToPrivacy: z
    .boolean()
    .refine((val) => val === true, 'You must agree to the privacy policy'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.accountType === 'organization' && !data.organizationName) {
    return false;
  }
  return true;
}, {
  message: "Organization name is required for organization accounts",
  path: ["organizationName"],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  onSuccess?: () => void;
  onStepChange?: (step: number) => void;
}

const steps = ['Account Details', 'Account Type', 'Terms & Conditions'];

export default function RegistrationForm({ onSuccess, onStepChange }: RegistrationFormProps) {
  const { signUp, loading } = useAuth();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setError,
    clearErrors,
    trigger,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      organizationName: '',
      accountType: 'personal',
      agreeToTerms: false,
      agreeToPrivacy: false,
    },
    mode: 'onChange',
  });

  const watchedPassword = watch('password');
  const watchedAccountType = watch('accountType');
  const passwordStrength = calculatePasswordStrength(watchedPassword || '');

  const handleNext = async () => {
    let fieldsToValidate: (keyof RegistrationFormData)[] = [];
    
    switch (activeStep) {
      case 0:
        fieldsToValidate = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
        break;
      case 1:
        fieldsToValidate = ['accountType'];
        if (watchedAccountType === 'organization') {
          fieldsToValidate.push('organizationName');
        }
        break;
      case 2:
        fieldsToValidate = ['agreeToTerms', 'agreeToPrivacy'];
        break;
    }

    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid) {
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      onStepChange?.(nextStep);
    }
  };

  const handleBack = () => {
    const prevStep = activeStep - 1;
    setActiveStep(prevStep);
    onStepChange?.(prevStep);
  };

  const onSubmit = async (data: RegistrationFormData) => {
    setAuthError(null);
    clearErrors();

    try {
      const result = await signUp(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName,
      });
      
      if (result.error) {
        setAuthError(result.error);
        
        // Set specific field errors if applicable
        if (result.error.includes('email')) {
          setError('email', { message: 'Email address is invalid or already taken' });
        }
        return;
      }

      // Success - handle callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/verify-email?message=' + encodeURIComponent('Check your email for a verification link'));
      }
    } catch {
      setAuthError('An unexpected error occurred. Please try again.');
    }
  };

  const isLoading = loading.signUp || isSubmitting;

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
            {/* Name Fields */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
              <TextField
                {...register('firstName')}
                label="First Name"
                variant="outlined"
                fullWidth
                autoComplete="given-name"
                autoFocus
                disabled={isLoading}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color={errors.firstName ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                {...register('lastName')}
                label="Last Name"
                variant="outlined"
                fullWidth
                autoComplete="family-name"
                disabled={isLoading}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color={errors.lastName ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Email Field */}
            <TextField
              {...register('email')}
              type="email"
              label="Email Address"
              variant="outlined"
              fullWidth
              autoComplete="email"
              disabled={isLoading}
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color={errors.email ? 'error' : 'action'} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Field */}
            <TextField
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              label="Password"
              variant="outlined"
              fullWidth
              autoComplete="new-password"
              disabled={isLoading}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color={errors.password ? 'error' : 'action'} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(!showPassword)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      disabled={isLoading}
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Strength Indicator */}
            {watchedPassword && (
              <Box sx={{ mt: -1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Password Strength:
                  </Typography>
                  <Chip
                    label={passwordStrength.score >= 75 ? 'Strong' : passwordStrength.score >= 50 ? 'Good' : 'Weak'}
                    color={passwordStrength.color}
                    size="small"
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={passwordStrength.score}
                  color={passwordStrength.color}
                  sx={{ height: 6, borderRadius: 3 }}
                />
                {passwordStrength.feedback.length > 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                    Missing: {passwordStrength.feedback.join(', ')}
                  </Typography>
                )}
              </Box>
            )}

            {/* Confirm Password Field */}
            <TextField
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm Password"
              variant="outlined"
              fullWidth
              autoComplete="new-password"
              disabled={isLoading}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color={errors.confirmPassword ? 'error' : 'action'} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      disabled={isLoading}
                      size="small"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
            <Typography variant="h6" component="h3" sx={{ textAlign: 'center' }}>
              Account Type
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
              {/* Personal Account Option */}
              <Paper
                sx={{
                  p: 3,
                  border: 2,
                  borderColor: watchedAccountType === 'personal' ? 'primary.main' : 'divider',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
                onClick={() => {
                  register('accountType').onChange({ target: { value: 'personal' } });
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <input
                    {...register('accountType')}
                    type="radio"
                    value="personal"
                    style={{ margin: 0 }}
                  />
                  <Box>
                    <Typography variant="h6">Personal Account</Typography>
                    <Typography variant="body2" color="text.secondary">
                      For individual use and family learning
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Organization Account Option */}
              <Paper
                sx={{
                  p: 3,
                  border: 2,
                  borderColor: watchedAccountType === 'organization' ? 'primary.main' : 'divider',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
                onClick={() => {
                  register('accountType').onChange({ target: { value: 'organization' } });
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <input
                    {...register('accountType')}
                    type="radio"
                    value="organization"
                    style={{ margin: 0 }}
                  />
                  <Box>
                    <Typography variant="h6">Organization Account</Typography>
                    <Typography variant="body2" color="text.secondary">
                      For schools, daycares, and educational organizations
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Organization Name Field (conditional) */}
            {watchedAccountType === 'organization' && (
              <TextField
                {...register('organizationName')}
                label="Organization Name"
                variant="outlined"
                fullWidth
                disabled={isLoading}
                error={!!errors.organizationName}
                helperText={errors.organizationName?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business color={errors.organizationName ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
            <Typography variant="h6" component="h3" sx={{ textAlign: 'center' }}>
              Terms & Conditions
            </Typography>

            {/* Terms Checkboxes */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    {...register('agreeToTerms')}
                    disabled={isLoading}
                    color="primary"
                    icon={<Cancel color="error" />}
                    checkedIcon={<CheckCircle color="success" />}
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{' '}
                    <Link href="/terms" target="_blank" rel="noopener">
                      Terms of Service
                    </Link>
                  </Typography>
                }
                sx={{
                  alignItems: 'flex-start',
                  '& .MuiFormControlLabel-label': {
                    pt: 0.5,
                  },
                }}
              />
              {errors.agreeToTerms && (
                <Typography variant="body2" color="error" sx={{ mt: -1, ml: 4 }}>
                  {errors.agreeToTerms.message}
                </Typography>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    {...register('agreeToPrivacy')}
                    disabled={isLoading}
                    color="primary"
                    icon={<Cancel color="error" />}
                    checkedIcon={<CheckCircle color="success" />}
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{' '}
                    <Link href="/privacy" target="_blank" rel="noopener">
                      Privacy Policy
                    </Link>
                  </Typography>
                }
                sx={{
                  alignItems: 'flex-start',
                  '& .MuiFormControlLabel-label': {
                    pt: 0.5,
                  },
                }}
              />
              {errors.agreeToPrivacy && (
                <Typography variant="body2" color="error" sx={{ mt: -1, ml: 4 }}>
                  {errors.agreeToPrivacy.message}
                </Typography>
              )}
            </Box>

            <Divider />

            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              By creating an account, you agree to receive educational content and platform updates. 
              You can unsubscribe at any time.
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 4,
        width: '100%',
      }}
      noValidate
      role="form"
      aria-label="Registration form"
    >
      {/* Form Title */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: 'text.primary',
            mb: 1,
          }}
        >
          Create Your Account
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Join thousands of families using our educational platform
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Error Alert */}
      {authError && (
        <Alert 
          severity="error" 
          sx={{ width: '100%' }}
          role="alert"
          aria-live="polite"
        >
          {authError}
        </Alert>
      )}

      {/* Step Content */}
      <Box sx={{ minHeight: '400px' }}>
        {renderStepContent(activeStep)}
      </Box>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
        <Button
          disabled={activeStep === 0 || isLoading}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        
        {activeStep === steps.length - 1 ? (
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{
              py: 1.5,
              px: 3,
              fontSize: '1rem',
              fontWeight: 'bold',
              textTransform: 'none',
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                <span>Creating Account...</span>
              </Box>
            ) : (
              'Create Account'
            )}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={isLoading}
            sx={{
              py: 1.5,
              px: 3,
              fontSize: '1rem',
              fontWeight: 'bold',
              textTransform: 'none',
            }}
          >
            Next
          </Button>
        )}
      </Box>

      {/* Sign In Link */}
      <Box sx={{ textAlign: 'center', pt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link
            href="/login"
            sx={{
              fontWeight: 'bold',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
              '&:focus': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: '2px',
                borderRadius: 1,
              },
            }}
          >
            Sign in here
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}