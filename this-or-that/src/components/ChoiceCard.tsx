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
  isSelected?: boolean;
  isCorrect?: boolean;
  isDisabled?: boolean;
  gameType?: GameType;
  sx?: SxProps<Theme>;
}

/**
 * A reusable card component for displaying game choices
 * @param {ChoiceCardProps} props - The component props
 * @param {() => void} props.onClick - Function to call when the card is clicked
 * @param {ReactNode} props.children - The content to display in the card
 * @param {boolean} [props.isSelected] - Whether this card is currently selected
 * @param {boolean} [props.isCorrect] - Whether this card is the correct answer
 * @param {boolean} [props.isDisabled] - Whether this card is disabled (incorrect answer)
 * @param {GameType} [props.gameType] - The type of game being played
 * @param {SxProps<Theme>} [props.sx] - Additional styles to apply to the card
 */
export default function ChoiceCard({ 
  onClick, 
  children,
  isSelected = false,
  isCorrect = false,
  isDisabled = false,
  gameType,
  sx
}: ChoiceCardProps) {
  // Get the appropriate styles based on game type
  const getGameSpecificStyles = (): SxProps<Theme> => {
    const baseStyles: SxProps<Theme> = {
      m: 1,
      width: 200,
      height: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
      border: '4px solid',
      borderColor: 'transparent',
      '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: 3
      },
      ...(isDisabled && {
        opacity: 0.5,
        pointerEvents: 'none',
        '&:hover': {
          transform: 'none',
          boxShadow: 'none'
        }
      })
    };

    if (gameType === 'colors' && typeof children === 'string') {
      const color = children.toLowerCase();
      return {
        ...baseStyles,
        ...colorCardStyles,
        ...(colorStyles[color] || {}),
        ...(isSelected ? {
          bgcolor: isCorrect ? 'success.light' : 'error.light',
          color: 'white',
          borderColor: isCorrect ? 'success.main' : 'error.main'
        } : {})
      } as SxProps<Theme>;
    } else if (gameType === 'shapes' && typeof children === 'string') {
      const shape = children.toLowerCase();
      return {
        ...baseStyles,
        ...shapeCardStyles,
        ...(shapeStyles[shape] || {}),
        ...(isSelected ? {
          '& .MuiSvgIcon-root': {
            color: isCorrect ? 'success.light' : 'error.light',
          },
          borderColor: isCorrect ? 'success.main' : 'error.main'
        } : {})
      } as SxProps<Theme>;
    }

    return {
      ...baseStyles,
      ...(isSelected ? {
        bgcolor: isCorrect ? 'success.light' : 'error.light',
        color: 'white',
        borderColor: isCorrect ? 'success.main' : 'error.main'
      } : {})
    } as SxProps<Theme>;
  };

  // Get the appropriate icon for shapes
  const getShapeIcon = (shape: string) => {
    switch (shape.toLowerCase()) {
      case 'circle':
        return <Circle />;
      case 'square':
        return <Square />;
      case 'triangle':
        return <ChangeHistory />;
      case 'rectangle':
        return <Rectangle />;
      case 'star':
        return <Star />;
      case 'heart':
        return <Favorite />;
      case 'diamond':
        return <Diamond />;
      case 'umbrella':
        return <BeachAccess />;
      case 'wrench':
        return <Build />;
      case 'cake':
        return <Cake />;
      case 'call':
        return <Phone />;
      case 'smile':
        return <EmojiEmotions />;
      case 'sun':
        return <WbSunny />;
      case 'moon':
        return <DarkMode />;
      case 'cloud':
        return <Cloud />;
      case 'plus':
        return <Add />;
      case 'minus':
        return <Remove />;
      case 'up':
        return <ArrowUpward />;
      case 'down':
        return <ArrowDownward />;
      case 'left':
        return <ArrowBack />;
      case 'right':
        return <ArrowForward />;
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
        disabled={isDisabled}
        sx={{ 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
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
              fontWeight: 500
            }}
          >
            {getContent()}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
} 