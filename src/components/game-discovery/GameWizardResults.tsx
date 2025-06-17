"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Divider,
  Chip,
  Alert
} from '@mui/material';
import { 
  Refresh as RefreshIcon, 
  PlayArrow as PlayArrowIcon, 
  Search as SearchIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { Game, gameDiscovery } from '@/utils/gameData';
import { gameWizard } from '@/utils/gameWizardService';
import GameGrid from '@/components/GameGrid';
import { logger } from '@/utils/logger';

interface GameWizardResultsProps {
  wizardId: string;
  onStartNewWizard: () => void;
}

interface WizardResults {
  selectedGames: Game[];
  alternativeSuggestions: Game[];
  userSelections: Record<string, unknown>;
  hasExactMatches: boolean;
  recommendationType: 'exact' | 'similar' | 'fallback' | 'popular';
  recommendationReason?: string;
}

/**
 * Display wizard results with fallback suggestions and user-friendly messaging
 */
export function GameWizardResults({ wizardId, onStartNewWizard }: GameWizardResultsProps) {
  const router = useRouter();
  const [results, setResults] = useState<WizardResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWizardResults = async () => {
      try {
        setLoading(true);
        setError(null);

        // Validate wizard ID
        if (!wizardId || typeof wizardId !== 'string') {
          setError('Invalid wizard session. Please start a new search.');
          return;
        }

        // Try to get wizard selections from sessionStorage
        let selections: Record<string, unknown> = {};
        if (typeof window !== 'undefined') {
          try {
            const storedSelections = sessionStorage.getItem(`wizard_${wizardId}`);
            if (storedSelections) {
              selections = JSON.parse(storedSelections);
            }
          } catch (parseError) {
            logger.warn('Failed to parse stored wizard selections:', parseError);
            // Continue with empty selections
          }
        }

        // Get wizard session data with improved recommendations
        const session = await gameWizard.getRecommendations(wizardId, selections);
        
        if (!session) {
          setError('Unable to load your game recommendations. Please try starting a new search.');
          return;
        }

        // Handle case where no filters were generated (empty selections)
        const filters = session.parsedFilters || {};

        // Get recommended games and determine recommendation type
        let exactMatches: Game[] = [];
        let recommendationType: 'exact' | 'similar' | 'fallback' | 'popular' = 'popular';
        let recommendationReason = '';

        // First check if we have selected games from the wizard service
        if (session.selectedGames && session.selectedGames.length > 0) {
          exactMatches = session.selectedGames
            .map(gameId => gameDiscovery.searchWithFacets('', {}).find(game => game.id === gameId))
            .filter(Boolean) as Game[];
          
          if (exactMatches.length > 0) {
            recommendationType = 'exact';
            recommendationReason = 'Perfect matches for your preferences';
          }
        }

        // If no games from wizard service, try direct search
        if (exactMatches.length === 0) {
          try {
            const directMatches = gameDiscovery.searchWithFacets('', filters) || [];
            if (directMatches.length > 0) {
              exactMatches = directMatches.slice(0, 6);
              recommendationType = 'exact';
              recommendationReason = 'Games matching your preferences';
            }
          } catch (searchError) {
            logger.warn('Failed to search for exact matches:', searchError);
          }
        }

        // Get alternative suggestions with enhanced logic
        let finalAlternatives: Game[] = [];
        try {
          if (exactMatches.length === 0) {
            // Use progressive fallback for better alternatives
            const alternativeFilters = createAlternativeFilters(filters);
            const alternatives = gameDiscovery.searchWithFacets('', alternativeFilters)
              ?.slice(0, 8) || [];

            finalAlternatives = alternatives;
            
            if (finalAlternatives.length > 0) {
              recommendationType = 'similar';
              recommendationReason = getRecommendationReason(filters, selections);
            }
          } else {
            // Get additional suggestions even when we have exact matches
            const alternativeFilters = createAlternativeFilters(filters);
            const alternatives = gameDiscovery.searchWithFacets('', alternativeFilters)
              ?.filter(game => !exactMatches.find(exact => exact.id === game.id))
              ?.slice(0, 6) || [];

            finalAlternatives = alternatives;
          }

          // If still no alternatives, get popular games from same subject
          if (finalAlternatives.length === 0 && filters.subjects && Array.isArray(filters.subjects) && filters.subjects.length > 0) {
            try {
              const subjectGames = gameDiscovery.getGamesBySubject(
                filters.subjects[0] as keyof typeof import('@/utils/gameData').SUBJECTS
              );
              finalAlternatives = subjectGames
                ?.filter(game => !exactMatches.find(exact => exact.id === game.id))
                ?.slice(0, 6) || [];
                
              if (exactMatches.length === 0 && finalAlternatives.length > 0) {
                recommendationType = 'similar';
                recommendationReason = `Popular ${filters.subjects[0]} games`;
              }
            } catch (subjectError) {
              logger.warn('Failed to get games by subject:', subjectError);
            }
          }

          // If still no alternatives, get featured games
          if (finalAlternatives.length === 0) {
            try {
              finalAlternatives = gameDiscovery.getFeaturedGames()
                ?.filter(game => !exactMatches.find(exact => exact.id === game.id))
                ?.slice(0, 6) || [];
                
              if (exactMatches.length === 0 && finalAlternatives.length > 0) {
                recommendationType = 'fallback';
                recommendationReason = 'Popular games you might enjoy';
              }
            } catch (featuredError) {
              logger.warn('Failed to get featured games:', featuredError);
            }
          }
        } catch (alternativesError) {
          logger.warn('Failed to generate alternative suggestions:', alternativesError);
          finalAlternatives = [];
        }

        // If we have no games at all, provide a helpful message
        if (exactMatches.length === 0 && finalAlternatives.length === 0) {
          recommendationType = 'fallback';
          recommendationReason = 'No games found matching your criteria';
        }

        setResults({
          selectedGames: exactMatches,
          alternativeSuggestions: finalAlternatives,
          userSelections: filters,
          hasExactMatches: exactMatches.length > 0,
          recommendationType,
          recommendationReason
        });

      } catch (error) {
        logger.error('Failed to load wizard results:', error);
        setError('Unable to load game recommendations. Please try starting a new search.');
      } finally {
        setLoading(false);
      }
    };

    loadWizardResults();
  }, [wizardId]);

  /**
   * Create alternative filters for fallback recommendations
   */
  const createAlternativeFilters = (originalFilters: Record<string, unknown>) => {
    return {
      ...originalFilters,
      // Relax some constraints for alternatives
      skillLevels: undefined, // Remove skill level constraint
      ageRange: originalFilters.ageRange && Array.isArray(originalFilters.ageRange) && originalFilters.ageRange.length >= 2 ? 
        [Math.max(2, originalFilters.ageRange[0] - 1), 
         Math.min(8, originalFilters.ageRange[1] + 1)] as [number, number] :
        undefined
    };
  };

  /**
   * Get descriptive reason for recommendations based on user selections
   */
  const getRecommendationReason = (filters: Record<string, unknown>, selections: Record<string, unknown>) => {
    const reasons: string[] = [];
    
    if (filters.subjects && Array.isArray(filters.subjects) && filters.subjects.length > 0) {
      reasons.push(`${filters.subjects[0]} games`);
    }
    
    if (filters.ageRange && Array.isArray(filters.ageRange)) {
      const [min, max] = filters.ageRange;
      reasons.push(`suitable for ages ${min}-${max}`);
    }
    
    if (selections.goals) {
      reasons.push(`${selections.goals} level`);
    }
    
    if (reasons.length === 0) {
      return 'Games similar to your preferences';
    }
    
    return `Games with ${reasons.join(', ')}`;
  };

  const handleViewAllGames = () => {
    router.push('/games');
  };

  const formatSelectionChips = (selections: Record<string, unknown>) => {
    const chips: { label: string; color: 'primary' | 'secondary' | 'default' }[] = [];

    if (selections.ageRange && Array.isArray(selections.ageRange)) {
      const [min, max] = selections.ageRange;
      chips.push({ 
        label: `Ages ${min}-${max}`, 
        color: 'primary' 
      });
    }

    if (selections.subjects && Array.isArray(selections.subjects)) {
      chips.push({ 
        label: selections.subjects[0] as string, 
        color: 'secondary' 
      });
    }

    if (selections.skillLevels && Array.isArray(selections.skillLevels)) {
      chips.push({ 
        label: `${selections.skillLevels[0]} level`.replace(/^\w/, c => c.toUpperCase()), 
        color: 'default' 
      });
    }

    return chips;
  };

  const getMainResultsTitle = () => {
    if (!results) return '';
    
    switch (results.recommendationType) {
      case 'exact':
        return '🎯 Perfect Matches';
      case 'similar':
        return '✨ Great Alternatives';
      case 'fallback':
      case 'popular':
        return '🌟 Popular Games';
      default:
        return '🎮 Recommended Games';
    }
  };

  const getMainResultsDescription = () => {
    if (!results) return '';
    
    switch (results.recommendationType) {
      case 'exact':
        return 'These games match your preferences perfectly!';
      case 'similar':
                 return results.recommendationReason || 'These games are similar to what you&apos;re looking for';
      case 'fallback':
      case 'popular':
        return 'We couldn\'t find exact matches, but these popular games might interest you';
      default:
        return 'Recommended games for you';
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Finding your perfect games...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Unable to Load Recommendations
        </Typography>
        <Typography variant="body1" paragraph>
          {error}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={onStartNewWizard}
          >
            Start New Search
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<PlayArrowIcon />}
            onClick={handleViewAllGames}
          >
            Browse All Games
          </Button>
        </Box>
      </Alert>
    );
  }

  if (!results) {
    return null;
  }

  const selectionChips = formatSelectionChips(results.userSelections);

  return (
    <Box>
      {/* Selection Summary */}
      <Card sx={{ mb: 4, bgcolor: 'primary.50' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <AutoAwesomeIcon color="primary" />
            <Typography variant="h6" color="primary">
              Your Game Preferences
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectionChips.length > 0 ? (
              selectionChips.map((chip, index) => (
                <Chip
                  key={index}
                  label={chip.label}
                  color={chip.color}
                  size="small"
                  variant="outlined"
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                General preferences selected
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Main Results Section */}
      {results.selectedGames.length > 0 ? (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getMainResultsTitle()}
            <Chip 
              label={`${results.selectedGames.length} game${results.selectedGames.length !== 1 ? 's' : ''}`} 
              color={results.recommendationType === 'exact' ? 'success' : 'primary'}
              size="small" 
            />
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {getMainResultsDescription()}
          </Typography>
          <GameGrid games={results.selectedGames} resultsPerPage={0} />
        </Box>
      ) : (
        <Card sx={{ mb: 6, textAlign: 'center', py: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              🔍 No Perfect Matches Found
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500, mx: 'auto' }}>
              We couldn&apos;t find games that exactly match all your preferences, but we have some great alternatives below that you might enjoy!
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={onStartNewWizard}
              >
                Try Different Preferences
              </Button>
              <Button 
                variant="contained" 
                startIcon={<PlayArrowIcon />}
                onClick={handleViewAllGames}
              >
                View All Games
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Alternative Suggestions */}
      {results.alternativeSuggestions.length > 0 && (
        <>
          <Divider sx={{ my: 4 }}>
            <Chip label={results.hasExactMatches ? "More Great Options" : "You Might Like These"} size="small" />
          </Divider>

          <Box>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {results.hasExactMatches ? '💡 Additional Suggestions' : '✨ Similar Games'}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {results.hasExactMatches 
                ? "More games you might enjoy based on your preferences"
                                  : "These games share some similarities with what you&apos;re looking for"
              }
            </Typography>
            
            <GameGrid games={results.alternativeSuggestions} resultsPerPage={0} />
          </Box>
        </>
      )}

      {/* No alternatives case */}
      {results.selectedGames.length === 0 && results.alternativeSuggestions.length === 0 && (
        <Card sx={{ textAlign: 'center', py: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎮 Let&apos;s Find You Some Games!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We&apos;re having trouble finding games that match your specific preferences. 
              Try adjusting your criteria or browse our full collection.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                startIcon={<RefreshIcon />}
                onClick={onStartNewWizard}
              >
                Try Different Preferences
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<SearchIcon />}
                onClick={handleViewAllGames}
              >
                Browse All Games
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 6, pt: 4, borderTop: 1, borderColor: 'divider' }}>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={onStartNewWizard}
          size="large"
        >
          Start New Search
        </Button>
        <Button 
          variant="contained" 
          startIcon={<PlayArrowIcon />}
          onClick={handleViewAllGames}
          size="large"
        >
          Browse All Games
        </Button>
      </Box>
    </Box>
  );
} 