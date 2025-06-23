/**
 * Enhanced SettingsContext Tests
 * Updated to use new testing standards with improved safety measures
 */

import { renderHook, act } from '@testing-library/react';
import { SettingsProvider, useSettings } from '../SettingsContext';

// Test timeout constants
const TEST_TIMEOUTS = {
  FAST: 1000,
  MEDIUM: 3000
} as const;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SettingsProvider>{children}</SettingsProvider>
);

describe('SettingsContext - Enhanced Tests', () => {
  beforeEach(() => {
    // Clear all localStorage mock calls
    (localStorage.clear as jest.Mock).mockClear();
    (localStorage.getItem as jest.Mock).mockClear();
    (localStorage.setItem as jest.Mock).mockClear();
    
    // Reset to default behavior
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('provides default settings when none saved', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings.questionsPerSession).toBe(10);
    expect(result.current.settings.numberRange.min).toBe(1);
  });

  it('loads settings from localStorage', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(
      JSON.stringify({ questionsPerSession: 5 })
    );
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings.questionsPerSession).toBe(5);
  });

  it('updates and resets settings properly', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => {
      result.current.updateSettings({
        questionsPerSession: 8,
        mathOperations: { addition: false, subtraction: true },
      });
    });
    expect(result.current.settings.questionsPerSession).toBe(8);
    expect(result.current.settings.mathOperations.addition).toBe(false);
    // unchanged property
    expect(result.current.settings.mathOperations.subtraction).toBe(true);

    act(() => {
      result.current.updateNumberRange(2, 5);
    });
    expect(result.current.settings.numberRange).toEqual({ min: 2, max: 5 });

    act(() => {
      result.current.resetSettings();
    });
    expect(result.current.settings.questionsPerSession).toBe(10);
    expect(result.current.settings.numberRange.min).toBe(1);
  });
});
