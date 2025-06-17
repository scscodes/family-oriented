import { getSettings, saveSettings, DEFAULT_SETTINGS } from '../settingsUtils';

describe('settingsUtils', () => {
  beforeEach(() => {
    // Clear the localStorage mock
    (localStorage.clear as jest.Mock).mockClear();
    (localStorage.getItem as jest.Mock).mockClear();
    (localStorage.setItem as jest.Mock).mockClear();
    
    // Reset localStorage mock to default behavior
    (localStorage.getItem as jest.Mock).mockImplementation(() => null);
    (localStorage.setItem as jest.Mock).mockImplementation(() => {});
    (localStorage.clear as jest.Mock).mockImplementation(() => {});
  });

  it('returns default settings if nothing in localStorage', () => {
    const settings = getSettings('numbers');
    expect(settings).toEqual(DEFAULT_SETTINGS.numbers);
  });

  it('returns saved settings from localStorage', () => {
    const custom = { ...DEFAULT_SETTINGS.numbers, questionCount: 5 };
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(custom));
    const settings = getSettings('numbers');
    expect(settings).toEqual(custom);
  });

  it('saves settings to localStorage', () => {
    const custom = { ...DEFAULT_SETTINGS.numbers, questionCount: 7 };
    saveSettings('numbers', custom);
    expect(localStorage.setItem).toHaveBeenCalledWith('numbers_settings', JSON.stringify(custom));
  });

  it('returns default if localStorage is corrupted', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (localStorage.getItem as jest.Mock).mockReturnValue('not-json');
    const settings = getSettings('numbers');
    expect(settings).toEqual(DEFAULT_SETTINGS.numbers);
    spy.mockRestore();
  });
}); 