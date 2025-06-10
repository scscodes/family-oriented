import { renderHook, act } from '@testing-library/react';
import { SettingsProvider, useSettings } from '../SettingsContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SettingsProvider>{children}</SettingsProvider>
);

describe('SettingsContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides default settings when none saved', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings.questionsPerSession).toBe(10);
    expect(result.current.settings.numberRange.min).toBe(1);
  });

  it('loads settings from localStorage', () => {
    localStorage.setItem(
      'globalGameSettings',
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
