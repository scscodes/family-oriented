import { renderHook, act } from '@testing-library/react-hooks';
import { useRegistration } from '../useRegistration';
import { mockSupabaseClient } from '../../utils/auth-test-utils';

jest.mock('../useAuth', () => ({
  useAuth: () => ({
    signUp: jest.fn((email: string, password: string) => 
      Promise.resolve({ success: true, user: { id: 'user123' } })
    ),
  }),
}));

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(),
    },
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  })),
}));

const mockSupabaseClient = createClient() as any;

const mockRegistrationData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'password123',
  organization: 'Test Org',
  tier: 'personal',
  billingCycle: 'monthly' as 'monthly' | 'yearly',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSupabaseClient.auth.signUp.mockResolvedValue({
    data: { user: { id: 'user123' } },
    error: null,
  });
  mockSupabaseClient.from = jest.fn(() => ({
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: { id: 'org123' }, error: null }),
  }));
});

describe('useRegistration', () => {
  it('should update registration data', () => {
    const { result } = renderHook(() => useRegistration());

    act(() => {
      result.current.updateRegistrationData(mockRegistrationData);
    });

    expect(result.current.registrationData).toEqual(mockRegistrationData);
  });

  it('should complete registration successfully', async () => {
    const { result } = renderHook(() => useRegistration());

    act(() => {
      result.current.updateRegistrationData(mockRegistrationData);
    });

    await act(async () => {
      const response = await result.current.completeRegistration();
      expect(response.success).toBe(true);
      expect(response.error).toBeUndefined();
    });

    expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith(mockRegistrationData.email, mockRegistrationData.password, expect.any(Object));
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('organizations');
  });

  it('should handle registration error', async () => {
    const { result } = renderHook(() => useRegistration());

    act(() => {
      result.current.updateRegistrationData(mockRegistrationData);
    });

    await act(async () => {
      const response = await result.current.completeRegistration();
      expect(response.success).toBe(false);
      expect(response.error).toBe('Registration failed');
    });
  });
}); 