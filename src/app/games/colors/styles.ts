import { SxProps, Theme } from '@mui/material';

/**
 * Color-specific styles for the colors game
 */
export const colorStyles: Record<string, SxProps<Theme>> = {
  red: {
    bgcolor: 'error.main',
    color: 'white',
  },
  blue: {
    bgcolor: 'primary.main',
    color: 'white',
  },
  green: {
    bgcolor: 'success.main',
    color: 'white',
  },
  yellow: {
    bgcolor: '#FFD700', // Bright, friendly yellow
    color: 'black',
  },
  purple: {
    bgcolor: 'secondary.main',
    color: 'white',
  },
  orange: {
    bgcolor: 'orange',
    color: 'black',
  },
  pink: {
    bgcolor: 'pink',
    color: 'black',
  },
  brown: {
    bgcolor: '#8B4513', // Saddle brown - a more distinct, kid-friendly brown
    color: 'white',
  },
  black: {
    bgcolor: 'black',
    color: 'white',
  }
};

/**
 * Base styles for color cards
 */
export const colorCardStyles: SxProps<Theme> = {
  minHeight: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: 3
  }
}; 