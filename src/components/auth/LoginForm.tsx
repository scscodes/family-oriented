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
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';

// Validation schema using Zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export default function LoginForm({ onSuccess, redirectTo }: LoginFormProps) {
  const { signIn, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Get redirect URL from props or search params
  const finalRedirectTo = redirectTo || searchParams.get('redirectTo') || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    clearErrors();

    try {
      const result = await signIn(data.email, data.password);
      
      if (result.error) {
        setAuthError(result.error);
        
        // Set specific field errors if applicable
        if (result.error.includes('Invalid email')) {
          setError('email', { message: 'Invalid email address' });
        } else if (result.error.includes('password')) {
          setError('password', { message: 'Invalid password' });
        }
        return;
      }

      // Success - handle remember me functionality
      if (data.rememberMe) {
        localStorage.setItem('rememberLogin', 'true');
      } else {
        localStorage.removeItem('rememberLogin');
      }

      // Call success callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(finalRedirectTo);
      }
      } catch {
    setAuthError('An unexpected error occurred. Please try again.');
  }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const isLoading = loading.signIn || isSubmitting;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 3,
        width: '100%',
      }}
      noValidate
      role="form"
      aria-label="Login form"
    >
      {/* Form Title */}
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: 'text.primary',
            mb: 1,
          }}
        >
          Welcome Back
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sign in to your account to continue
        </Typography>
      </Box>

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

      {/* Email Field */}
      <TextField
        {...register('email')}
        type="email"
        label="Email Address"
        variant="outlined"
        fullWidth
        autoComplete="email"
        autoFocus
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
        sx={{
          '& .MuiOutlinedInput-root': {
            '&:focus-within': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: 2,
              },
            },
          },
        }}
        inputProps={{
          'aria-describedby': errors.email ? 'email-error' : undefined,
        }}
      />

      {/* Password Field */}
      <TextField
        {...register('password')}
        type={showPassword ? 'text' : 'password'}
        label="Password"
        variant="outlined"
        fullWidth
        autoComplete="current-password"
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
                onClick={handleTogglePasswordVisibility}
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
        inputProps={{
          'aria-describedby': errors.password ? 'password-error' : undefined,
        }}
      />

      {/* Remember Me and Forgot Password */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr auto' },
          gap: 2,
          alignItems: 'center',
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              {...register('rememberMe')}
              disabled={isLoading}
              color="primary"
            />
          }
          label="Remember me"
          sx={{
            justifySelf: 'start',
            '& .MuiFormControlLabel-label': {
              fontSize: '0.875rem',
            },
          }}
        />
        
        <Link
          component="button"
          type="button"
          onClick={handleForgotPassword}
          disabled={isLoading}
          sx={{
            fontSize: '0.875rem',
            textDecoration: 'none',
            justifySelf: { xs: 'start', sm: 'end' },
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
          aria-label="Go to forgot password page"
        >
          Forgot password?
        </Link>
      </Box>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={isLoading}
        sx={{
          py: 1.5,
          fontSize: '1rem',
          fontWeight: 'bold',
          textTransform: 'none',
          mt: 1,
        }}
        aria-label={isLoading ? 'Signing in...' : 'Sign in to your account'}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} color="inherit" />
            <span>Signing In...</span>
          </Box>
        ) : (
          'Sign In'
        )}
      </Button>

      {/* Divider */}
      <Divider sx={{ my: 1 }}>
        <Typography variant="body2" color="text.secondary">
          or
        </Typography>
      </Divider>

      {/* Sign Up Link */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
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
            Sign up here
          </Link>
        </Typography>
      </Box>
    </Box>
  );
} 