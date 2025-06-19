'use client';

import { useState, ReactNode } from 'react';
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
import RhymingIcon from '@mui/icons-material/MusicNote';

import { GAMES, SUBJECTS } from '@/utils/gameData';

/**
 * Dropdown menu component for quick navigation between games
 */
interface GameMenuItem {
  id: string;
  title: string;
  icon: ReactNode;
  path: string;
  subject: string;
}

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
  
  // Get icon for each game
  const getGameIcon = (gameId: string): ReactNode => {
    const iconMap: Record<string, ReactNode> = {
      'numbers': <NumbersIcon />,
      'letters': <LettersIcon />,
      'shapes': <ShapesIcon />,
      'shape-sorter': <ShapesIcon />,
      'colors': <ColorsIcon />,
      'patterns': <PatternsIcon />,
      'addition': <MathIcon />,
      'subtraction': <MathIcon />,
      'fill-in-the-blank': <BlankIcon />,
      'geography': <GeoIcon />,
      'rhyming': <RhymingIcon />
    };
    return iconMap[gameId] || <NumbersIcon />;
  };
  
  // Convert games to menu items grouped by subject
  const gameMenuItems: GameMenuItem[] = GAMES
    .filter(game => game.status === 'active')
    .map(game => ({
      id: game.id,
      title: game.title,
      icon: getGameIcon(game.id),
      path: game.href,
      subject: game.subject
    }));
  
  // Group games by subject for organized display
  const gamesBySubject = gameMenuItems.reduce((acc, game) => {
    if (!acc[game.subject]) {
      acc[game.subject] = [];
    }
    acc[game.subject].push(game);
    return acc;
  }, {} as Record<string, GameMenuItem[]>);
  
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
            maxWidth: 320,
            mt: 0.5,
            maxHeight: '80vh'
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
        
        {Object.entries(gamesBySubject).map(([subject, games], subjectIndex) => (
          <div key={subject}>
            {/* Subject Header */}
            <MenuItem 
              disabled
              sx={{ 
                opacity: 1, 
                backgroundColor: SUBJECTS[subject as keyof typeof SUBJECTS].color + '08',
                '& .MuiListItemText-primary': { 
                  fontWeight: 600,
                  color: SUBJECTS[subject as keyof typeof SUBJECTS].color,
                  fontSize: '0.875rem'
                }
              }}
            >
              <ListItemIcon sx={{ color: SUBJECTS[subject as keyof typeof SUBJECTS].color }}>
                {SUBJECTS[subject as keyof typeof SUBJECTS].icon}
              </ListItemIcon>
              <ListItemText primary={subject} />
            </MenuItem>
            
            {/* Games in this subject */}
            {games.map(game => (
              <MenuItem 
                key={game.id} 
                onClick={() => navigateTo(game.path)}
                sx={{ pl: 4 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {game.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={game.title}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </MenuItem>
            ))}
            
            {/* Add divider between subjects except for the last one */}
            {subjectIndex < Object.entries(gamesBySubject).length - 1 && (
              <Divider sx={{ my: 0.5 }} />
            )}
          </div>
        ))}
      </Menu>
    </>
  );
} 