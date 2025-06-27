/**
 * Environment-aware email validation utilities
 * Provides different validation rules for development vs production
 */

// Common test email domains that are safe to allow in development
const TEST_EMAIL_DOMAINS = [
  'test.com',
  'example.com',
  'test.local',
  'dev.local',
  'localhost',
  'demo.test',
] as const;

/**
 * Check if we're in a development environment
 */
function isDevelopmentEnvironment(): boolean {
  const isDev = process.env.NODE_ENV === 'development';
  const hasDemo = process.env.NEXT_PUBLIC_DEMO_SCENARIO !== undefined;
  const hasDebugFlag = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.includes('.local'));
  
  return isDev || hasDemo || hasDebugFlag || isLocalhost;
}

/**
 * Check if email uses a test domain
 */
function isTestEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return TEST_EMAIL_DOMAINS.includes(domain as any);
}

/**
 * Standard email format validation
 */
function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Environment-aware email validation
 * - In development: allows test domains + standard emails
 * - In production: only standard email validation
 */
export function validateEmail(email: string): { 
  isValid: boolean; 
  error?: string; 
  isTestEmail?: boolean;
} {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  // Check basic format first
  if (!isValidEmailFormat(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  const isTest = isTestEmail(email);
  const isDev = isDevelopmentEnvironment();

  // In development, allow test emails
  if (isDev && isTest) {
    return { 
      isValid: true, 
      isTestEmail: true 
    };
  }

  // In production, reject test emails
  if (!isDev && isTest) {
    return { 
      isValid: false, 
      error: 'Test email domains are not allowed in production' 
    };
  }

  // Standard validation passed
  return { isValid: true };
}

/**
 * React Hook Form compatible validator
 */
export const emailValidationRules = {
  required: 'Email is required',
  validate: (value: string) => {
    const result = validateEmail(value);
    return result.isValid || result.error || 'Invalid email address';
  }
};

/**
 * Get a suggested test email for development
 */
export function getTestEmailSuggestion(): string {
  const names = ['john', 'jane', 'test', 'demo', 'dev'];
  const name = names[Math.floor(Math.random() * names.length)];
  return `${name}@test.com`;
} 