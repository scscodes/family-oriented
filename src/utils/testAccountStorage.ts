/**
 * Test Account Storage for Development
 * Allows test accounts to persist across sessions for easier testing
 */

interface TestAccount {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tier: string;
  createdAt: string;
}

const TEST_ACCOUNTS_KEY = 'dev_test_accounts';

/**
 * Check if we're in development mode
 */
function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Store a test account for future login
 */
export function storeTestAccount(account: Omit<TestAccount, 'createdAt'>): void {
  if (!isDevelopmentMode()) return;
  
  try {
    const existingAccounts = getTestAccounts();
    const newAccount: TestAccount = {
      ...account,
      createdAt: new Date().toISOString(),
    };
    
    // Remove existing account with same email
    const filteredAccounts = existingAccounts.filter(acc => acc.email !== account.email);
    
    // Add new account
    const updatedAccounts = [...filteredAccounts, newAccount];
    
    localStorage.setItem(TEST_ACCOUNTS_KEY, JSON.stringify(updatedAccounts));
  } catch (error) {
    console.warn('Failed to store test account:', error);
  }
}

/**
 * Get all stored test accounts
 */
export function getTestAccounts(): TestAccount[] {
  if (!isDevelopmentMode()) return [];
  
  try {
    const stored = localStorage.getItem(TEST_ACCOUNTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to retrieve test accounts:', error);
    return [];
  }
}

/**
 * Find a test account by email
 */
export function findTestAccount(email: string): TestAccount | null {
  if (!isDevelopmentMode()) return null;
  
  const accounts = getTestAccounts();
  return accounts.find(acc => acc.email === email) || null;
}

/**
 * Validate test account credentials
 */
export function validateTestCredentials(email: string, password: string): boolean {
  if (!isDevelopmentMode()) return false;
  
  const account = findTestAccount(email);
  return account ? account.password === password : false;
}

/**
 * Clear all test accounts (useful for cleanup)
 */
export function clearTestAccounts(): void {
  if (!isDevelopmentMode()) return;
  
  try {
    localStorage.removeItem(TEST_ACCOUNTS_KEY);
  } catch (error) {
    console.warn('Failed to clear test accounts:', error);
  }
} 