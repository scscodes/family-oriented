"use client";

import { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  Tooltip
} from '@mui/material';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import { useEnhancedTheme } from '@/stores/hooks';
import { type ThemeVariant } from '@/theme/theme';

/**
 * Theme selector dropdown component with paint bucket icon
 * Allows users to switch between different color themes
 */
export default function ThemeSelector() {
  const { currentTheme, setTheme, availableThemes, isHydrated } = useEnhancedTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeSelect = (themeKey: ThemeVariant) => {
    setTheme(themeKey);
    handleClose();
  };

  return (
    <>
      <Tooltip title="Change theme">
        <IconButton 
          onClick={handleClick}
          aria-label="theme selector"
          sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            color: 'rgba(0, 0, 0, 0.7)',
            '&:hover': { 
              backgroundColor: 'rgba(255, 255, 255, 1)',
              color: 'rgba(0, 0, 0, 0.9)'
            }
          }}
        >
          <FormatPaintIcon />
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            minWidth: 200,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
          }
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
            Choose Theme
          </Typography>
        </Box>
        
        {Object.entries(availableThemes).map(([key, theme]) => (
          <MenuItem
            key={key}
            onClick={() => handleThemeSelect(key as ThemeVariant)}
            selected={isHydrated && currentTheme === key}
            sx={{
              mx: 1,
              mb: 0.5,
              borderRadius: 1,
              '&.Mui-selected': {
                backgroundColor: `${theme.primary}15`,
                '&:hover': {
                  backgroundColor: `${theme.primary}25`
                }
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  flexShrink: 0
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {theme.name}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
} 