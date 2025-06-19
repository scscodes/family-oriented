"use client";

import { ReactNode, useMemo } from "react";
import { CardContent, Typography, useTheme } from '@mui/material';
import { StyledChoiceCard, StyledChoiceCardAction } from '@/shared/components';
import { GameType } from '@/utils/gameUtils';
import { UI_CONSTANTS } from '@/utils/constants';
import {
  Circle,
  Square,
  ChangeHistory,
  Rectangle,
  Star,
  Favorite,
  Diamond,
  BeachAccess,
  Build,
  Cake,
  Phone,
  EmojiEmotions,
  WbSunny,
  DarkMode,
  Cloud,
  Add,
  Remove,
  ArrowUpward,
  ArrowDownward,
  ArrowBack,
  ArrowForward
} from '@mui/icons-material';

interface ChoiceCardProps {
  onClick: () => void;
  children: ReactNode;
  selected?: boolean;
  correct?: boolean;
  incorrect?: boolean;
  disabled?: boolean;
  gameType?: GameType;
}

/**
 * Enhanced choice card component using styled components and design tokens
 * Consolidated game-specific styling logic with improved accessibility
 */
function ChoiceCard({ 
  onClick, 
  children,
  selected = false,
  correct = false,
  incorrect = false,
  disabled = false,
  gameType,
}: ChoiceCardProps) {
  const theme = useTheme();

  // Get the appropriate icon for shapes using design tokens
  const getShapeIcon = useMemo(function createShapeIconFunction() {
    function getShapeIcon(shape: string) {
      const iconSize = UI_CONSTANTS.SHAPE_ICON_SIZE;
      const iconProps = { sx: { fontSize: iconSize } };
      
      switch (shape.toLowerCase()) {
        case 'circle':
          return <Circle {...iconProps} />;
        case 'square':
          return <Square {...iconProps} />;
        case 'triangle':
          return <ChangeHistory {...iconProps} />;
        case 'rectangle':
          return <Rectangle {...iconProps} />;
        case 'star':
          return <Star {...iconProps} />;
        case 'heart':
          return <Favorite {...iconProps} />;
        case 'diamond':
          return <Diamond {...iconProps} />;
        case 'umbrella':
          return <BeachAccess {...iconProps} />;
        case 'wrench':
          return <Build {...iconProps} />;
        case 'cake':
          return <Cake {...iconProps} />;
        case 'call':
          return <Phone {...iconProps} />;
        case 'smile':
          return <EmojiEmotions {...iconProps} />;
        case 'sun':
          return <WbSunny {...iconProps} />;
        case 'moon':
          return <DarkMode {...iconProps} />;
        case 'cloud':
          return <Cloud {...iconProps} />;
        case 'plus':
          return <Add {...iconProps} />;
        case 'minus':
          return <Remove {...iconProps} />;
        case 'up':
          return <ArrowUpward {...iconProps} />;
        case 'down':
          return <ArrowDownward {...iconProps} />;
        case 'left':
          return <ArrowBack {...iconProps} />;
        case 'right':
          return <ArrowForward {...iconProps} />;
        default:
          return <Square {...iconProps} />;
      }
    }
    
    getShapeIcon.displayName = 'getShapeIcon';
    return getShapeIcon;
  }, []);

  // Get game-specific color styling from theme
  const getColorStyles = (color: string) => {
    const gameColors = theme.palette.games?.colors;
    if (!gameColors) return {};
    
    const colorKey = color.toLowerCase();
    const colorValue = gameColors[colorKey as keyof typeof gameColors];
    
    if (colorValue) {
      return {
        backgroundColor: colorValue,
        color: ['yellow', 'orange', 'pink'].includes(colorKey) ? '#000' : '#fff',
      };
    }
    
    return {};
  };

  // Generate content based on game type and children
  const getContent = () => {
    if (gameType === 'colors' && typeof children === 'string') {
      return (
        <Typography 
          variant="h6" 
          component="span"
          sx={{ 
            fontWeight: 'medium',
            textTransform: 'capitalize',
            ...getColorStyles(children)
          }}
        >
          {children}
        </Typography>
      );
    } else if (gameType === 'shapes' && typeof children === 'string') {
      return getShapeIcon(children);
    } else if (typeof children === 'string') {
      return (
        <Typography 
          variant="h6" 
          component="span"
          sx={{ 
            fontWeight: 'medium',
            textAlign: 'center',
            padding: theme.spacing(1),
          }}
        >
          {children}
        </Typography>
      );
    }
    return children;
  };

  return (
    <StyledChoiceCard
      onClick={!disabled ? onClick : undefined}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`Choice: ${children}`}
      aria-pressed={selected}
      aria-disabled={disabled}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        // Pass styling props through sx instead of component props
        ...(selected && {
          borderColor: correct 
            ? theme.palette.success.main 
            : incorrect 
              ? theme.palette.error.main 
              : theme.palette.primary.main,
          borderWidth: '2px',
          borderStyle: 'solid',
          boxShadow: correct
            ? theme.customShadows.focus
            : incorrect
              ? theme.customShadows.focusError
              : theme.customShadows.cardHover,
        }),
        ...(disabled && {
          opacity: 0.6,
          pointerEvents: 'none',
        }),
        // Game-specific styling
        ...(gameType === 'colors' && {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }),
        ...(gameType === 'shapes' && {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& .MuiSvgIcon-root': {
            fontSize: 80,
            transition: 'transform 0.3s ease, color 0.3s ease',
            ...(selected && {
              transform: 'scale(1.1)',
              color: correct 
                ? theme.palette.success.light 
                : incorrect 
                  ? theme.palette.error.light 
                  : undefined,
            }),
          },
        }),
      }}
    >
      <StyledChoiceCardAction disabled={disabled}>
        <CardContent sx={{ 
          padding: theme.spacing(2),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          '&:last-child': { paddingBottom: theme.spacing(2) },
        }}>
          {getContent()}
        </CardContent>
      </StyledChoiceCardAction>
    </StyledChoiceCard>
  );
}

ChoiceCard.displayName = 'ChoiceCard';
export default ChoiceCard; 