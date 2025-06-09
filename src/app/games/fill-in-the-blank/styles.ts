import { SxProps, Theme } from '@mui/material';

/**
 * Base styles for fill-in-the-blank cards
 */
export const fillInTheBlankCardStyles: SxProps<Theme> = {
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