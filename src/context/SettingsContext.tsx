'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { logger } from '@/utils/logger';

// Define the structure for our global settings
export interface GlobalSettings {
  // General settings
  questionsPerSession: number;
  
  // Numbers game settings
  numberRange: {
    min: number;
    max: number;
  };
  
  // Fill in the blank settings
  wordComplexity: 'easy' | 'medium' | 'hard';
  
  // Math settings
  mathOperations: {
    addition: boolean;
    subtraction: boolean;
  };
  mathRange: {
    min: number;
    max: number;
  };
  showVisualAids: boolean;
}

// Default settings
const defaultSettings: GlobalSettings = {
  questionsPerSession: 10,
  numberRange: {
    min: 1,
    max: 20,
  },
  wordComplexity: 'easy',
  mathOperations: {
    addition: true,
    subtraction: true,
  },
  mathRange: {
    min: 1,
    max: 10,
  },
  showVisualAids: true,
};

// Create the context
type SettingsContextType = {
  settings: GlobalSettings;
  updateSettings: (newSettings: Partial<GlobalSettings>) => void;
  updateNumberRange: (min: number, max: number) => void;
  updateMathRange: (min: number, max: number) => void;
  resetSettings: () => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider component
export function SettingsProvider({ children }: { children: ReactNode }) {
  // Initialize state with default settings or from localStorage
  const [settings, setSettings] = useState<GlobalSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem('globalGameSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          
          // Ensure all required properties exist by merging with defaults
          return {
            ...defaultSettings,
            ...parsedSettings,
            // Ensure nested objects are properly merged
            numberRange: {
              ...defaultSettings.numberRange,
              ...(parsedSettings.numberRange || {})
            },
            mathOperations: {
              ...defaultSettings.mathOperations,
              ...(parsedSettings.mathOperations || {})
            },
            mathRange: {
              ...defaultSettings.mathRange,
              ...(parsedSettings.mathRange || {})
            }
          };
        }
      } catch (error) {
        logger.error('Error loading settings from localStorage:', error);
        // If there's an error, return defaults
      }
    }
    return defaultSettings;
  });

  // Save settings to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('globalGameSettings', JSON.stringify(settings));
      } catch (error) {
        logger.error('Error saving settings to localStorage:', error);
      }
    }
  }, [settings]);

  // Update specific settings
  const updateSettings = (newSettings: Partial<GlobalSettings>) => {
    setSettings(prev => {
      // Handle nested objects carefully
      const updated = { ...prev, ...newSettings };
      
      // Ensure numberRange is properly updated if provided
      if (newSettings.numberRange) {
        updated.numberRange = {
          ...prev.numberRange,
          ...newSettings.numberRange
        };
      }
      
      // Ensure mathRange is properly updated if provided
      if (newSettings.mathRange) {
        updated.mathRange = {
          ...prev.mathRange,
          ...newSettings.mathRange
        };
      }
      
      // Ensure mathOperations is properly updated if provided
      if (newSettings.mathOperations) {
        updated.mathOperations = {
          ...prev.mathOperations,
          ...newSettings.mathOperations
        };
      }
      
      return updated;
    });
  };

  // Helper for updating number range
  const updateNumberRange = (min: number, max: number) => {
    setSettings(prev => ({
      ...prev,
      numberRange: { min, max },
    }));
  };

  // Helper for updating math range
  const updateMathRange = (min: number, max: number) => {
    setSettings(prev => ({
      ...prev,
      mathRange: { min, max },
    }));
  };

  // Reset to defaults
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateNumberRange,
        updateMathRange,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// Custom hook for using the settings context
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 