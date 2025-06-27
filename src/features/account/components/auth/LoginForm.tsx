'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Box, Checkbox, FormControlLabel } from '@mui/material';
import { useAuth } from '@/features/account/hooks/useAuth';
import { AuthErrorDisplay } from './AuthErrorDisplay';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const { signIn, loading, error } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    const result = await signIn(data.email, data.password);
    if (result.success) {
      onLoginSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          {...register('email', { 
            required: 'Email is required',
            pattern: { value: /^[^@]+@[^@]+\.[^@]+$/, message: 'Invalid email address' }
          })}
          error={!!errors.email}
          helperText={errors.email?.message}
          disabled={loading}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          {...register('password', { required: 'Password is required' })}
          error={!!errors.password}
          helperText={errors.password?.message}
          disabled={loading}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControlLabel
            control={<Checkbox {...register('rememberMe')} disabled={loading} />}
            label="Remember me"
          />
          <Button variant="text" size="small" href="/account/forgot-password" disabled={loading}>
            Forgot Password?
          </Button>
        </Box>
        <AuthErrorDisplay error={error} onRetry={() => handleSubmit(onSubmit)()} />
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
        <Box sx={{ textAlign: 'center' }}>
          <Button variant="text" size="small" href="/account/signup">
            Don't have an account? Sign Up
          </Button>
        </Box>
      </Box>
    </form>
  );
} 