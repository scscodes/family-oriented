'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { createEnhancedTheme, type ThemeVariant, themeVariants } from './theme';
import { rubik, varelaRound, nunito } from './theme';

interface EnhancedThemeContextType {
  currentTheme: ThemeVariant;
  setTheme: (theme: ThemeVariant) => void;
  themeConfig: typeof themeVariants[ThemeVariant];
  availableThemes: typeof themeVariants;
  isHydrated: boolean;
}

const EnhancedThemeContext = createContext<EnhancedThemeContextType | undefined>(undefined);

interface EnhancedThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Enhanced theme provider that consolidates MUI theme with dynamic theme switching
 * Replaces the parallel theme system with a unified approach
 */
export function EnhancedThemeProvider({ children }: EnhancedThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeVariant>('purple');
  const [muiTheme, setMuiTheme] = useState(() => createEnhancedTheme('purple'));
  const [isHydrated, setIsHydrated] = useState(false);

  // Load theme from localStorage after hydration
  useEffect(() => {
    setIsHydrated(true);
    const savedTheme = localStorage.getItem('selectedTheme') as ThemeVariant;
    if (savedTheme && themeVariants[savedTheme]) {
      setCurrentTheme(savedTheme);
      setMuiTheme(createEnhancedTheme(savedTheme));
    }
  }, []);

  // Save theme to localStorage and update MUI theme when changed
  const setTheme = (theme: ThemeVariant) => {
    setCurrentTheme(theme);
    setMuiTheme(createEnhancedTheme(theme));
    if (isHydrated) {
      localStorage.setItem('selectedTheme', theme);
    }
  };

  const contextValue: EnhancedThemeContextType = {
    currentTheme,
    setTheme,
    themeConfig: themeVariants[currentTheme],
    availableThemes: themeVariants,
    isHydrated,
  };

  return (
    <EnhancedThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        <style jsx global>{`
          :root {
            --rubik-font: ${rubik.style.fontFamily};
            --varela-round-font: ${varelaRound.style.fontFamily};
            --nunito-font: ${nunito.style.fontFamily};
          }
          
          body {
            background: linear-gradient(to bottom right, #f8f9fa, #eef1f8);
            min-height: 100vh;
          }

          /* Accessibility improvements */
          *:focus-visible {
            outline: 2px solid rgba(46, 196, 182, 0.6);
            outline-offset: 2px;
          }

          /* Ensure proper touch targets on mobile */
          @media (max-width: 768px) {
            button, .MuiIconButton-root, .MuiChip-root {
              min-height: 44px;
              min-width: 44px;
            }
          }
        `}</style>
        {children}
      </MuiThemeProvider>
    </EnhancedThemeContext.Provider>
  );
}

/**
 * Hook to access the enhanced theme context
 * Provides theme switching and configuration access
 */
export function useEnhancedTheme() {
  const context = useContext(EnhancedThemeContext);
  if (context === undefined) {
    throw new Error('useEnhancedTheme must be used within an EnhancedThemeProvider');
  }
  return context;
}

/**
 * Hook to access heading colors from the current theme
 * Provides easy access to the heading color hierarchy
 */
export function useHeadingColors() {
  const context = useContext(EnhancedThemeContext);
  if (context === undefined) {
    throw new Error('useHeadingColors must be used within an EnhancedThemeProvider');
  }
  
  // Access heading colors from MUI theme palette
  return context.themeConfig;
} 