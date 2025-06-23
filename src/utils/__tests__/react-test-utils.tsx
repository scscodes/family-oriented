/**
 * React Test Utilities
 * React-specific testing utilities and custom render functions
 */

import { render, RenderOptions, RenderResult } from '@testing-library/react';
import React, { ReactElement, ReactNode } from 'react';
import { UserProvider } from '@/context/UserContext';
import { SettingsProvider } from '@/context/SettingsContext';
import ThemeProvider from '@/theme/ThemeProvider';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  includeProviders?: boolean;
  userContextValue?: Record<string, unknown>;
  settingsContextValue?: Record<string, unknown>;
}

/**
 * Custom render function with providers for component testing
 */
export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult => {
  const {
    includeProviders = true,
    userContextValue,
    settingsContextValue,
    ...renderOptions
  } = options;

  function Wrapper({ children }: { children: ReactNode }) {
    if (!includeProviders) {
      return <>{children}</>;
    }

    return (
      <ThemeProvider>
        <UserProvider value={userContextValue}>
          <SettingsProvider value={settingsContextValue}>
            {children}
          </SettingsProvider>
        </UserProvider>
      </ThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}; 