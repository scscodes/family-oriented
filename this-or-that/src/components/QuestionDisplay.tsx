"use client";

import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { GameQuestion } from '@/utils/gameUtils';

interface QuestionDisplayProps {
  question: GameQuestion;
  sx?: SxProps<Theme>;
}

/**
 * Component for displaying game questions with a structured layout
 * @param {QuestionDisplayProps} props - The component props
 * @param {GameQuestion} props.question - The question to display
 * @param {SxProps<Theme>} [props.sx] - Additional styles to apply
 */
export default function QuestionDisplay({ question, sx }: QuestionDisplayProps) {
  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        ...sx
      }}
    >
      {/* Muted prompt for adult/supervisor */}
      <Typography 
        variant="subtitle1" 
        color="text.secondary"
        align="center"
        sx={{ 
          opacity: 0.7,
          fontSize: '0.9rem',
          maxWidth: 600,
          mx: 'auto'
        }}
      >
        {question.prompt}
      </Typography>

      {/* Visual element if present */}
      {question.visual && (
        <Box 
          sx={{ 
            width: 120,
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem',
            mb: 2
          }}
        >
          {question.visual}
        </Box>
      )}

      {/* Main focus of the question */}
      <Typography 
        variant="h3" 
        component="div" 
        align="center"
        sx={{ 
          fontWeight: 500,
          maxWidth: 800,
          mx: 'auto',
          mb: 4
        }}
      >
        {question.focus}
      </Typography>
    </Box>
  );
} 