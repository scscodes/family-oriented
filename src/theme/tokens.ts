/**
 * Design Tokens System
 * Centralized design values for consistent styling across the application
 * Following Material-UI theme structure and WCAG accessibility standards
 */

import { SxProps, Theme } from '@mui/material';

/**
 * Spacing scale following 4px base unit for consistency
 * Used for margins, padding, and layout spacing
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

/**
 * Border radius tokens for consistent rounded corners
 */
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

/**
 * Shadow tokens for consistent elevation and depth
 * Designed for cards, modals, and interactive elements
 */
export const shadows = {
  card: '0 4px 14px rgba(0, 0, 0, 0.1)',
  cardHover: '0 8px 20px rgba(0, 0, 0, 0.15)',
  cardActive: '0 2px 8px rgba(0, 0, 0, 0.15)',
  focus: '0 0 20px rgba(46, 196, 182, 0.4)',
  focusError: '0 0 20px rgba(255, 90, 95, 0.4)',
  button: '0 4px 10px rgba(0, 0, 0, 0.1)',
  buttonHover: '0 6px 12px rgba(0, 0, 0, 0.2)',
  modal: '0 24px 48px rgba(0, 0, 0, 0.3)',
} as const;

/**
 * Typography scale with semantic naming
 * Follows accessibility guidelines for heading hierarchy
 */
export const typography = {
  fontFamily: {
    primary: 'var(--rubik-font)',
    secondary: 'var(--varela-round-font)',
    accent: 'var(--nunito-font)',
  },
  fontSize: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
  },
} as const;

/**
 * Color system for game-specific styling
 * Centralized color values to replace hard-coded colors
 */
export const gameColors = {
  colors: {
    red: '#f44336',      // MUI error.main
    blue: '#2196f3',     // MUI primary.main  
    green: '#4caf50',    // MUI success.main
    yellow: '#FFD700',   // Bright, kid-friendly yellow
    purple: '#9c27b0',   // MUI secondary.main
    orange: '#ff9800',   // MUI warning.main
    pink: '#e91e63',     // MUI pink
    brown: '#8B4513',    // Saddle brown
    black: '#000000',
    white: '#ffffff',
  },
  shapes: {
    primary: '#2196f3',    // Blue
    secondary: '#9c27b0',  // Purple
    success: '#4caf50',    // Green
    warning: '#ff9800',    // Orange
    error: '#f44336',      // Red
    info: '#00bcd4',       // Cyan
  },
} as const;

/**
 * Animation and transition tokens
 * Consistent timing and easing for smooth interactions
 */
export const transitions = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

/**
 * Z-index scale for proper layering
 */
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  modal: 1300,
  tooltip: 1500,
} as const;

/**
 * Breakpoint values for responsive design
 * Following mobile-first approach
 */
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

/**
 * Layout tokens for consistent spacing and sizing
 */
export const layout = {
  maxWidth: {
    xs: '20rem',   // 320px
    sm: '24rem',   // 384px
    md: '28rem',   // 448px
    lg: '32rem',   // 512px
    xl: '36rem',   // 576px
    '2xl': '42rem', // 672px
    '3xl': '48rem', // 768px
    '4xl': '56rem', // 896px
    '5xl': '64rem', // 1024px
    '6xl': '72rem', // 1152px
    '7xl': '80rem', // 1280px
    full: '100%',
  },
  minHeight: {
    screen: '100vh',
    full: '100%',
  },
} as const;

/**
 * Accessibility tokens for WCAG compliance
 */
export const accessibility = {
  focusRing: {
    width: '2px',
    style: 'solid',
    color: 'rgba(46, 196, 182, 0.6)',
  },
  touchTarget: {
    minSize: '44px', // WCAG minimum touch target size
  },
  contrast: {
    // Minimum contrast ratios for WCAG AA compliance
    normal: 4.5,
    large: 3,
  },
} as const;

/**
 * Common style mixins for reusable patterns
 */
export const mixins = {
  // Card styles with consistent elevation
  card: {
    borderRadius: borderRadius.lg,
    boxShadow: shadows.card,
    transition: `transform ${transitions.duration.normal}, box-shadow ${transitions.duration.normal}`,
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: shadows.cardHover,
    },
  } as SxProps<Theme>,

  // Button styles with accessibility focus
  button: {
    borderRadius: borderRadius.xl,
    padding: `${spacing.sm}px ${spacing.lg}px`,
    fontWeight: typography.fontWeight.medium,
    transition: `all ${transitions.duration.normal}`,
    minHeight: accessibility.touchTarget.minSize,
    '&:focus-visible': {
      outline: `${accessibility.focusRing.width} ${accessibility.focusRing.style} ${accessibility.focusRing.color}`,
      outlineOffset: '2px',
    },
  } as SxProps<Theme>,

  // Game choice card with interaction states
  choiceCard: {
    minHeight: '100px',
    borderRadius: borderRadius.lg,
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: `all ${transitions.duration.normal}`,
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: shadows.cardHover,
    },
    '&:focus-visible': {
      outline: `${accessibility.focusRing.width} ${accessibility.focusRing.style} ${accessibility.focusRing.color}`,
      outlineOffset: '2px',
    },
  } as SxProps<Theme>,

  // Page container with responsive padding
  pageContainer: {
    maxWidth: layout.maxWidth['7xl'],
    mx: 'auto',
    px: { xs: spacing.md, sm: spacing.lg, lg: spacing.xl },
    py: spacing.lg,
  } as SxProps<Theme>,

  // Game layout with consistent spacing
  gameLayout: {
    maxWidth: layout.maxWidth['5xl'],
    mx: 'auto',
    px: { xs: spacing.md, sm: spacing.lg },
    py: spacing.lg,
  } as SxProps<Theme>,

  // Responsive grid for game options
  responsiveGrid: {
    display: 'grid',
    gap: spacing.md,
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, 1fr)',
      md: 'repeat(auto-fit, minmax(200px, 1fr))',
    },
  } as SxProps<Theme>,

  // Accessible focus styles
  focusVisible: {
    '&:focus-visible': {
      outline: `${accessibility.focusRing.width} ${accessibility.focusRing.style} ${accessibility.focusRing.color}`,
      outlineOffset: '2px',
    },
  } as SxProps<Theme>,
} as const;

/**
 * Theme variant colors that will be integrated into MUI theme
 * Replaces the current parallel theme system
 */
export const themeVariants = {
  purple: {
    name: 'Purple Dreams',
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#9c88ff',
  },
  ocean: {
    name: 'Ocean Breeze',
    primary: '#00b4db',
    secondary: '#0083b0',
    accent: '#4dd0e1',
  },
  forest: {
    name: 'Forest Green',
    primary: '#56ab2f',
    secondary: '#a8e6cf',
    accent: '#88d8a3',
  },
  sunset: {
    name: 'Sunset Glow',
    primary: '#ff7e5f',
    secondary: '#feb47b',
    accent: '#ff9a9e',
  },
} as const;

/**
 * Type definitions for design tokens
 */
export type ThemeVariant = keyof typeof themeVariants;
export type SpacingKey = keyof typeof spacing;
export type ShadowKey = keyof typeof shadows;
export type BorderRadiusKey = keyof typeof borderRadius; 