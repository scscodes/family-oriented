"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardActionArea, Typography, SxProps, Theme } from '@mui/material';
import { colorStyles, colorCardStyles } from '@/app/games/colors/styles';
import { shapeStyles, shapeCardStyles } from '@/app/games/shapes/styles';
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
  sx?: SxProps<Theme>;
}

/**
 * A reusable card component for displaying game choices
 * @param {ChoiceCardProps} props - The component props
 * @param {() => void} props.onClick - Function to call when the card is clicked
 * @param {ReactNode} props.children - The content to display in the card
 * @param {boolean} [props.selected] - Whether this card is currently selected
 * @param {boolean} [props.correct] - Whether this card is the correct answer
 * @param {boolean} [props.incorrect] - Whether this card is the incorrect answer
 * @param {boolean} [props.disabled] - Whether this card is disabled (incorrect answer)
 * @param {GameType} [props.gameType] - The type of game being played
 * @param {SxProps<Theme>} [props.sx] - Additional styles to apply to the card
 */
export default function ChoiceCard({ 
  onClick, 
  children,
  selected = false,
  correct = false,
  incorrect = false,
  disabled = false,
  gameType,
  sx
}: ChoiceCardProps) {
  // Compute correct/incorrect state at the top level for use in all style logic
  const isCorrectState = correct;
  const isIncorrectState = !correct && incorrect;
  const forcedBg = isCorrectState ? 'success.light' : isIncorrectState ? 'error.light' : undefined;

  // Get the appropriate styles based on game type
  const getGameSpecificStyles = (): SxProps<Theme> => {
    const baseStyles: SxProps<Theme> = {
      width: '100%',
      minWidth: 0,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      border: '4px solid',
      borderColor: 'transparent',
      boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #4361ee, #9381ff)',
        opacity: 0,
        transition: 'opacity 0.3s ease',
      },
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)',
        '&::before': {
          opacity: 1,
        }
      },
      ...(disabled && {
        opacity: 0.5,
        pointerEvents: 'none',
        transform: 'none',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
        '&:hover': {
          transform: 'none',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
          '&::before': {
            opacity: 0,
          }
        }
      })
    };

    if (gameType === 'colors' && typeof children === 'string') {
      const color = children.toLowerCase();
      return {
        ...baseStyles,
        ...colorCardStyles,
        ...(colorStyles[color] || {}),
        ...(selected ? {
          backgroundColor: forcedBg || undefined,
          borderColor: isCorrectState ? 'success.main' : isIncorrectState ? 'error.main' : undefined,
          boxShadow: isCorrectState
            ? '0 0 20px rgba(46, 196, 182, 0.4)'
            : isIncorrectState
            ? '0 0 20px rgba(255, 90, 95, 0.4)'
            : undefined,
        } : {})
      } as SxProps<Theme>;
    } else if (gameType === 'shapes' && typeof children === 'string') {
      const shape = children.toLowerCase();
      return {
        ...baseStyles,
        ...shapeCardStyles,
        ...(shapeStyles[shape] || {}),
        ...(selected ? {
          '& .MuiSvgIcon-root': {
            color: isCorrectState ? 'success.light' : isIncorrectState ? 'error.light' : undefined,
            transform: 'scale(1.1)',
            transition: 'transform 0.3s ease, color 0.3s ease',
          },
          backgroundColor: forcedBg || undefined,
          borderColor: isCorrectState ? 'success.main' : isIncorrectState ? 'error.main' : undefined,
          boxShadow: isCorrectState
            ? '0 0 20px rgba(46, 196, 182, 0.4)'
            : isIncorrectState
            ? '0 0 20px rgba(255, 90, 95, 0.4)'
            : undefined,
        } : {})
      } as SxProps<Theme>;
    }
    return {
      ...baseStyles,
      ...(selected ? {
        backgroundColor: forcedBg || undefined,
        borderColor: isCorrectState ? 'success.main' : isIncorrectState ? 'error.main' : undefined,
        boxShadow: isCorrectState
          ? '0 0 20px rgba(46, 196, 182, 0.4)'
          : isIncorrectState
          ? '0 0 20px rgba(255, 90, 95, 0.4)'
          : undefined,
      } : {})
    } as SxProps<Theme>;
  };

  // Get the appropriate icon for shapes
  const getShapeIcon = (shape: string) => {
    const iconSize = UI_CONSTANTS.SHAPE_ICON_SIZE; // Use constant instead of magic number
    switch (shape.toLowerCase()) {
      case 'circle':
        return <Circle sx={{ fontSize: iconSize }} />;
      case 'square':
        return <Square sx={{ fontSize: iconSize }} />;
      case 'triangle':
        return <ChangeHistory sx={{ fontSize: iconSize }} />;
      case 'rectangle':
        return <Rectangle sx={{ fontSize: iconSize }} />;
      case 'star':
        return <Star sx={{ fontSize: iconSize }} />;
      case 'heart':
        return <Favorite sx={{ fontSize: iconSize }} />;
      case 'diamond':
        return <Diamond sx={{ fontSize: iconSize }} />;
      case 'umbrella':
        return <BeachAccess sx={{ fontSize: iconSize }} />;
      case 'wrench':
        return <Build sx={{ fontSize: iconSize }} />;
      case 'cake':
        return <Cake sx={{ fontSize: iconSize }} />;
      case 'call':
        return <Phone sx={{ fontSize: iconSize }} />;
      case 'smile':
        return <EmojiEmotions sx={{ fontSize: iconSize }} />;
      case 'sun':
        return <WbSunny sx={{ fontSize: iconSize }} />;
      case 'moon':
        return <DarkMode sx={{ fontSize: iconSize }} />;
      case 'cloud':
        return <Cloud sx={{ fontSize: iconSize }} />;
      case 'plus':
        return <Add sx={{ fontSize: iconSize }} />;
      case 'minus':
        return <Remove sx={{ fontSize: iconSize }} />;
      case 'up':
        return <ArrowUpward sx={{ fontSize: iconSize }} />;
      case 'down':
        return <ArrowDownward sx={{ fontSize: iconSize }} />;
      case 'left':
        return <ArrowBack sx={{ fontSize: iconSize }} />;
      case 'right':
        return <ArrowForward sx={{ fontSize: iconSize }} />;
      default:
        return null;
    }
  };

  // Get the content to display based on game type
  const getContent = () => {
    if (gameType === 'shapes' && typeof children === 'string') {
      const shapeIcon = getShapeIcon(children);
      return shapeIcon ? (
        <span aria-label={`${children} shape`}>
          {shapeIcon}
        </span>
      ) : (
        <Typography variant="h3" component="span" aria-label={`${children} shape`}>
          {children}
        </Typography>
      );
    } else if (gameType === 'colors') {
      // For colors game, provide screen reader text while hiding visual text
      return (
        <span aria-label={`${children} color`} role="img">
          <span aria-hidden="true" style={{ opacity: 0 }}>{children}</span>
        </span>
      );
    }
    return children;
  };

  return (
    <Card sx={{ ...getGameSpecificStyles(), ...sx } as SxProps<Theme>}>
      <CardActionArea 
        onClick={onClick} 
        disabled={disabled}
        sx={{ 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'inherit',
        }}
      >
        <CardContent sx={{ 
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 0
        }}>
          <Typography 
            variant="h3" 
            component="div" 
            align="center"
            sx={{ 
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: { xs: '1.75rem', sm: '2.5rem' },
              fontWeight: 600,
              letterSpacing: '0.02em',
              textShadow: '0px 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            {getContent()}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
} 