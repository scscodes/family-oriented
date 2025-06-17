import { SxProps, Theme } from '@mui/material';

/**
 * Shape-specific styles for the shapes game
 */
export const shapeStyles: Record<string, SxProps<Theme>> = {
  circle: {
    '& .MuiSvgIcon-root': {
      fontSize: 80,
      color: 'primary.main',
    }
  },
  square: {
    '& .MuiSvgIcon-root': {
      fontSize: 80,
      color: 'secondary.main',
    }
  },
  triangle: {
    '& .MuiSvgIcon-root': {
      fontSize: 80,
      color: 'success.main',
    }
  },
  rectangle: {
    '& .MuiSvgIcon-root': {
      fontSize: 80,
      color: 'warning.main',
    }
  },
  star: {
    '& .MuiSvgIcon-root': {
      fontSize: 80,
      color: 'error.main',
    }
  },
  heart: {
    '& .MuiSvgIcon-root': {
      fontSize: 80,
      color: 'error.main',
    }
  },
  diamond: {
    '& .MuiSvgIcon-root': {
      fontSize: 80,
      color: 'info.main',
    }
  },
  umbrella: {
    '& .MuiSvgIcon-root': {
      fontSize: 80,
      color: 'info.light',
    }
  },
  wrench: {
    '& .MuiSvgIcon-root': {
      fontSize: 80,
      color: 'grey.700',
    }
  },
  cake: {
    '& .MuiSvgIcon-root': {
      fontSize: 80,
      color: 'pink.A400',
    }
  },
  call: {
    '& .MuiSvgIcon-root': {
      fontSize: 80,
      color: 'success.light',
    }
  },
  smile: {
    '& .MuiSvgIcon-root': {
      fontSize: 80,
      color: 'warning.light',
    }
  },
  sun: {
    '& .MuiSvgIcon-root': {
      fontSize: 80,
      color: 'warning.main',
    }
  },
  moon: {
    '& .MuiSvgIcon-root': {
      fontSize: 80,
      color: 'primary.light',
    }
  },
  cloud: {
    '& .MuiSvgIcon-root': {
      fontSize: 80,
      color: 'info.light',
    }
  },
  plus: {
    '& .MuiSvgIcon-root': {
      fontSize: 80,
      color: 'success.main',
    }
  },
  minus: {
    '& .MuiSvgIcon-root': {
      fontSize: 80,
      color: 'error.main',
    }
  },
  up: {
    '& .MuiSvgIcon-root': {
      fontSize: 80,
      color: 'primary.main',
    }
  },
  down: {
    '& .MuiSvgIcon-root': {
      fontSize: 80,
      color: 'secondary.main',
    }
  },
  left: {
    '& .MuiSvgIcon-root': {
      fontSize: 80,
      color: 'warning.main',
    }
  },
  right: {
    '& .MuiSvgIcon-root': {
      fontSize: 80,
      color: 'info.main',
    }
  }
};

/**
 * Base styles for shape cards
 */
export const shapeCardStyles: SxProps<Theme> = {
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