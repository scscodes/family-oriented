'use client';

import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import theme, { rubik, varelaRound, nunito } from './theme';
import { ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <MuiThemeProvider theme={theme}>
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
      `}</style>
      {children}
    </MuiThemeProvider>
  );
} 