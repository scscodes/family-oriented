import { createTheme } from '@mui/material/styles';
import { Rubik, Varela_Round, Nunito } from 'next/font/google';
import { 
  spacing, 
  borderRadius, 
  shadows, 
  typography as designTypography,
  gameColors,
  transitions,
  themeVariants,
  accessibility,
  type ThemeVariant 
} from './tokens';

// Define fonts
export const rubik = Rubik({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const varelaRound = Varela_Round({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export const nunito = Nunito({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

/**
 * Generate heading colors based on theme primary and secondary colors
 * Provides consistent hierarchy: h1 (primary) -> h6 (lightest)
 */
const generateHeadingColors = (primary: string, secondary: string) => {
  return {
    h1: primary,
    h2: `color-mix(in srgb, ${primary} 90%, ${secondary} 10%)`,
    h3: `color-mix(in srgb, ${primary} 80%, ${secondary} 20%)`,
    h4: `color-mix(in srgb, ${primary} 70%, ${secondary} 30%)`,
    h5: `color-mix(in srgb, ${primary} 60%, ${secondary} 40%)`,
    h6: `color-mix(in srgb, ${primary} 50%, ${secondary} 50%)`
  };
};

// Extend MUI theme interface to include our custom properties
declare module '@mui/material/styles' {
  interface Palette {
    games: {
      colors: typeof gameColors.colors;
      shapes: typeof gameColors.shapes;
    };
    headingColors: ReturnType<typeof generateHeadingColors>;
  }

  interface PaletteOptions {
    games?: {
      colors?: typeof gameColors.colors;
      shapes?: typeof gameColors.shapes;
    };
    headingColors?: ReturnType<typeof generateHeadingColors>;
  }

  interface Theme {
    customSpacing: typeof spacing;
    customShadows: typeof shadows;
    themeVariant: ThemeVariant;
  }

  interface ThemeOptions {
    customSpacing?: typeof spacing;
    customShadows?: typeof shadows;
    themeVariant?: ThemeVariant;
  }
}

/**
 * Create enhanced MUI theme with design tokens integration
 * @param variant - Theme variant key (purple, ocean, forest, sunset)
 */
export const createEnhancedTheme = (variant: ThemeVariant = 'purple') => {
  const themeConfig = themeVariants[variant];
  const headingColors = generateHeadingColors(themeConfig.primary, themeConfig.secondary);

  return createTheme({
    palette: {
      primary: {
        main: themeConfig.primary,
        light: `color-mix(in srgb, ${themeConfig.primary} 80%, white 20%)`,
        dark: `color-mix(in srgb, ${themeConfig.primary} 80%, black 20%)`,
      },
      secondary: {
        main: themeConfig.secondary,
        light: `color-mix(in srgb, ${themeConfig.secondary} 80%, white 20%)`,
        dark: `color-mix(in srgb, ${themeConfig.secondary} 80%, black 20%)`,
      },
      success: {
        main: '#2ec4b6', // Teal
        light: '#64f7e7',
        dark: '#009387',
      },
      error: {
        main: '#ff5a5f', // Coral red
        light: '#ff8c8f',
        dark: '#c62333',
      },
      warning: {
        main: '#ffbe0b', // Sunny yellow
        light: '#fff04d',
        dark: '#c78f00',
      },
      info: {
        main: themeConfig.accent,
        light: `color-mix(in srgb, ${themeConfig.accent} 80%, white 20%)`,
        dark: `color-mix(in srgb, ${themeConfig.accent} 80%, black 20%)`,
      },
      background: {
        default: '#f8f9fa',
        paper: '#ffffff',
      },
      text: {
        primary: '#3a3a3a',
        secondary: '#606060',
      },
      // Custom game color palettes
      games: {
        colors: gameColors.colors,
        shapes: gameColors.shapes,
      },
      // Heading color hierarchy
      headingColors,
    },
    typography: {
      fontFamily: varelaRound.style.fontFamily,
      h1: {
        fontFamily: rubik.style.fontFamily,
        fontWeight: designTypography.fontWeight.bold,
        fontSize: designTypography.fontSize['4xl'],
        lineHeight: designTypography.lineHeight.tight,
        letterSpacing: designTypography.letterSpacing.tight,
      },
      h2: {
        fontFamily: rubik.style.fontFamily,
        fontWeight: designTypography.fontWeight.bold,
        fontSize: designTypography.fontSize['3xl'],
        lineHeight: designTypography.lineHeight.tight,
      },
      h3: {
        fontFamily: rubik.style.fontFamily,
        fontWeight: designTypography.fontWeight.semibold,
        fontSize: designTypography.fontSize['2xl'],
        lineHeight: designTypography.lineHeight.normal,
      },
      h4: {
        fontFamily: rubik.style.fontFamily,
        fontWeight: designTypography.fontWeight.semibold,
        fontSize: designTypography.fontSize.xl,
        lineHeight: designTypography.lineHeight.normal,
      },
      h5: {
        fontFamily: rubik.style.fontFamily,
        fontWeight: designTypography.fontWeight.medium,
        fontSize: designTypography.fontSize.lg,
        lineHeight: designTypography.lineHeight.normal,
      },
      h6: {
        fontFamily: rubik.style.fontFamily,
        fontWeight: designTypography.fontWeight.medium,
        fontSize: designTypography.fontSize.base,
        lineHeight: designTypography.lineHeight.normal,
      },
      body1: {
        fontFamily: nunito.style.fontFamily,
        fontSize: designTypography.fontSize.lg,
        lineHeight: designTypography.lineHeight.relaxed,
      },
      body2: {
        fontFamily: nunito.style.fontFamily,
        fontSize: designTypography.fontSize.base,
        lineHeight: designTypography.lineHeight.normal,
      },
      button: {
        fontFamily: varelaRound.style.fontFamily,
        fontWeight: designTypography.fontWeight.medium,
        textTransform: 'none',
        fontSize: designTypography.fontSize.base,
      },
    },
    shape: {
      borderRadius: borderRadius.md,
    },
    spacing: (factor: number) => `${spacing.xs * factor}px`,
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.lg,
            boxShadow: shadows.card,
            transition: `transform ${transitions.duration.slow}, box-shadow ${transitions.duration.slow}`,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: shadows.cardHover,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.xl,
            padding: `${spacing.sm}px ${spacing.lg}px`,
            boxShadow: shadows.button,
            minHeight: accessibility.touchTarget.minSize,
            transition: `all ${transitions.duration.normal}`,
            '&:hover': {
              boxShadow: shadows.buttonHover,
            },
            '&:focus-visible': {
              outline: `${accessibility.focusRing.width} ${accessibility.focusRing.style} ${accessibility.focusRing.color}`,
              outlineOffset: '2px',
            },
          },
          containedPrimary: {
            background: `linear-gradient(45deg, ${themeConfig.primary} 30%, ${themeConfig.accent} 90%)`,
          },
          containedSecondary: {
            background: `linear-gradient(45deg, ${themeConfig.secondary} 30%, ${themeConfig.accent} 90%)`,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: themeConfig.primary,
            minHeight: accessibility.touchTarget.minSize,
            minWidth: accessibility.touchTarget.minSize,
            '&:hover': {
              backgroundColor: `${themeConfig.primary}10`,
            },
            '&:focus-visible': {
              outline: `${accessibility.focusRing.width} ${accessibility.focusRing.style} ${accessibility.focusRing.color}`,
              outlineOffset: '2px',
            },
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            letterSpacing: designTypography.letterSpacing.wide,
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.lg,
            boxShadow: shadows.card,
            '&:before': {
              display: 'none',
            },
            '&.Mui-expanded': {
              margin: 0,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.xl,
            height: accessibility.touchTarget.minSize,
            '&:focus-visible': {
              outline: `${accessibility.focusRing.width} ${accessibility.focusRing.style} ${accessibility.focusRing.color}`,
              outlineOffset: '2px',
            },
          },
        },
      },
    },
    // Custom properties for design tokens
    customSpacing: spacing,
    customShadows: shadows,
    themeVariant: variant,
  });
};

// Default theme instance (purple variant)
const theme = createEnhancedTheme('purple');

export default theme;
export { type ThemeVariant, themeVariants, generateHeadingColors }; 