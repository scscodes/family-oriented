/**
 * Enhanced Settings Utils Tests
 * 
 * This demonstrates the new testing standards with:
 * - Timeout protection for async operations
 * - Comprehensive error boundary testing
 * - Performance validation
 * - Standardized cleanup and safety measures
 * - Consistent test structure and naming
 */

import { getSettings, saveSettings, DEFAULT_SETTINGS } from '../settingsUtils';

// Test timeout constants
const TEST_TIMEOUTS = {
  FAST: 1000,
  MEDIUM: 3000,
  SLOW: 5000
} as const;

// Mock data factories
const createMockSettings = (overrides = {}) => ({
  ...DEFAULT_SETTINGS.numbers,
  ...overrides
});

describe('SettingsUtils - Enhanced Tests', () => {
  // Enhanced setup and cleanup
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset localStorage mock to default behavior
    (localStorage.getItem as jest.Mock).mockImplementation(() => null);
    (localStorage.setItem as jest.Mock).mockImplementation(() => {});
    (localStorage.clear as jest.Mock).mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
  });

  describe('Settings Retrieval', () => {
    it('should return default settings when none saved', () => {
      const startTime = performance.now();
      
      const settings = getSettings('numbers');
      
      const executionTime = performance.now() - startTime;
      
      expect(settings).toEqual(DEFAULT_SETTINGS.numbers);
      expect(executionTime).toBeLessThan(100); // Performance check for sync operation
    });

    it('should load settings from localStorage with error handling', () => {
      const customSettings = createMockSettings({ questionCount: 5 });
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(customSettings));
      
      const settings = getSettings('numbers');
      
      expect(settings).toEqual(customSettings);
      expect(localStorage.getItem).toHaveBeenCalledWith('numbers_settings');
    });

    it('should handle corrupted localStorage data gracefully', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock corrupted JSON data
      (localStorage.getItem as jest.Mock).mockReturnValue('invalid-json-data');
      
      const settings = getSettings('numbers');
      
      // Should fallback to defaults when JSON is corrupted
      expect(settings).toEqual(DEFAULT_SETTINGS.numbers);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle localStorage errors without crashing', () => {
      // Mock localStorage.getItem to throw an error
      (localStorage.getItem as jest.Mock).mockImplementation(() => {
        throw new Error('Storage access denied');
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const settings = getSettings('numbers');
      
      // Should fallback to defaults when localStorage throws
      expect(settings).toEqual(DEFAULT_SETTINGS.numbers);
      
      consoleSpy.mockRestore();
    });
  });

  describe('Settings Persistence', () => {
    it('should save settings to localStorage successfully', () => {
      const startTime = performance.now();
      const customSettings = createMockSettings({ questionCount: 7 });
      
      saveSettings('numbers', customSettings);
      
      const executionTime = performance.now() - startTime;
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'numbers_settings', 
        JSON.stringify(customSettings)
      );
      expect(executionTime).toBeLessThan(100); // Performance check
    });

    it('should handle save errors gracefully', () => {
      // Mock localStorage.setItem to throw an error (e.g., quota exceeded)
      (localStorage.setItem as jest.Mock).mockImplementation(() => {
        throw new Error('QuotaExceededError: Storage quota exceeded');
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const customSettings = createMockSettings({ questionCount: 15 });
      
      // Should not throw error even when localStorage fails
      expect(() => saveSettings('numbers', customSettings)).not.toThrow();
      
      consoleSpy.mockRestore();
    });

    it('should handle invalid settings data', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Test with null settings
      saveSettings('numbers', null as any);
      
      // Test with undefined settings
      saveSettings('numbers', undefined as any);
      
      // Should not crash the application
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Integration Tests', () => {
    it('should maintain data consistency through save/load cycle', () => {
      const originalSettings = createMockSettings({
        questionCount: 12,
        timeLimit: 300,
        difficultyLevel: 'medium'
      });
      
      // Save settings
      saveSettings('numbers', originalSettings);
      
      // Simulate successful localStorage behavior
      (localStorage.getItem as jest.Mock).mockReturnValue(
        JSON.stringify(originalSettings)
      );
      
      // Load settings
      const loadedSettings = getSettings('numbers');
      
      expect(loadedSettings).toEqual(originalSettings);
      expect(loadedSettings).not.toBe(originalSettings); // Different object references
    });

    it('should handle rapid successive operations', () => {
      const operations = Array.from({ length: 10 }, (_, i) => 
        createMockSettings({ questionCount: i + 1 })
      );
      
      const startTime = performance.now();
      
      // Perform multiple save operations rapidly
      operations.forEach((settings, index) => {
        saveSettings(`test-${index}`, settings);
      });
      
      const executionTime = performance.now() - startTime;
      
      expect(localStorage.setItem).toHaveBeenCalledTimes(10);
      expect(executionTime).toBeLessThan(500); // Should complete quickly
    });
  });

  describe('Edge Cases & Error Boundaries', () => {
    it('should handle special characters in game keys', () => {
      const specialKeys = ['test-game', 'game_with_underscores', 'game.with.dots'];
      const settings = createMockSettings();
      
      specialKeys.forEach(key => {
        expect(() => saveSettings(key, settings)).not.toThrow();
        expect(() => getSettings(key)).not.toThrow();
      });
    });

    it('should handle very large settings objects', () => {
      // Create a large settings object
      const largeSettings = createMockSettings({
        ...Array.from({ length: 100 }, (_, i) => ({ [`prop${i}`]: `value${i}` }))
          .reduce((acc, obj) => ({ ...acc, ...obj }), {})
      });
      
      const startTime = performance.now();
      
      saveSettings('large-test', largeSettings);
      
      const executionTime = performance.now() - startTime;
      
      // Should handle large objects without significant performance impact
      expect(executionTime).toBeLessThan(200);
    });

    it('should handle empty and null values appropriately', () => {
      const edgeCases = [
        { key: 'empty-string', settings: createMockSettings({ questionCount: '' }) },
        { key: 'zero-values', settings: createMockSettings({ questionCount: 0 }) },
        { key: 'negative-values', settings: createMockSettings({ questionCount: -1 }) }
      ];
      
      edgeCases.forEach(({ key, settings }) => {
        expect(() => saveSettings(key, settings)).not.toThrow();
        expect(() => getSettings(key)).not.toThrow();
      });
    });
  });

  describe('Performance Validation', () => {
    it('should complete operations within performance budgets', async () => {
      const iterations = 50;
      const maxTimePerOperation = 10; // ms
      
      const times: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        
        const settings = createMockSettings({ questionCount: i });
        saveSettings(`perf-test-${i}`, settings);
        getSettings(`perf-test-${i}`);
        
        const endTime = performance.now();
        times.push(endTime - startTime);
      }
      
      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);
      
      expect(averageTime).toBeLessThan(maxTimePerOperation);
      expect(maxTime).toBeLessThan(maxTimePerOperation * 2); // Allow some variance
    }, TEST_TIMEOUTS.MEDIUM);
  });
}); 