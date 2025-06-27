/**
 * Centralized mapping of authentication error codes/messages to user-friendly messages.
 * This helps maintain consistent error messaging across the application.
 */
export const authErrorMessages: Record<string, string> = {
  'User already registered': 'An account with this email already exists. Please sign in.',
  'Invalid login credentials': 'The email or password you entered is incorrect. Please try again.',
  'User not found': 'No account exists with this email. Please sign up.',
  'Too many requests': 'Too many attempts. Please wait a few minutes before trying again.',
  'Rate limit exceeded': 'Too many attempts. Please wait a few minutes before trying again.',
  'Token expired': 'Your verification link has expired. Please request a new one.',
  'Invalid token': 'The verification link is invalid. Please check the link or request a new one.',
  'Network error': 'Unable to connect to the server. Please check your internet connection and try again.',
  'Account suspended': 'Your account has been suspended. Please contact support for assistance.',
  'Password too weak': 'Your password is too weak. Please use at least 8 characters with a mix of letters, numbers, and symbols.',
};

/**
 * Utility function to check if an error message indicates a rate limiting issue.
 */
export function isRateLimitError(error: string): boolean {
  return error.includes('Too many requests') || error.includes('Rate limit exceeded');
}

/**
 * Utility function to check if an error message indicates invalid credentials.
 */
export function isInvalidCredentialsError(error: string): boolean {
  return error.includes('Invalid login credentials') || error.includes('User not found');
} 