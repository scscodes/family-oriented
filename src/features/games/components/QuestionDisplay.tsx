"use client";

import { Box, Typography, Paper } from '@mui/material';
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
        gap: 3,
        animation: 'fadeIn 0.5s ease-in-out',
        '@keyframes fadeIn': {
          '0%': { opacity: 0, transform: 'translateY(-10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
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
          maxWidth: 700,
          mx: 'auto',
          fontStyle: 'italic'
        }}
      >
        {question.prompt}
      </Typography>

      {/* Visual element if present */}
      {question.visual && (
        <Paper 
          elevation={0} 
          sx={{ 
            width: 150,
            height: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '5rem',
            mb: 2,
            borderRadius: '50%',
            background: 'linear-gradient(145deg, #f8f9fa, #eef1f8)',
            boxShadow: '8px 8px 16px #d1d3d9, -8px -8px 16px #ffffff',
            transform: 'scale(1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '10px 10px 20px #c8cad0, -10px -10px 20px #ffffff',
            }
          }}
        >
          {question.visual}
        </Paper>
      )}

      {/* Main focus of the question */}
      <Paper
        elevation={0}
        sx={{
          py: 2.5,
          px: 4,
          mb: 4,
          maxWidth: 800,
          width: '100%',
          mx: 'auto',
          borderRadius: 2,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
        }}
      >
        <Typography 
          variant="h3" 
          component="div" 
          align="center"
          sx={{ 
            fontWeight: 600,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            color: 'text.primary',
            lineHeight: 1.4,
            letterSpacing: '0.01em',
            // Using Nunito font (defined in theme) for better readability
            fontFamily: 'var(--nunito-font)',
          }}
        >
          {question.focus}
        </Typography>
      </Paper>
    </Box>
  );
} 