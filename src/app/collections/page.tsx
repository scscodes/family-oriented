"use client";

import { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, Breadcrumbs, IconButton, Card, CardContent, Button, CircularProgress } from '@mui/material';
import Link from 'next/link';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useEnhancedTheme } from '@/theme/EnhancedThemeProvider';
import ThemeSelector from '@/shared/components/forms/ThemeSelector';
import { useRouter } from 'next/navigation';
import { useAvatar } from '@/hooks/useAvatar';
import { collectionsService, GameCollection } from '@/utils/collectionsService';

/**
 * Collections page - Manage saved game collections and playlists
 */
export default function CollectionsPage() {
  const { themeConfig } = useEnhancedTheme();
  const router = useRouter();
  const { avatar } = useAvatar();
  const [collections, setCollections] = useState<GameCollection[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCollections = useCallback(async () => {
    if (!avatar?.id) return;
    
    setLoading(true);
    const userCollections = await collectionsService.getCollections(avatar.id);
    setCollections(userCollections);
    setLoading(false);
  }, [avatar?.id]);

  useEffect(() => {
    if (avatar?.id) {
      loadCollections();
    }
  }, [avatar?.id, loadCollections]);

  const handlePlayCollection = (collection: GameCollection) => {
    const gameIds = collection.gameIds.join(',');
    router.push(`/games?collection=${gameIds}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4
      }}>
        <Box>
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <HomeIcon fontSize="small" />
                Home
              </Box>
            </Link>
            <Typography color="text.primary">Collections</Typography>
          </Breadcrumbs>
          
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              color: themeConfig.primary,
              mb: 1
            }}
          >
            My Game Collections
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Organize and save your favorite games for easy access
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ThemeSelector />
          <IconButton 
            component={Link} 
            href="/settings"
            size="large"
            sx={{ color: 'text.secondary' }}
          >
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Collections Display */}
      {collections.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <BookmarkBorderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Collections Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Start saving games to collections by clicking the bookmark icon on any game.
            </Typography>
            <Button
              component={Link}
              href="/games"
              variant="contained"
              startIcon={<PlayArrowIcon />}
            >
              Browse Games
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)' 
          },
          gap: 3
        }}>
          {collections.map((collection) => {
            const games = collectionsService.getCollectionGames(collection);
            
            return (
              <Card key={collection.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {collection.name}
                  </Typography>
                  
                  {collection.description && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {collection.description}
                    </Typography>
                  )}

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {games.length} games
                  </Typography>

                  {/* Game Preview */}
                  <Box sx={{ mb: 2 }}>
                    {games.slice(0, 3).map((game) => (
                      <Typography key={game.id} variant="body2" sx={{ mb: 0.5 }}>
                        {game.emoji} {game.title}
                      </Typography>
                    ))}
                    {games.length > 3 && (
                      <Typography variant="body2" color="text.secondary">
                        +{games.length - 3} more games
                      </Typography>
                    )}
                  </Box>
                </CardContent>

                <Box p={2} pt={0}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => handlePlayCollection(collection)}
                    disabled={games.length === 0}
                  >
                    Play Collection
                  </Button>
                </Box>
              </Card>
            );
          })}
        </Box>
      )}
    </Container>
  );
} 