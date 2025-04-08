import { SxProps, Theme } from '@mui/material';

/**
 * Base styles for math cards
 */
export const mathCardStyles: SxProps<Theme> = {
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