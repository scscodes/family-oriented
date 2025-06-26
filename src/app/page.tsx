"use client";

import Link from "next/link";
import { 
  Typography, 
  Container, 
  Box,
  Button,
  Card,
  CardContent,
  Skeleton
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SchoolIcon from '@mui/icons-material/School';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { SUBJECTS, gameDiscovery } from "@/utils/gameData";

import ThemeSelector from "@/shared/components/forms/ThemeSelector";
import { useState, useMemo } from 'react';
import { GameWizardDialog } from '@/features/games/discovery/GameWizardDialog';
import SearchIcon from '@mui/icons-material/Search';
import { ProfileMenu } from '@/shared/menus/ProfileMenu';
import { useUser } from '@/context/UserContext';
import { useEnhancedTheme } from '@/theme/EnhancedThemeProvider';



/**
 * Consolidated hydration check that waits for all contexts to be ready
 */
function useIsFullyHydrated() {
  const { isHydrated: themeHydrated } = useEnhancedTheme();
  const { loadingState } = useUser();
  
  return themeHydrated && loadingState.isReady;
}

/**
 * Safe navigation component that waits for contexts to be ready
 */
function NavigationBar() {
  const isFullyHydrated = useIsFullyHydrated();
  
  // Show loading state if contexts aren't ready
  if (!isFullyHydrated) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 2,
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          Family Learning Platform
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="rectangular" width={80} height={32} />
          <Skeleton variant="rectangular" width={60} height={32} />
          <Skeleton variant="circular" width={36} height={36} />
        </Box>
      </Box>
    );
  }
  
  // Render full navigation once contexts are ready
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      p: 2,
      borderBottom: 1,
      borderColor: 'divider'
    }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
        Family Learning Platform
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <ThemeSelector />
        <ProfileMenu />
      </Box>
    </Box>
  );
}

/**
 * Mix two hex colors with a given ratio
 * @param color1 - First hex color (e.g., '#ff0000')
 * @param color2 - Second hex color (e.g., '#0000ff')
 * @param ratio - Mixing ratio (0.0 to 1.0, where 0.0 = color1, 1.0 = color2)
 */
const mixColors = (color1: string, color2: string, ratio: number): string => {
  // Remove # from hex colors
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  // Parse RGB values
  const r1 = parseInt(hex1.slice(0, 2), 16);
  const g1 = parseInt(hex1.slice(2, 4), 16);
  const b1 = parseInt(hex1.slice(4, 6), 16);
  
  const r2 = parseInt(hex2.slice(0, 2), 16);
  const g2 = parseInt(hex2.slice(2, 4), 16);
  const b2 = parseInt(hex2.slice(4, 6), 16);
  
  // Mix colors
  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * Modern marketing homepage designed to drive conversion and engagement
 */
export default function Home() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const { themeConfig } = useEnhancedTheme();
  const isFullyHydrated = useIsFullyHydrated();
  
  // Generate heading colors from current theme - memoized and theme-aware
  const headingColors = useMemo(() => ({
    h1: themeConfig.primary,
    h2: mixColors(themeConfig.primary, themeConfig.secondary, 0.1),
    h3: mixColors(themeConfig.primary, themeConfig.secondary, 0.2),
    h4: mixColors(themeConfig.primary, themeConfig.secondary, 0.3),
    h5: mixColors(themeConfig.primary, themeConfig.secondary, 0.4),
    h6: mixColors(themeConfig.primary, themeConfig.secondary, 0.5)
  }), [themeConfig.primary, themeConfig.secondary]);

  // Subject configuration for current theme - memoized
  const subjects = useMemo(() => ({
    'Language Arts': { color: headingColors.h5, icon: '📚' },
    'Mathematics': { color: headingColors.h5, icon: '🔢' },
    'Social Studies': { color: headingColors.h5, icon: '🌍' },
    'Visual Arts': { color: headingColors.h5, icon: '🎨' }
  }), [headingColors.h5]);

  // Get featured games using the discovery engine - memoized
  const featuredGames = useMemo(() => 
    gameDiscovery.getFeaturedGames().slice(0, 3).map(game => ({
      title: game.title,
      description: game.description,
      href: game.href,
      emoji: game.emoji,
      color: headingColors.h5
    })), [headingColors.h5]
  );

  // Show loading skeleton until fully hydrated to prevent mismatch
  if (!isFullyHydrated) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          p: 2,
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            Family Learning Platform
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="rectangular" width={80} height={32} />
            <Skeleton variant="circular" width={36} height={36} />
            <Skeleton variant="circular" width={36} height={36} />
          </Box>
        </Box>
        <Box sx={{ p: 8 }}>
          <Skeleton variant="text" width="60%" height={80} />
          <Skeleton variant="text" width="40%" height={40} sx={{ mb: 4 }} />
          <Box sx={{ display: 'flex', gap: 2, mb: 6 }}>
            <Skeleton variant="rectangular" width={150} height={50} />
            <Skeleton variant="rectangular" width={180} height={50} />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} variant="rectangular" height={140} />
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Safe Navigation */}
      <NavigationBar />

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
                  onClick={() => setWizardOpen(true)}
                  variant="outlined"
                  size="large"
                  startIcon={<SearchIcon />}
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
                  Find Perfect Games
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

      {/* Game Wizard Dialog */}
      <GameWizardDialog 
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />

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
              const gameCount = gameDiscovery.getGamesBySubject(subject as keyof typeof SUBJECTS).length;
              
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

      {/* Subscription Plans Promotion Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ 
            fontWeight: 700,
            color: headingColors.h3
          }}>
            Unlock Premium Learning Features
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
            Choose the perfect plan for your family or organization and unlock advanced features, 
            unlimited access, and premium educational content
          </Typography>
        </Box>

                 <Box sx={{ 
           display: 'flex', 
           flexDirection: { xs: 'column', md: 'row' },
           gap: 4,
           mb: 6
         }}>
          {/* Personal Plan Preview */}
          <Card sx={{ 
            flex: 1,
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': { 
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
            }
          }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <FamilyRestroomIcon sx={{ fontSize: 50, color: headingColors.h5, mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                Personal Plan
              </Typography>
              <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 700 }}>
                $9.99<Typography component="span" variant="body2" color="text.secondary">/mo</Typography>
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Perfect for families with up to 5 children
              </Typography>
              <Box sx={{ textAlign: 'left', mb: 3 }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />
                  5 children profiles
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />
                  Progress tracking & analytics
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />
                  Custom game collections
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />
                  1,000 sessions per month
                </Typography>
              </Box>
              <Button 
                component={Link}
                href="/plans"
                variant="outlined" 
                fullWidth
                sx={{ fontWeight: 600 }}
              >
                Learn More
              </Button>
            </CardContent>
          </Card>

                    {/* Professional Plan Preview */}
          <Card sx={{ 
            flex: 1,
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': { 
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
            }
          }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <SchoolIcon sx={{ fontSize: 50, color: headingColors.h5, mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                Professional Plan
              </Typography>
              <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 700 }}>
                $19.99<Typography component="span" variant="body2" color="text.secondary">/mo</Typography>
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                For educators and small organizations
              </Typography>
              <Box sx={{ textAlign: 'left', mb: 3 }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />
                  30 children profiles
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />
                  User management & roles
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />
                  Premium themes & scheduling
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />
                  5,000 sessions per month
                </Typography>
              </Box>
              <Button 
                component={Link}
                href="/plans"
                variant="outlined" 
                fullWidth
                sx={{ fontWeight: 600 }}
              >
                Learn More
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise Plan Preview */}
          <Card sx={{ 
            flex: 1,
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': { 
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
            }
          }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <BusinessIcon sx={{ fontSize: 50, color: headingColors.h5, mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                Enterprise Plan
              </Typography>
              <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 700 }}>
                $49.99<Typography component="span" variant="body2" color="text.secondary">/mo</Typography>
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                For large organizations with unlimited access
              </Typography>
              <Box sx={{ textAlign: 'left', mb: 3 }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />
                  Unlimited children profiles
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />
                  Custom branding & API access
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />
                  Advanced reporting & bulk ops
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />
                  Unlimited sessions
                </Typography>
              </Box>
              <Button 
                component={Link}
                href="/plans"
                variant="outlined" 
                fullWidth
                sx={{ fontWeight: 600 }}
              >
                Learn More
              </Button>
            </CardContent>
          </Card>
        </Box>

        <Box textAlign="center">
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            All plans include our complete library of educational games, family-safe content, and 24/7 support
          </Typography>
          <Button
            component={Link}
            href="/plans"
            variant="outlined"
            size="large"
            sx={{ 
              py: 1.5, 
              px: 4, 
              fontSize: '1.1rem',
              fontWeight: 600,
              mr: 2
            }}
          >
            Compare All Plans
          </Button>
          <Button
            component={Link}
            href="/dashboard"
            variant="text"
            size="large"
            sx={{ py: 1.5, px: 4, fontSize: '1.1rem' }}
          >
            Start Free Trial →
          </Button>
        </Box>
      </Container>

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

    </Box>
  );
}
