/**
 * Test Constants and Timeouts
 * Shared constants used across test files
 */

export const TEST_TIMEOUTS = {
  IMMEDIATE: 0,
  FAST: 1000,
  MEDIUM: 3000,
  SLOW: 6000,
  INTEGRATION: 10000,
  CRITICAL: 15000
} as const;

export const MOCK_IDS = {
  USER: 'test-user-id',
  AVATAR: '00000000-0000-0000-0000-000000000001',
  ORG: 'test-org-id',
  SESSION: 'mock-session-id'
} as const; 