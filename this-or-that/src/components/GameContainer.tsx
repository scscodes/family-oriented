"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { IconButton, Box, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';

interface GameContainerProps {
  title: string;
  children: ReactNode;
  score?: number;
  totalQuestions?: number;
  onSettingsClick?: () => void;
}

/**
 * A container component for all game types providing consistent layout and scoring
 */
export default function GameContainer({ 
  title, 
  children, 
  score = 0, 
  totalQuestions = 0,
  onSettingsClick 
}: GameContainerProps) {
  return (
    <div>
      <div>
        <header>
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="space-between"
            p={2}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Link href="/">
                <IconButton aria-label="home">
                  <HomeIcon />
                </IconButton>
              </Link>
              <Typography variant="h5" component="h1">
                {title}
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={2}>
              {totalQuestions > 0 && (
                <Typography variant="body1">
                  {score}/{totalQuestions}
                </Typography>
              )}
              {onSettingsClick && (
                <IconButton 
                  onClick={onSettingsClick} 
                  aria-label="settings"
                  title="Game Settings"
                >
                  <SettingsIcon />
                </IconButton>
              )}
            </Box>
          </Box>
        </header>
      </div>

      <main>
        {children}
      </main>
    </div>
  );
} 