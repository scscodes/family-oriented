/**
 * React Test Utilities
 * React-specific testing utilities and custom render functions
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { ZustandProvider } from '@/stores/ZustandProvider';
import { ZustandThemeProvider } from '@/app/ZustandThemeProvider';
import { createEnhancedTheme } from '@/theme/theme';
import { mockFactories } from './test-factories';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Can add custom options here if needed in the future
}

// Enhanced render function with all providers
export function renderWithProviders(
  ui: React.ReactElement,
  options?: CustomRenderOptions
) {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <ZustandProvider>
        <ZustandThemeProvider>
          {children}
        </ZustandThemeProvider>
      </ZustandProvider>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Simpler render with just MUI theme
export function renderWithTheme(
  ui: React.ReactElement,
  theme = createEnhancedTheme('purple')
) {
  return render(
    <ThemeProvider theme={theme}>{ui}</ThemeProvider>
  );
}

// Export everything from React Testing Library
export * from '@testing-library/react'; 