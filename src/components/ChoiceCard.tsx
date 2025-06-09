"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardActionArea, Typography, SxProps, Theme } from '@mui/material';
import { colorStyles, colorCardStyles } from '@/app/games/colors/styles';
import { shapeStyles, shapeCardStyles } from '@/app/games/shapes/styles';
import { GameType } from '@/utils/gameUtils';
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
          bgcolor: forcedBg ? `${forcedBg} !important` : undefined,
          backgroundColor: forcedBg ? `${forcedBg} !important` : undefined,
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
          bgcolor: forcedBg ? `${forcedBg} !important` : undefined,
          backgroundColor: forcedBg ? `${forcedBg} !important` : undefined,
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
        bgcolor: forcedBg ? `${forcedBg} !important` : undefined,
        backgroundColor: forcedBg ? `${forcedBg} !important` : undefined,
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
    switch (shape.toLowerCase()) {
      case 'circle':
        return <Circle sx={{ fontSize: 100 }} />;
      case 'square':
        return <Square sx={{ fontSize: 100 }} />;
      case 'triangle':
        return <ChangeHistory sx={{ fontSize: 100 }} />;
      case 'rectangle':
        return <Rectangle sx={{ fontSize: 100 }} />;
      case 'star':
        return <Star sx={{ fontSize: 100 }} />;
      case 'heart':
        return <Favorite sx={{ fontSize: 100 }} />;
      case 'diamond':
        return <Diamond sx={{ fontSize: 100 }} />;
      case 'umbrella':
        return <BeachAccess sx={{ fontSize: 100 }} />;
      case 'wrench':
        return <Build sx={{ fontSize: 100 }} />;
      case 'cake':
        return <Cake sx={{ fontSize: 100 }} />;
      case 'call':
        return <Phone sx={{ fontSize: 100 }} />;
      case 'smile':
        return <EmojiEmotions sx={{ fontSize: 100 }} />;
      case 'sun':
        return <WbSunny sx={{ fontSize: 100 }} />;
      case 'moon':
        return <DarkMode sx={{ fontSize: 100 }} />;
      case 'cloud':
        return <Cloud sx={{ fontSize: 100 }} />;
      case 'plus':
        return <Add sx={{ fontSize: 100 }} />;
      case 'minus':
        return <Remove sx={{ fontSize: 100 }} />;
      case 'up':
        return <ArrowUpward sx={{ fontSize: 100 }} />;
      case 'down':
        return <ArrowDownward sx={{ fontSize: 100 }} />;
      case 'left':
        return <ArrowBack sx={{ fontSize: 100 }} />;
      case 'right':
        return <ArrowForward sx={{ fontSize: 100 }} />;
      default:
        return null;
    }
  };

  // Get the content to display based on game type
  const getContent = () => {
    if (gameType === 'shapes' && typeof children === 'string') {
      return getShapeIcon(children);
    } else if (gameType === 'colors') {
      return null; // Hide text for colors game
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