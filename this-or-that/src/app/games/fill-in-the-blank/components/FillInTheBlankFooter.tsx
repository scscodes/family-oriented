"use client";

import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

interface Attempt {
  letter: string;
  word: string;
  isCorrect: boolean;
}

interface FillInTheBlankFooterProps {
  attempts: Attempt[];
  sx?: SxProps<Theme>;
}

/**
 * Component for displaying the history of attempts in the fill-in-the-blank game
 * @param {FillInTheBlankFooterProps} props - The component props
 * @param {Attempt[]} props.attempts - List of previous attempts
 * @param {SxProps<Theme>} [props.sx] - Additional styles to apply
 */
export default function FillInTheBlankFooter({ attempts, sx }: FillInTheBlankFooterProps) {
  if (attempts.length === 0) return null;

  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        mt: 4,
        maxWidth: 800,
        mx: 'auto',
        ...sx
      }}
    >
      <Typography 
        variant="subtitle2" 
        color="text.secondary"
        sx={{ mb: 1 }}
      >
        Previous attempts:
      </Typography>
      
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        width: '100%',
        maxWidth: 600,
        mx: 'auto'
      }}>
        {[...attempts].reverse().map((attempt, index) => (
          <Box 
            key={attempts.length - 1 - index}
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: attempt.isCorrect ? 'success.light' : 'error.light',
              color: 'white',
              opacity: 0.8,
              transition: 'opacity 0.3s ease-in-out',
              '&:hover': {
                opacity: 1
              }
            }}
          >
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              fontSize: '1.5rem',
              flexShrink: 0
            }}>
              {attempt.isCorrect ? '✓' : '✗'}
            </Box>
            
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flex: 1,
              minWidth: 0
            }}>
              <Typography 
                variant="body1" 
                fontWeight="bold" 
                fontSize="1.2rem"
                sx={{ 
                  minWidth: '2ch',
                  textAlign: 'center'
                }}
              >
                {attempt.letter}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  opacity: 0.9,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {attempt.word}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
} 