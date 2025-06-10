"use client";

import Link from "next/link";
import { 
  Typography, 
  Container, 
  Box,
  Button,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SchoolIcon from '@mui/icons-material/School';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { GAME_CATEGORIES } from "@/utils/gameData";
import { useEnhancedTheme } from "@/theme/EnhancedThemeProvider";
import ThemeSelector from "@/components/ThemeSelector";

/**
 * Modern marketing homepage designed to drive conversion and engagement
 */
export default function Home() {
  const { themeConfig } = useEnhancedTheme();
  
  // Generate heading colors from current theme
  const headingColors = {
    h1: themeConfig.primary,
    h2: `color-mix(in srgb, ${themeConfig.primary} 90%, ${themeConfig.secondary} 10%)`,
    h3: `color-mix(in srgb, ${themeConfig.primary} 80%, ${themeConfig.secondary} 20%)`,
    h4: `color-mix(in srgb, ${themeConfig.primary} 70%, ${themeConfig.secondary} 30%)`,
    h5: `color-mix(in srgb, ${themeConfig.primary} 60%, ${themeConfig.secondary} 40%)`,
    h6: `color-mix(in srgb, ${themeConfig.primary} 50%, ${themeConfig.secondary} 50%)`
  };
  
  // Subject configuration for current theme
  const subjects = {
    'Language Arts': { color: headingColors.h5, icon: '📚' },
    'Mathematics': { color: headingColors.h5, icon: '🔢' },
    'Social Studies': { color: headingColors.h5, icon: '🌍' },
    'Visual Arts': { color: headingColors.h5, icon: '🎨' }
  };

  // Get featured games from different categories
  const featuredGames = [ {
    title: "Numbers",
    description: "Learn to recognize numbers and count objects",
    href: "/games/numbers",
    emoji: "🔢",
    color: headingColors.h5
  },
  {
    title: "Letters",
    description: "Learn the alphabet and letter sounds",
    href: "/games/letters",
    emoji: "🔤",
    color: headingColors.h5
  },
  {
    title: "Shapes",
    description: "Identify different shapes",
    href: "/games/shapes",
    emoji: "⭐",
    color: headingColors.h5
  }];

  return (
    <>
      {/* Settings and Theme Icons */}
      <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000, display: 'flex', gap: 1 }}>
        <ThemeSelector />
        <Link href="/settings" style={{ textDecoration: 'none' }}>
          <IconButton 
            aria-label="settings"
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
            <SettingsIcon />
          </IconButton>
        </Link>
      </Box>

      {/* Hero Section */}
      <Box sx={{
        background: `linear-gradient(135deg, ${themeConfig.primary} 0%, ${themeConfig.secondary} 100%)`,
        color: 'white',
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            gap: 4
          }}>
            <Box sx={{ 
              flex: 1,
              animation: 'fadeInUp 0.8s ease-out',
              '@keyframes fadeInUp': {
                '0%': { opacity: 0, transform: 'translateY(30px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' }
              }
            }}>
              <Typography variant="h1" component="h1" sx={{ 
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                fontWeight: 900,
                mb: 3,
                lineHeight: 1.1
              }}>
                This or That
              </Typography>
              <Typography variant="h4" sx={{ 
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                fontWeight: 400,
                mb: 4,
                opacity: 0.9
              }}>
                Transform learning into play with engaging educational games for kids
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                mb: 4
              }}>
                <Button
                  component={Link}
                  href="/games"
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrowIcon />}
                  sx={{
                    backgroundColor: themeConfig.primary,
                    color: 'white',
                    py: 2,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': { 
                      backgroundColor: `${themeConfig.primary}dd`
                    }
                  }}
                >
                  Start Playing
                </Button>
                <Button
                  component={Link}
                  href="/games"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    py: 2,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    borderWidth: '2px',
                    '&:hover': { 
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      borderColor: 'white'
                    }
                  }}
                >
                  Browse Games
                </Button>
              </Box>
            </Box>
            
            <Box sx={{ 
              flex: 1,
              display: { xs: 'none', md: 'block' },
              fontSize: '12rem',
              textAlign: 'center',
              opacity: 0.3
            }}>
              🎮
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Quick Category Jump Section */}
      <Box sx={{ py: 6, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={4}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ 
              fontWeight: 700,
              color: headingColors.h3,
              mb: 1
            }}>
              Jump Into Learning
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
              Choose your adventure
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { 
              xs: 'repeat(2, 1fr)', 
              sm: 'repeat(3, 1fr)', 
              md: 'repeat(4, 1fr)' 
            },
            gap: 3,
            mb: 4
          }}>
            {Object.entries(subjects).map(([subject, config]) => {
              const gameCount = GAME_CATEGORIES
                .filter(cat => cat.subject === subject)
                .reduce((total, cat) => total + cat.subgames.length, 0);
              
              return (
                <Card
                  key={subject}
                  component={Link}
                  href={`/games?subject=${encodeURIComponent(subject)}`}
                  sx={{
                    height: 140,
                    textAlign: 'center',
                    p: 3,
                    border: `2px solid ${headingColors.h6}20`,
                    background: `linear-gradient(135deg, ${headingColors.h6}08, ${headingColors.h6}15)`,
                    boxShadow: `0 4px 20px ${headingColors.h6}20`,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 32px ${headingColors.h6}40`
                    }
                  }}
                >
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    <Box sx={{ fontSize: '2.5rem', mb: 1 }}>
                      {(config as { icon: string; color: string }).icon}
                    </Box>
                    <Typography variant="h5" component="h3" sx={{ 
                      fontWeight: 700, 
                      lineHeight: 1.2,
                      color: headingColors.h5,
                      mb: 1
                    }}>
                      {subject}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      fontSize: '0.9rem'
                    }}>
                      {gameCount} games
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Box>

          <Box textAlign="center">
            <Button
              component={Link}
              href="/games"
              variant="text"
              sx={{ 
                color: '#666',
                textTransform: 'none',
                '&:hover': { color: '#333' }
              }}
            >
              or browse all games →
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ 
            fontWeight: 700,
            color: headingColors.h3
          }}>
            Why Parents Choose This or That
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
            Educational games designed to make learning fun and effective for young minds
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4
        }}>
          <Box sx={{ 
            flex: 1, 
            textAlign: 'center',
            p: 3
          }}>
            <SchoolIcon sx={{ fontSize: 60, color: headingColors.h5, mb: 2 }} />
            <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600, color: headingColors.h5 }}>
              Educational Focus
            </Typography>
            <Typography color="text.secondary">
              Curriculum-aligned games covering math, language arts, science, and more
            </Typography>
          </Box>
          <Box sx={{ 
            flex: 1, 
            textAlign: 'center',
            p: 3
          }}>
            <FamilyRestroomIcon sx={{ fontSize: 60, color: headingColors.h5, mb: 2 }} />
            <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600, color: headingColors.h5 }}>
              Family-Friendly
            </Typography>
            <Typography color="text.secondary">
              Safe, ad-free environment designed specifically for children and families
            </Typography>
          </Box>
          <Box sx={{ 
            flex: 1, 
            textAlign: 'center',
            p: 3
          }}>
            <TrendingUpIcon sx={{ fontSize: 60, color: headingColors.h5, mb: 2 }} />
            <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600, color: headingColors.h5 }}>
              Progress Tracking
            </Typography>
            <Typography color="text.secondary">
              Monitor your child&apos;s learning progress and celebrate achievements
            </Typography>
          </Box>
        </Box>
      </Container>

      {/* Featured Games Section */}
      <Box sx={{ 
        backgroundColor: 'white',
        py: 8 
      }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ 
              fontWeight: 700,
              color: headingColors.h3
            }}>
              Featured Games
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Start with these popular learning games
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 4,
            flexWrap: 'wrap'
          }}>
            {featuredGames.map((game, index) => (
              <Box key={game?.href || index} sx={{ 
                flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 30%' },
                minWidth: '280px'
              }}>
                <Card sx={{ 
                  height: '100%',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                  },
                  background: `linear-gradient(135deg, ${headingColors.h5}20, ${headingColors.h5}40)`,
                  border: `2px solid ${headingColors.h5}40`
                }}>
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ fontSize: '3rem', mb: 2 }}>
                      {game?.emoji}
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom sx={{ 
                      fontWeight: 600,
                      color: headingColors.h5
                    }}>
                      {game?.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                      {game?.description}
                    </Typography>
                    <Button
                      component={Link}
                      href={game?.href || '/games'}
                      variant="contained"
                      sx={{
                        backgroundColor: headingColors.h5,
                        '&:hover': { backgroundColor: `${headingColors.h5}dd` }
                      }}
                    >
                      Play Now
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>

          <Box textAlign="center" mt={6}>
            <Button
              component={Link}
              href="/games"
              variant="outlined"
              size="large"
              sx={{ py: 1.5, px: 4, fontSize: '1.1rem' }}
            >
              View All Games
            </Button>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{
        background: `linear-gradient(135deg, ${themeConfig.secondary} 0%, ${themeConfig.accent} 100%)`,
        color: 'white',
        py: 8,
        textAlign: 'center'
      }}>
        <Container maxWidth="md">
          <AutoAwesomeIcon sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
            Ready to Make Learning Fun?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of families already using This or That to enhance their children&apos;s education
          </Typography>
          <Button
            component={Link}
            href="/games"
            variant="contained"
            size="large"
            startIcon={<PlayArrowIcon />}
            sx={{
              backgroundColor: 'white',
              color: '#333',
              py: 2,
              px: 6,
              fontSize: '1.2rem',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
          >
            Start Playing Today
          </Button>
        </Container>
      </Box>
    </>
  );
}
