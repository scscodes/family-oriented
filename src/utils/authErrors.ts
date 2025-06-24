import { AuthError } from '@supabase/supabase-js';
import { logger } from './logger';

export type AuthErrorType = 
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'rate_limit_exceeded'
  | 'network_error'
  | 'weak_password'
  | 'email_already_registered'
  | 'invalid_email'
  | 'account_suspended'
  | 'token_expired'
  | 'token_invalid'
  | 'signup_disabled'
  | 'captcha_failed'
  | 'unknown_error';

export interface AuthErrorInfo {
  type: AuthErrorType;
  message: string;
  userMessage: string;
  severity: 'error' | 'warning' | 'info';
  retryable: boolean;
  actionRequired?: string;
  supportContact?: boolean;
}

/**
 * Maps Supabase auth error codes to user-friendly error information
 */
const ERROR_MAPPINGS: Record<string, Partial<AuthErrorInfo>> = {
  // Authentication errors
  'invalid_credentials': {
    type: 'invalid_credentials',
    userMessage: 'Invalid email or password. Please check your credentials and try again.',
    severity: 'error',
    retryable: true,
  },
  'email_not_confirmed': {
    type: 'email_not_confirmed',
    userMessage: 'Please verify your email address before signing in. Check your inbox for a verification link.',
    severity: 'warning',
    retryable: false,
    actionRequired: 'verify_email',
  },
  'invalid_login_credentials': {
    type: 'invalid_credentials',
    userMessage: 'Invalid email or password. Please check your credentials and try again.',
    severity: 'error',
    retryable: true,
  },
  'email_address_invalid': {
    type: 'invalid_email',
    userMessage: 'Please enter a valid email address.',
    severity: 'error',
    retryable: true,
  },
  'signup_disabled': {
    type: 'signup_disabled',
    userMessage: 'New user registration is currently disabled. Please contact support for assistance.',
    severity: 'error',
    retryable: false,
    supportContact: true,
  },

  // Rate limiting
  'email_rate_limit_exceeded': {
    type: 'rate_limit_exceeded',
    userMessage: 'Too many email requests. Please wait a few minutes before trying again.',
    severity: 'warning',
    retryable: true,
  },
  'sms_send_rate_limit_exceeded': {
    type: 'rate_limit_exceeded',
    userMessage: 'Too many SMS requests. Please wait before trying again.',
    severity: 'warning',
    retryable: true,
  },
  'over_email_send_rate_limit': {
    type: 'rate_limit_exceeded',
    userMessage: 'Email sending rate limit exceeded. Please wait before requesting another email.',
    severity: 'warning',
    retryable: true,
  },

  // Password related
  'weak_password': {
    type: 'weak_password',
    userMessage: 'Password is too weak. Please choose a stronger password with at least 8 characters.',
    severity: 'error',
    retryable: true,
  },
  'password_too_short': {
    type: 'weak_password',
    userMessage: 'Password must be at least 8 characters long.',
    severity: 'error',
    retryable: true,
  },

  // Registration errors
  'user_already_registered': {
    type: 'email_already_registered',
    userMessage: 'An account with this email already exists. Try signing in instead.',
    severity: 'warning',
    retryable: false,
    actionRequired: 'redirect_to_login',
  },
  'email_address_not_authorized': {
    type: 'email_already_registered',
    userMessage: 'This email address is already associated with an account.',
    severity: 'warning',
    retryable: false,
  },

  // Token errors
  'token_expired': {
    type: 'token_expired',
    userMessage: 'This link has expired. Please request a new verification email.',
    severity: 'warning',
    retryable: false,
    actionRequired: 'resend_email',
  },
  'token_invalid': {
    type: 'token_invalid',
    userMessage: 'This verification link is invalid. Please check your email for a valid link.',
    severity: 'error',
    retryable: false,
    actionRequired: 'resend_email',
  },
  'invalid_token': {
    type: 'token_invalid',
    userMessage: 'Invalid or malformed token. Please try again.',
    severity: 'error',
    retryable: false,
  },

  // Account status
  'email_banned': {
    type: 'account_suspended',
    userMessage: 'This account has been suspended. Please contact support for assistance.',
    severity: 'error',
    retryable: false,
    supportContact: true,
  },
  'account_suspended': {
    type: 'account_suspended',
    userMessage: 'Your account has been temporarily suspended. Please contact support.',
    severity: 'error',
    retryable: false,
    supportContact: true,
  },

  // CAPTCHA
  'captcha_failed': {
    type: 'captcha_failed',
    userMessage: 'Security verification failed. Please try again.',
    severity: 'error',
    retryable: true,
  },

  // Network and server errors
  'network_error': {
    type: 'network_error',
    userMessage: 'Network connection error. Please check your internet connection and try again.',
    severity: 'error',
    retryable: true,
  },
  'server_error': {
    type: 'unknown_error',
    userMessage: 'A server error occurred. Please try again in a few moments.',
    severity: 'error',
    retryable: true,
  },
};

/**
 * Extracts error information from various error types
 */
export function parseAuthError(error: unknown): AuthErrorInfo {
  let errorCode: string | undefined;
  let errorMessage: string;

  // Handle different error types
  if (error instanceof AuthError) {
    errorCode = error.message?.toLowerCase();
    errorMessage = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String(error.message);
    errorCode = errorMessage.toLowerCase();
  } else if (typeof error === 'string') {
    errorMessage = error;
    errorCode = error.toLowerCase();
  } else {
    errorMessage = 'An unknown error occurred';
    errorCode = 'unknown_error';
  }

  // Log the error for debugging
  logger.error('Auth error occurred', { errorCode, errorMessage, error });

  // Find matching error mapping
  let matchedMapping: Partial<AuthErrorInfo> | undefined;

  if (errorCode) {
    // Try exact match first
    matchedMapping = ERROR_MAPPINGS[errorCode];

    // If no exact match, try partial matches
    if (!matchedMapping) {
      for (const [key, mapping] of Object.entries(ERROR_MAPPINGS)) {
        if (errorCode.includes(key) || key.includes(errorCode)) {
          matchedMapping = mapping;
          break;
        }
      }
    }
  }

  // Return error info with defaults
  return {
    type: matchedMapping?.type || 'unknown_error',
    message: errorMessage,
    userMessage: matchedMapping?.userMessage || 'An unexpected error occurred. Please try again.',
    severity: matchedMapping?.severity || 'error',
    retryable: matchedMapping?.retryable ?? true,
    actionRequired: matchedMapping?.actionRequired,
    supportContact: matchedMapping?.supportContact || false,
  };
}

/**
 * Checks if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const errorInfo = parseAuthError(error);
  return errorInfo.retryable;
}

/**
 * Gets retry delay based on attempt count (exponential backoff)
 */
export function getRetryDelay(attemptCount: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
  return Math.min(1000 * Math.pow(2, attemptCount), 30000);
}

/**
 * Gets user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  const errorInfo = parseAuthError(error);
  return errorInfo.userMessage;
}

/**
 * Checks if error requires specific action
 */
export function getRequiredAction(error: unknown): string | undefined {
  const errorInfo = parseAuthError(error);
  return errorInfo.actionRequired;
}

/**
 * Checks if error requires support contact
 */
export function requiresSupportContact(error: unknown): boolean {
  const errorInfo = parseAuthError(error);
  return errorInfo.supportContact || false;
}

/**
 * Rate limiting utilities
 */
export class RateLimitTracker {
  private attempts = new Map<string, number[]>();

  /**
   * Check if operation is rate limited
   */
  isRateLimited(operation: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(operation) || [];
    
    // Filter out attempts outside the window
    const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
    
    return recentAttempts.length >= maxAttempts;
  }

  /**
   * Record an attempt
   */
  recordAttempt(operation: string): void {
    const now = Date.now();
    const attempts = this.attempts.get(operation) || [];
    attempts.push(now);
    this.attempts.set(operation, attempts);
  }

  /**
   * Clear attempts for an operation
   */
  clearAttempts(operation: string): void {
    this.attempts.delete(operation);
  }

  /**
   * Get time until rate limit reset
   */
  getResetTime(operation: string, windowMs: number): number {
    const attempts = this.attempts.get(operation) || [];
    if (attempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const resetTime = oldestAttempt + windowMs;
    
    return Math.max(0, resetTime - Date.now());
  }
}

/**
 * Global rate limit tracker instance
 */
export const rateLimitTracker = new RateLimitTracker();

/**
 * Common rate limits for auth operations
 */
export const RATE_LIMITS = {
  LOGIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  REGISTRATION: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  PASSWORD_RESET: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  EMAIL_VERIFICATION: { maxAttempts: 5, windowMs: 60 * 60 * 1000 }, // 5 attempts per hour
} as const; 