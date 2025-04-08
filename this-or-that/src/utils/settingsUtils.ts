/**
 * Game settings management
 */

/**
 * Default game settings
 */
export interface GameSettings {
  numberRange: {
    min: number;
    max: number;
  };
  questionCount: number;
  optionsCount: number;
}

/**
 * Default settings for each game type
 */
export const DEFAULT_SETTINGS: Record<string, GameSettings> = {
  numbers: {
    numberRange: {
      min: 1,
      max: 50
    },
    questionCount: 10,
    optionsCount: 4
  },
  letters: {
    numberRange: {
      min: 0,
      max: 25 // A-Z
    },
    questionCount: 10,
    optionsCount: 4
  },
  shapes: {
    numberRange: {
      min: 0,
      max: 0 // Not applicable
    },
    questionCount: 10,
    optionsCount: 4
  },
  colors: {
    numberRange: {
      min: 0,
      max: 0 // Not applicable
    },
    questionCount: 10,
    optionsCount: 4
  },
  patterns: {
    numberRange: {
      min: 0,
      max: 0 // Not applicable
    },
    questionCount: 10,
    optionsCount: 4
  },
  math: {
    numberRange: {
      min: 0,
      max: 0 // Not applicable
    },
    questionCount: 10,
    optionsCount: 4
  },
  'fill-in-the-blank': {
    numberRange: {
      min: 0,
      max: 0 // Not applicable
    },
    questionCount: 10,
    optionsCount: 4
  }
};

/**
 * Retrieves settings from localStorage if available, otherwise returns defaults
 */
export function getSettings(gameType: string): GameSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS[gameType] || DEFAULT_SETTINGS.numbers;
  }

  const savedSettings = localStorage.getItem(`${gameType}_settings`);
  
  if (savedSettings) {
    try {
      return JSON.parse(savedSettings);
    } catch (e) {
      console.error('Failed to parse saved settings', e);
    }
  }
  
  return DEFAULT_SETTINGS[gameType] || DEFAULT_SETTINGS.numbers;
}

/**
 * Saves settings to localStorage
 */
export function saveSettings(gameType: string, settings: GameSettings): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${gameType}_settings`, JSON.stringify(settings));
  }
} 