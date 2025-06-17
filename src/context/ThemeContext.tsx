"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Mix two hex colors with a given ratio
 * @param color1 - First hex color (e.g., '#ff0000')
 * @param color2 - Second hex color (e.g., '#0000ff')
 * @param ratio - Mixing ratio (0.0 to 1.0, where 0.0 = color1, 1.0 = color2)
 */
const mixColors = (color1: string, color2: string, ratio: number): string => {
  // Remove # from hex colors
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  // Parse RGB values
  const r1 = parseInt(hex1.slice(0, 2), 16);
  const g1 = parseInt(hex1.slice(2, 4), 16);
  const b1 = parseInt(hex1.slice(4, 6), 16);
  
  const r2 = parseInt(hex2.slice(0, 2), 16);
  const g2 = parseInt(hex2.slice(2, 4), 16);
  const b2 = parseInt(hex2.slice(4, 6), 16);
  
  // Mix colors
  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * Generate heading colors based on theme primary and secondary colors
 * Provides consistent hierarchy: h1 (primary) -> h6 (lightest)
 */
const generateHeadingColors = (primary: string, secondary: string) => {
  return {
    h1: primary,
    h2: mixColors(primary, secondary, 0.1), // 90% primary, 10% secondary
    h3: mixColors(primary, secondary, 0.2), // 80% primary, 20% secondary
    h4: mixColors(primary, secondary, 0.3), // 70% primary, 30% secondary
    h5: mixColors(primary, secondary, 0.4), // 60% primary, 40% secondary
    h6: mixColors(primary, secondary, 0.5)  // 50% primary, 50% secondary
  };
};

// Theme definitions with different color palettes
export const THEMES = {
  purple: {
    name: 'Purple Dreams',
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#9c88ff',
    progressiveColors: ['#667eea', '#7c5cee', '#9249f1', '#a835f5'],
    headingColors: generateHeadingColors('#667eea', '#764ba2'),
    subjects: {
      'Language Arts': { color: '#667eea', icon: '📚' },
      'Mathematics': { color: '#7c5cee', icon: '🔢' },
      'Social Studies': { color: '#9249f1', icon: '🌍' },
      'Visual Arts': { color: '#a835f5', icon: '🎨' }
    }
  },
  ocean: {
    name: 'Ocean Breeze',
    primary: '#00b4db',
    secondary: '#0083b0',
    accent: '#4dd0e1',
    progressiveColors: ['#00b4db', '#1ea8d1', '#3d9bc7', '#5c8fbd'],
    headingColors: generateHeadingColors('#00b4db', '#0083b0'),
    subjects: {
      'Language Arts': { color: '#00b4db', icon: '📚' },
      'Mathematics': { color: '#1ea8d1', icon: '🔢' },
      'Social Studies': { color: '#3d9bc7', icon: '🌍' },
      'Visual Arts': { color: '#5c8fbd', icon: '🎨' }
    }
  },
  forest: {
    name: 'Forest Green',
    primary: '#56ab2f',
    secondary: '#a8e6cf',
    accent: '#88d8a3',
    progressiveColors: ['#56ab2f', '#6bb33a', '#80bc45', '#95c450'],
    headingColors: generateHeadingColors('#56ab2f', '#a8e6cf'),
    subjects: {
      'Language Arts': { color: '#56ab2f', icon: '📚' },
      'Mathematics': { color: '#6bb33a', icon: '🔢' },
      'Social Studies': { color: '#80bc45', icon: '🌍' },
      'Visual Arts': { color: '#95c450', icon: '🎨' }
    }
  },
  sunset: {
    name: 'Sunset Glow',
    primary: '#ff7e5f',
    secondary: '#feb47b',
    accent: '#ff9a9e',
    progressiveColors: ['#ff7e5f', '#ff8965', '#ff946b', '#ff9f71'],
    headingColors: generateHeadingColors('#ff7e5f', '#feb47b'),
    subjects: {
      'Language Arts': { color: '#ff7e5f', icon: '📚' },
      'Mathematics': { color: '#ff8965', icon: '🔢' },
      'Social Studies': { color: '#ff946b', icon: '🌍' },
      'Visual Arts': { color: '#ff9f71', icon: '🎨' }
    }
  }
};

export type ThemeKey = keyof typeof THEMES;
export type Theme = typeof THEMES[ThemeKey];

interface ThemeContextType {
  currentTheme: ThemeKey;
  theme: Theme;
  setTheme: (theme: ThemeKey) => void;
  subjects: Theme['subjects'];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>('purple');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme') as ThemeKey;
    if (savedTheme && THEMES[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage when changed
  const setTheme = (theme: ThemeKey) => {
    setCurrentTheme(theme);
    localStorage.setItem('selectedTheme', theme);
  };

  const theme = THEMES[currentTheme];

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      theme,
      setTheme,
      subjects: theme.subjects
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 