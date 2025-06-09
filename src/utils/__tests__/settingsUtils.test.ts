import { getSettings, saveSettings, DEFAULT_SETTINGS } from '../settingsUtils';

describe('settingsUtils', () => {
  beforeEach(() => {
    // @ts-expect-error localStorage is not defined in Node test environment
    global.localStorage = {
      store: {} as Record<string, string>,
      getItem(key: string) { return this.store[key] || null; },
      setItem(key: string, value: string) { this.store[key] = value; },
      clear() { this.store = {}; }
    };
    localStorage.clear();
  });

  it('returns default settings if nothing in localStorage', () => {
    const settings = getSettings('numbers');
    expect(settings).toEqual(DEFAULT_SETTINGS.numbers);
  });

  it('returns saved settings from localStorage', () => {
    const custom = { ...DEFAULT_SETTINGS.numbers, questionCount: 5 };
    localStorage.setItem('numbers_settings', JSON.stringify(custom));
    const settings = getSettings('numbers');
    expect(settings).toEqual(custom);
  });

  it('saves settings to localStorage', () => {
    const custom = { ...DEFAULT_SETTINGS.numbers, questionCount: 7 };
    saveSettings('numbers', custom);
    const stored = JSON.parse(localStorage.getItem('numbers_settings') ?? '');
    expect(stored).toEqual(custom);
  });

  it('returns default if localStorage is corrupted', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('numbers_settings', 'not-json');
    const settings = getSettings('numbers');
    expect(settings).toEqual(DEFAULT_SETTINGS.numbers);
    spy.mockRestore();
  });
}); 