'use client';

import { useState } from 'react';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Typography
} from '@mui/material';
import { useRouter } from 'next/navigation';
import MenuIcon from '@mui/icons-material/Menu';

// Icons for different game types
import NumbersIcon from '@mui/icons-material/Filter1';
import LettersIcon from '@mui/icons-material/Abc';
import ShapesIcon from '@mui/icons-material/Interests';
import ColorsIcon from '@mui/icons-material/Palette';
import PatternsIcon from '@mui/icons-material/Timeline';
import MathIcon from '@mui/icons-material/Calculate';
import BlankIcon from '@mui/icons-material/Edit';
import GeoIcon from '@mui/icons-material/Public';

/**
 * Dropdown menu component for quick navigation between games
 */
export default function GameMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const navigateTo = (path: string) => {
    handleClose();
    router.push(path);
  };
  
  // Define our game categories and subcategories
  const gameCategories = [
    {
      title: 'Numbers',
      icon: <NumbersIcon />,
      path: '/games/numbers'
    },
    {
      title: 'Letters',
      icon: <LettersIcon />,
      path: '/games/letters'
    },
    {
      title: 'Shapes',
      icon: <ShapesIcon />,
      path: '/games/shapes'
    },
    {
      title: 'Colors',
      icon: <ColorsIcon />,
      path: '/games/colors'
    },
    {
      title: 'Patterns',
      icon: <PatternsIcon />,
      path: '/games/patterns'
    },
    {
      title: 'Math',
      icon: <MathIcon />,
      children: [
        { title: 'Addition', path: '/games/math/addition' },
        { title: 'Subtraction', path: '/games/math/subtraction' }
      ]
    },
    {
      title: 'Fill in the Blank',
      icon: <BlankIcon />,
      path: '/games/fill-in-the-blank'
    },
    {
      title: 'Geography',
      icon: <GeoIcon />,
      path: '/games/geography'
    }
  ];
  
  return (
    <>
      <IconButton
        id="games-menu-button"
        aria-controls={open ? 'games-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        title="Games Menu"
        sx={{ 
          bgcolor: 'rgba(67, 97, 238, 0.1)',
          transition: 'transform 0.2s',
          '&:hover': { 
            bgcolor: 'rgba(67, 97, 238, 0.2)',
            transform: 'scale(1.05)'
          }
        }}
      >
        <MenuIcon />
      </IconButton>
      
      <Menu
        id="games-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'games-menu-button',
          dense: true
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            maxWidth: 280,
            mt: 0.5
          }
        }}
      >
        <Typography 
          variant="subtitle2" 
          sx={{ 
            px: 2, 
            py: 1, 
            fontWeight: 600,
            color: 'text.secondary'
          }}
        >
          Switch Game
        </Typography>
        <Divider />
        
        {gameCategories.map((category, index) => (
          category.children ? (
            <div key={category.title}>
              <MenuItem 
                disabled
                sx={{ 
                  opacity: 1, 
                  '& .MuiListItemText-primary': { fontWeight: 600 } 
                }}
              >
                <ListItemIcon>{category.icon}</ListItemIcon>
                <ListItemText primary={category.title} />
              </MenuItem>
              
              {category.children.map(subItem => (
                <MenuItem 
                  key={subItem.title} 
                  onClick={() => navigateTo(subItem.path)}
                  sx={{ pl: 6 }}
                >
                  <ListItemText primary={subItem.title} />
                </MenuItem>
              ))}
              
              {index < gameCategories.length - 1 && <Divider sx={{ my: 0.5 }} />}
            </div>
          ) : (
            <MenuItem 
              key={category.title} 
              onClick={() => navigateTo(category.path)}
            >
              <ListItemIcon>{category.icon}</ListItemIcon>
              <ListItemText primary={category.title} />
            </MenuItem>
          )
        ))}
      </Menu>
    </>
  );
} 