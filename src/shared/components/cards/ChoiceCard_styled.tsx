import { styled, Card, CardActionArea } from '@mui/material';
import { GameType } from '@/utils/gameUtils';
import { borderRadius, transitions, accessibility, shadows } from '@/theme/tokens';

interface StyledChoiceCardProps {
  selected?: boolean;
  correct?: boolean;
  incorrect?: boolean;
  disabled?: boolean;
  gameType?: GameType;
}

/**
 * Enhanced choice card for games with proper state management
 * Consolidates game-specific styling and accessibility features
 */
export const StyledChoiceCard = styled(Card)<StyledChoiceCardProps>(({ 
  theme, 
  selected = false, 
  correct = false, 
  incorrect = false, 
  disabled = false,
  gameType 
}) => {
  const isCorrectState = selected && correct;
  const isIncorrectState = selected && incorrect;
  
  const baseStyles = {
    minHeight: '100px',
    borderRadius: borderRadius.lg,
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: `all ${transitions.duration.normal}`,
    opacity: disabled ? 0.6 : 1,
    pointerEvents: disabled ? 'none' as const : 'auto' as const,
    
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: shadows.cardHover,
    },
    
    '&:focus-visible': {
      outline: `${accessibility.focusRing.width} ${accessibility.focusRing.style} ${accessibility.focusRing.color}`,
      outlineOffset: '2px',
    },
  };

  const stateStyles = selected ? {
    borderColor: isCorrectState 
      ? theme.palette.success.main 
      : isIncorrectState 
        ? theme.palette.error.main 
        : theme.palette.primary.main,
    borderWidth: '2px',
    borderStyle: 'solid' as const,
    boxShadow: isCorrectState
      ? '0 0 0 3px rgba(76, 175, 80, 0.3)'
      : isIncorrectState
        ? '0 0 0 3px rgba(244, 67, 54, 0.3)'
        : '0 4px 12px rgba(0,0,0,0.15)',
  } : {};

  const gameStyles = gameType === 'colors' ? {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 500,
    fontSize: '1.1rem',
  } : gameType === 'shapes' ? {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& .MuiSvgIcon-root': {
      fontSize: 80,
      transition: 'transform 0.3s ease, color 0.3s ease',
      ...(selected && {
        transform: 'scale(1.1)',
        color: isCorrectState 
          ? theme.palette.success.light 
          : isIncorrectState 
            ? theme.palette.error.light 
            : undefined,
      }),
    },
  } : {};

  return {
    ...baseStyles,
    ...stateStyles,
    ...gameStyles,
  };
});

/**
 * Styled card action area with proper focus management
 */
export const StyledChoiceCardAction = styled(CardActionArea)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: accessibility.touchTarget.minSize,
  
  '&:focus-visible': {
    outline: `${accessibility.focusRing.width} ${accessibility.focusRing.style} ${accessibility.focusRing.color}`,
    outlineOffset: '2px',
  },
})); 