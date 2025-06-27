'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Box, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { emailValidationRules, getTestEmailSuggestion } from '@/utils/emailValidation';

interface RegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  organization?: string;
  terms: boolean;
  privacy: boolean;
}

interface RegistrationFormProps {
  onNext: (data: RegistrationFormData) => void;
  initialData?: Partial<RegistrationFormData>;
}

export function RegistrationForm({ onNext, initialData }: RegistrationFormProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegistrationFormData>({
    defaultValues: initialData,
  });
  const password = watch('password', '');

  const onSubmit = (data: RegistrationFormData) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="First Name"
            fullWidth
            {...register('firstName', { required: 'First name is required' })}
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
          />
          <TextField
            label="Last Name"
            fullWidth
            {...register('lastName', { required: 'Last name is required' })}
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
          />
        </Box>
        <TextField
          label="Email"
          type="email"
          fullWidth
          {...register('email', emailValidationRules)}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          {...register('password', { 
            required: 'Password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters' }
          })}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          {...register('confirmPassword', { 
            required: 'Please confirm your password',
            validate: value => value === password || 'Passwords do not match'
          })}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
        />
        <TextField
          label="Organization (optional)"
          fullWidth
          {...register('organization')}
        />
        <FormControlLabel
          control={<Checkbox {...register('terms', { required: 'You must accept the terms' })} />}
          label="I agree to the Terms of Service"
          sx={{ alignItems: 'flex-start' }}
        />
        {errors.terms && <Typography variant="caption" color="error">{errors.terms.message}</Typography>}
        <FormControlLabel
          control={<Checkbox {...register('privacy', { required: 'You must accept the privacy policy' })} />}
          label="I agree to the Privacy Policy"
          sx={{ alignItems: 'flex-start' }}
        />
        {errors.privacy && <Typography variant="caption" color="error">{errors.privacy.message}</Typography>}
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Next
        </Button>
      </Box>
    </form>
  );
} 