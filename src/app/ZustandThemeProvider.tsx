'use client';

import React, { useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { createEnhancedTheme } from '@/theme/theme';
import { rubik, varelaRound, nunito } from '@/theme/theme';
import { useAppStore } from '@/stores/appStore';
import { useShallow } from 'zustand/react/shallow';
import HydrationGatedUI from "@/shared/components/HydrationGatedUI";

interface ZustandThemeProviderProps {
  children: React.ReactNode;
}

export function ZustandThemeProvider({ children }: ZustandThemeProviderProps) {
  const { currentTheme, isHydrated } = useAppStore(
    useShallow((state) => ({
      currentTheme: state.currentTheme,
      isHydrated: state.isHydrated,
    }))
  );

  // Create MUI theme based on current theme
  const muiTheme = useMemo(() => {
    return createEnhancedTheme(currentTheme as any);
  }, [currentTheme]);

  // Add global styles
  useEffect(() => {
    // Apply CSS variables for fonts
    const root = document.documentElement;
    root.style.setProperty('--rubik-font', rubik.style.fontFamily);
    root.style.setProperty('--varela-round-font', varelaRound.style.fontFamily);
    root.style.setProperty('--nunito-font', nunito.style.fontFamily);
  }, []);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <style jsx global>{`
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
      <HydrationGatedUI />
      {children}
    </MuiThemeProvider>
  );
} 