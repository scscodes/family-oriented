import { createTheme } from '@mui/material/styles';
import { Rubik, Varela_Round, Nunito } from 'next/font/google';

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

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#4361ee', // Bright blue
      light: '#738dff',
      dark: '#0036bb',
    },
    secondary: {
      main: '#ff6d00', // Vibrant orange
      light: '#ff9e40',
      dark: '#c43c00',
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
      main: '#9381ff', // Lavender
      light: '#c5b0ff',
      dark: '#6254cc',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#3a3a3a',
      secondary: '#606060',
    },
  },
  typography: {
    fontFamily: varelaRound.style.fontFamily,
    h1: {
      fontFamily: rubik.style.fontFamily,
      fontWeight: 700,
    },
    h2: {
      fontFamily: rubik.style.fontFamily,
      fontWeight: 700,
    },
    h3: {
      fontFamily: rubik.style.fontFamily,
      fontWeight: 500,
    },
    h4: {
      fontFamily: rubik.style.fontFamily,
      fontWeight: 500,
    },
    h5: {
      fontFamily: rubik.style.fontFamily,
      fontWeight: 500,
    },
    h6: {
      fontFamily: rubik.style.fontFamily,
      fontWeight: 500,
    },
    body1: {
      fontFamily: nunito.style.fontFamily, // More readable font for game questions
      fontSize: '1.1rem',
    },
    body2: {
      fontFamily: nunito.style.fontFamily,
      fontSize: '1rem',
    },
    button: {
      fontFamily: varelaRound.style.fontFamily,
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12, // Rounded corners
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          padding: '10px 24px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #4361ee 30%, #738dff 90%)',
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #ff6d00 30%, #ff9e40 90%)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#4361ee',
          '&:hover': {
            backgroundColor: 'rgba(67, 97, 238, 0.1)',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          letterSpacing: '0.02em',
        },
      },
    },
  },
});

export default theme; 