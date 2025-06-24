import { renderHook, act } from '@testing-library/react-hooks';
import { useRegistration } from '../useRegistration';
import { mockSupabaseClient } from '../../utils/auth-test-utils';

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

const mockSignUp = jest.fn();

jest.mock('../useAuth', () => ({
  useAuth: () => ({
    signUp: mockSignUp,
  }),
}));

const mockRegistrationData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'password123',
  organization: 'Test Org',
  tier: 'professional',
  billingCycle: 'monthly',
};

mockSupabaseClient.from = jest.fn(() => ({
  insert: jest.fn(() => ({
    select: jest.fn(() => ({
      single: jest.fn(() => Promise.resolve({ data: { id: 'org-id' }, error: null }))
    }))
  })),
  update: jest.fn(() => ({
    eq: jest.fn(() => Promise.resolve({}))
  }))
}));

describe('useRegistration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update registration data', () => {
    const { result } = renderHook(() => useRegistration());

    act(() => {
      result.current.updateRegistrationData(mockRegistrationData);
    });

    expect(result.current.registrationData).toEqual(mockRegistrationData);
  });

  it('should complete registration successfully', async () => {
    mockSignUp.mockResolvedValueOnce({ success: true, data: { user: { id: 'user-id' } } });

    const { result } = renderHook(() => useRegistration());

    act(() => {
      result.current.updateRegistrationData(mockRegistrationData);
    });

    await act(async () => {
      const response = await result.current.completeRegistration();
      expect(response.success).toBe(true);
      expect(response.error).toBeUndefined();
    });

    expect(mockSignUp).toHaveBeenCalledWith(mockRegistrationData.email, mockRegistrationData.password, expect.any(Object));
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('organizations');
  });

  it('should handle registration error', async () => {
    mockSignUp.mockResolvedValueOnce({ success: false, error: 'Registration failed' });

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