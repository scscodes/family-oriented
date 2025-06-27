import React, { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { createClient } from '@/lib/supabase/client';
import { mockFactories } from '@/utils/__tests__/test-factories';
import { ZustandProvider } from '@/stores/ZustandProvider';
import { ZustandThemeProvider } from '@/app/ZustandThemeProvider';

// Mock Supabase auth client for testing
export const mockSupabaseClient = {
  auth: {
    signInWithPassword: jest.fn().mockResolvedValue({ data: { user: mockFactories.createMockUser() }, error: null }),
    signUp: jest.fn().mockResolvedValue({ data: { user: mockFactories.createMockUser() }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    getSession: jest.fn().mockResolvedValue({ data: { session: { user: mockFactories.createMockUser() } }, error: null }),
    onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    resetPasswordForEmail: jest.fn().mockResolvedValue({ data: {}, error: null }),
    updateUser: jest.fn().mockResolvedValue({ data: { user: mockFactories.createMockUser() }, error: null }),
    resend: jest.fn().mockResolvedValue({ data: {}, error: null }),
    verifyOtp: jest.fn().mockResolvedValue({ data: { user: mockFactories.createMockUser() }, error: null }),
  },
};

// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

interface RenderWithUserProviderOptions {
  userContextValue?: Partial<any>;
}

/**
 * Utility to render components with Zustand providers for authentication testing
 */
export function renderWithUserProvider(
  ui: React.ReactElement,
  options: RenderWithUserProviderOptions = {}
) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <ZustandProvider>
      <ZustandThemeProvider>
        {children}
      </ZustandThemeProvider>
    </ZustandProvider>
  );

  return render(ui, { wrapper: Wrapper });
}

/**
 * Helper function to simulate login in tests
 */
export async function simulateLogin(email: string = 'test@example.com', password: string = 'password123') {
  const mockUser = mockFactories.createMockUser({ email });
  mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
    data: { user: mockUser, session: { user: mockUser } },
    error: null,
  });
  return mockUser;
}

/**
 * Helper function to simulate logout in tests
 */
export async function simulateLogout() {
  mockSupabaseClient.auth.signOut.mockResolvedValueOnce({ error: null });
  mockSupabaseClient.auth.getSession.mockResolvedValueOnce({ data: { session: null }, error: null });
}

/**
 * Mock user data for testing different authentication states
 */
export const mockAuthStates = {
  authenticated: {
    user: mockFactories.createMockUser(),
    loadingState: { isLoading: false, isInitial: false, isReady: true },
  },
  unauthenticated: {
    user: null,
    loadingState: { isLoading: false, isInitial: false, isReady: true },
  },
  loading: {
    user: null,
    loadingState: { isLoading: true, isInitial: true, isReady: false },
  },
};

/**
 * Reset all auth mocks to their default state
 */
export function resetAuthMocks() {
  Object.values(mockSupabaseClient.auth).forEach(mockFn => {
    if (jest.isMockFunction(mockFn)) {
      mockFn.mockClear();
    }
  });
}

// Auth test utilities
export const createAuthWrapper = ({ children }: { children: React.ReactNode }) => (
  <ZustandProvider>
    <ZustandThemeProvider>
      {children}
    </ZustandThemeProvider>
  </ZustandProvider>
);

export const mockAuthState = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    created_at: new Date().toISOString(),
  },
  isAuthenticated: true,
};

export const createMockSupabaseClient = () => ({
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
}); 