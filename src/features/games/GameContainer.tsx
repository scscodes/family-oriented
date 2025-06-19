"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { IconButton, Box, Typography, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import GameMenu from "./components/GameMenu";

interface GameContainerProps {
  title: string;
  children: ReactNode;
  score?: number;
  totalQuestions?: number;
}

/**
 * A container component for all game types providing consistent layout and scoring
 */
export default function GameContainer({ 
  title, 
  children, 
  score = 0, 
  totalQuestions = 0,
}: GameContainerProps) {
  return (
    <div>
      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 0, 
          position: 'sticky', 
          top: 0, 
          zIndex: 10,
          mb: 3,
          background: 'linear-gradient(90deg, rgba(248,249,250,0.95) 0%, rgba(238,241,248,0.95) 100%)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between"
          p={2}
          maxWidth="lg"
          mx="auto"
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Link href="/">
              <IconButton 
                aria-label="home" 
                sx={{ 
                  bgcolor: 'rgba(67, 97, 238, 0.1)',
                  transition: 'transform 0.2s',
                  '&:hover': { 
                    bgcolor: 'rgba(67, 97, 238, 0.2)',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <HomeIcon />
              </IconButton>
            </Link>
            
            {/* Game menu for quick navigation */}
            <GameMenu />
            
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontWeight: 600,
                background: 'linear-gradient(45deg, #4361ee, #9381ff)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0px 0px 30px rgba(67, 97, 238, 0.2)'
              }}
            >
              {title}
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={2}>
            {totalQuestions > 0 && (
              <Paper 
                elevation={0} 
                sx={{ 
                  py: 0.75, 
                  px: 2, 
                  bgcolor: 'rgba(67, 97, 238, 0.1)', 
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'primary.main'
                  }}
                >
                  {score}/{totalQuestions}
                </Typography>
              </Paper>
            )}
          </Box>
        </Box>
      </Paper>

      <Box
        component="main"
        sx={{
          maxWidth: "lg",
          mx: "auto",
          px: { xs: 2, sm: 3 },
          pb: 6
        }}
      >
        {children}
      </Box>
    </div>
  );
} 