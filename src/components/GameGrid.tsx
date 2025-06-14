'use client';

import { Box, Card, CardContent, Typography, Chip, Avatar, Button, CardActions } from '@mui/material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import GroupIcon from '@mui/icons-material/Group';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { GameCollectionButton } from './game-discovery/GameCollectionButton';

import { Game, SUBJECTS } from '@/utils/gameData';

interface GameGridProps {
  games: Game[];
  resultsPerPage: number;
}

/**
 * Grid view component displaying games as cards with rich metadata
 * Shows game information in an organized, visual card format
 */
export default function GameGrid({ games, resultsPerPage }: GameGridProps) {
  const router = useRouter();

  // Limit games based on resultsPerPage (0 = show all)
  const displayedGames = resultsPerPage === 0 ? games : games.slice(0, resultsPerPage);

  // Handle game navigation
  const handleGameClick = (game: Game) => {
    router.push(game.href);
  };

  // Get skill level color
  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 1) return '< 1 min';
    if (minutes === 1) return '1 min';
    return `${minutes} mins`;
  };

  if (displayedGames.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No games found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Try adjusting your search terms or filters
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)'
        },
        gap: 3
      }}
    >
      {displayedGames.map((game) => {
        const subjectConfig = SUBJECTS[game.subject];
        
        return (
          <Card
            key={game.id}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
                '& .game-title': {
                  color: 'primary.main'
                }
              }
            }}
            onClick={() => handleGameClick(game)}
          >
            {/* Game Header */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${subjectConfig.color}20, ${subjectConfig.color}40)`,
                borderBottom: `3px solid ${subjectConfig.color}`,
                p: 2,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Background emoji */}
              <Typography
                variant="h1"
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  fontSize: '4rem',
                  opacity: 0.1,
                  transform: 'rotate(15deg)'
                }}
              >
                {game.emoji}
              </Typography>

              {/* Game avatar and title */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
                <Avatar
                  sx={{
                    backgroundColor: subjectConfig.color,
                    width: 48,
                    height: 48,
                    fontSize: '1.5rem'
                  }}
                >
                  {game.emoji}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    className="game-title"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      transition: 'color 0.2s',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {game.title}
                  </Typography>
                  <Chip
                    label={subjectConfig.icon + ' ' + game.subject}
                    size="small"
                    sx={{
                      backgroundColor: subjectConfig.color,
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 20
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
              {/* Game Description */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 2,
                  flex: 1,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.4
                }}
              >
                {game.description}
              </Typography>

              {/* Game Metadata */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* Top row - Skill level and duration */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    icon={<SchoolIcon />}
                    label={game.skillLevel}
                    size="small"
                    color={getSkillLevelColor(game.skillLevel) as 'success' | 'warning' | 'error' | 'default'}
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 24 }}
                  />
                  <Chip
                    icon={<AccessTimeIcon />}
                    label={formatDuration(game.estimatedDuration)}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.7rem',
                      height: 24,
                      borderColor: 'text.secondary',
                      color: 'text.secondary'
                    }}
                  />
                </Box>

                {/* Age range */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Ages {game.ageRange[0]}-{game.ageRange[1]} years
                  </Typography>
                </Box>

                {/* Features row */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                  {game.hasAudio && (
                    <Chip
                      icon={<VolumeUpIcon />}
                      label="Audio"
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.65rem', height: 20 }}
                    />
                  )}
                  {game.isInteractive && (
                    <Chip
                      icon={<TouchAppIcon />}
                      label="Interactive"
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.65rem', height: 20 }}
                    />
                  )}
                  {game.hasVisuals && (
                    <Chip
                      icon={<VisibilityIcon />}
                      label="Visual"
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.65rem', height: 20 }}
                    />
                  )}
                  {game.supportsMultiplayer && (
                    <Chip
                      icon={<GroupIcon />}
                      label="Multiplayer"
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.65rem', height: 20 }}
                    />
                  )}
                </Box>

                {/* Learning objectives preview */}
                {game.learningObjectives.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                      Learning Goals:
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.3
                      }}
                    >
                      {game.learningObjectives.slice(0, 2).join(', ')}
                      {game.learningObjectives.length > 2 && '...'}
                    </Typography>
                  </Box>
                )}

                {/* Play button */}
                <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                  <Button
                    component={Link}
                    href={game.href}
                    variant="contained"
                    size="small"
                    startIcon={<PlayArrowIcon />}
                    sx={{ 
                      bgcolor: game.color,
                      '&:hover': { 
                        bgcolor: game.color,
                        filter: 'brightness(0.9)'
                      }
                    }}
                  >
                    Play
                  </Button>
                  <GameCollectionButton game={game} size="small" />
                </CardActions>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
} 