"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Typography, 
  Container, 
  Box,
  IconButton,
  Chip,
  Breadcrumbs,
  useMediaQuery,
  useTheme,
  Fab
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import FilterListIcon from '@mui/icons-material/FilterList';
import { logger } from "@/utils/logger";
import AutocompleteSearchBar from "@/components/AutocompleteSearchBar";
import TagFilter from "@/components/TagFilter";
import FacetedSidebar from "@/components/FacetedSidebar";
import SortControls from "@/components/SortControls";
import GameGrid from "@/components/GameGrid";
import AccordionCategory from "@/components/AccordionCategory";
import { SUBJECTS, gameDiscovery, Game, EnhancedGameFilter, SortOptions, ViewPreferences } from "@/utils/gameData";
import { useEnhancedTheme } from "@/theme/EnhancedThemeProvider";
import ThemeSelector from "@/components/ThemeSelector";
import { gameWizard } from '@/utils/gameWizardService';

/**
 * Browse all available games with search and filtering capabilities
 */
function BrowseGamesContent() {
  const { themeConfig } = useEnhancedTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const wizardId = searchParams.get('wizard');
  
  // State management
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [facetFilters, setFacetFilters] = useState({
    ageRanges: [] as string[],
    durations: [] as string[],
    skillLevels: [] as string[],
    features: [] as string[]
  });
  const [sortOptions, setSortOptions] = useState<SortOptions>({ field: 'relevance', direction: 'desc' });
  const [viewType, setViewType] = useState<'grid' | 'list'>('list');
  const [resultsPerPage, setResultsPerPage] = useState(24);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem('gameDiscoveryPreferences');
      if (savedPreferences) {
        const preferences: ViewPreferences = JSON.parse(savedPreferences);
        setSortOptions(preferences.sortBy);
        setViewType(preferences.viewType);
        setResultsPerPage(preferences.resultsPerPage);
      }
    } catch (error) {
      logger.warn('Failed to load saved preferences:', error);
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback((newPreferences: Partial<ViewPreferences>) => {
    try {
      const currentPreferences: ViewPreferences = {
        sortBy: sortOptions,
        viewType,
        resultsPerPage,
        ...newPreferences
      };
      localStorage.setItem('gameDiscoveryPreferences', JSON.stringify(currentPreferences));
    } catch (error) {
      logger.warn('Failed to save preferences:', error);
    }
  }, [sortOptions, viewType, resultsPerPage]);

  // Set initial filters from URL parameters
  useEffect(() => {
    const subjectParam = searchParams.get('subject');
    const tagsParam = searchParams.get('tags');
    const searchParam = searchParams.get('search');

    if (subjectParam && subjectParam in SUBJECTS) {
      setSelectedSubject(subjectParam);
      setExpanded(subjectParam); // Auto-expand the selected subject
    }

    if (tagsParam) {
      const tags = tagsParam.split(',').filter(Boolean);
      setSelectedTags(tags);
    }

    if (searchParam) {
      setSearch(searchParam);
    }
  }, [searchParams]);

  // Load wizard recommendations if present
  useEffect(() => {
    if (wizardId) {
      // TODO: Load wizard session and apply recommendations
      // This will be implemented when we have the analytics dashboard
      logger.info('Wizard session:', wizardId);
    }
  }, [wizardId]);

  // Update URL when filters change
  const updateURL = (newSearch: string, newSubject: string | null, newTags: string[]) => {
    const params = new URLSearchParams();
    
    if (newSearch.trim()) {
      params.set('search', newSearch);
    }
    
    if (newSubject) {
      params.set('subject', newSubject);
    }
    
    if (newTags.length > 0) {
      params.set('tags', newTags.join(','));
    }
    
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    
    // Use replace to avoid cluttering browser history
    router.replace(newUrl, { scroll: false });
  };

  // Enhanced search handler with URL sync
  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    updateURL(newSearch, selectedSubject, selectedTags);
  };

  // Enhanced subject handler with URL sync
  const handleSubjectChange = (newSubject: string | null) => {
    setSelectedSubject(newSubject);
    updateURL(search, newSubject, selectedTags);
  };

  // Enhanced tags handler with URL sync
  const handleTagsChange = (newTags: string[]) => {
    setSelectedTags(newTags);
    updateURL(search, selectedSubject, newTags);
  };

  // Enhanced handlers for new features
  const handleFacetFiltersChange = (filters: Partial<EnhancedGameFilter>) => {
    if (filters.facets) {
      setFacetFilters(filters.facets);
    }
  };

  const handleSortChange = (sort: SortOptions) => {
    setSortOptions(sort);
    savePreferences({ sortBy: sort });
  };

  const handleViewChange = (view: 'grid' | 'list') => {
    setViewType(view);
    savePreferences({ viewType: view });
  };

  const handleResultsPerPageChange = (count: number) => {
    setResultsPerPage(count);
    savePreferences({ resultsPerPage: count });
  };

  // Build comprehensive filter object
  const currentFilters: EnhancedGameFilter = {
    subjects: selectedSubject ? [selectedSubject] : undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    status: ['active'],
    facets: facetFilters,
    sort: sortOptions
  };

  // Get filtered and sorted games using enhanced discovery engine
  const searchResults = gameDiscovery.searchWithFacets(search, currentFilters);

  // Group games by subject for list view display
  const gamesBySubject = Object.keys(SUBJECTS).reduce((acc, subject) => {
    const subjectGames = searchResults.filter(game => game.subject === subject);
    if (subjectGames.length > 0) {
      acc[subject as keyof typeof SUBJECTS] = subjectGames;
    }
    return acc;
  }, {} as Record<keyof typeof SUBJECTS, Game[]>);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        mb: 4
      }}>
        <Box sx={{ flex: 1 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Home
            </Link>
            <Typography color="text.primary">Browse Games</Typography>
          </Breadcrumbs>
          
          <Typography variant="h3" component="h1" gutterBottom sx={{ 
            fontWeight: 700,
            color: themeConfig.primary,
            mb: 2
          }}>
            Browse All Games
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Explore our complete collection of educational games with advanced filtering and sorting
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Mobile filters button */}
          {isMobile && (
            <IconButton 
              aria-label="filters"
              onClick={() => setMobileFiltersOpen(true)}
              sx={{ 
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                color: themeConfig.primary,
                '&:hover': { 
                  backgroundColor: 'rgba(67, 97, 238, 0.2)'
                }
              }}
            >
              <FilterListIcon />
            </IconButton>
          )}
          
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
      </Box>

      {/* Main Content - Two Column Layout */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Left Sidebar - Desktop Only */}
        {!isMobile && (
          <FacetedSidebar
            currentFilters={currentFilters}
            onFiltersChange={handleFacetFiltersChange}
          />
        )}

        {/* Mobile Sidebar - Drawer */}
        {isMobile && (
          <FacetedSidebar
            currentFilters={currentFilters}
            onFiltersChange={handleFacetFiltersChange}
            mobileOpen={mobileFiltersOpen}
            onMobileToggle={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          />
        )}

        {/* Main Content Area */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Search Bar */}
          <Box sx={{ mb: 3 }}>
            <AutocompleteSearchBar 
              value={search}
              onChange={handleSearchChange}
            />
          </Box>

          {/* Subject Filter Chips */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Filter by Subject
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              <Chip
                label="All Subjects"
                onClick={() => handleSubjectChange(null)}
                variant={selectedSubject === null ? "filled" : "outlined"}
                sx={{ 
                  backgroundColor: selectedSubject === null ? themeConfig.primary : 'transparent',
                  color: selectedSubject === null ? '#fff' : themeConfig.primary,
                  borderColor: themeConfig.primary,
                  '&:hover': { 
                    backgroundColor: selectedSubject === null ? themeConfig.primary : `${themeConfig.primary}20`
                  }
                }}
              />
              {Object.entries(SUBJECTS).map(([subject, config]) => {
                const gameCount = gameDiscovery.getGamesBySubject(subject as keyof typeof SUBJECTS).length;
                
                return (
                  <Chip
                    key={subject}
                    label={`${config.icon} ${subject} (${gameCount})`}
                    onClick={() => handleSubjectChange(selectedSubject === subject ? null : subject)}
                    variant={selectedSubject === subject ? "filled" : "outlined"}
                    sx={{ 
                      backgroundColor: selectedSubject === subject ? config.color : 'transparent',
                      color: selectedSubject === subject ? '#fff' : config.color,
                      borderColor: config.color,
                      '&:hover': { 
                        backgroundColor: selectedSubject === subject ? config.color : `${config.color}20`
                      }
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          {/* Legacy Tag Filtering - Keep for backwards compatibility */}
          <Box sx={{ mb: 4 }}>
            <TagFilter
              selectedTags={selectedTags}
              onTagsChange={handleTagsChange}
              currentFilters={{
                subjects: selectedSubject ? [selectedSubject] : undefined,
                status: ['active']
              }}
            />
          </Box>

          {/* Sort Controls */}
          <Box sx={{ mb: 3 }}>
            <SortControls
              sortOptions={sortOptions}
              viewType={viewType}
              resultsPerPage={resultsPerPage}
              totalResults={searchResults.length}
              onSortChange={handleSortChange}
              onViewChange={handleViewChange}
              onResultsPerPageChange={handleResultsPerPageChange}
            />
          </Box>

          {/* Results Display */}
          <Box>
            {searchResults.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No games found
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Try adjusting your search terms or filters
                </Typography>
              </Box>
            ) : viewType === 'grid' ? (
              <GameGrid games={searchResults} resultsPerPage={resultsPerPage} />
            ) : (
              Object.entries(gamesBySubject).map(([subject, games]) => (
                <AccordionCategory
                  key={subject}
                  subject={subject as keyof typeof SUBJECTS}
                  games={games}
                  expanded={expanded === subject}
                  onChange={() => setExpanded(expanded === subject ? null : subject)}
                />
              ))
            )}
          </Box>
        </Box>
      </Box>

      {/* Mobile Filter FAB */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="open filters"
          onClick={() => setMobileFiltersOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
        >
          <FilterListIcon />
        </Fab>
      )}
    </Container>
  );
}

export default function BrowseGames() {
  return (
    <Suspense fallback={
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading games...</Typography>
      </Container>
    }>
      <BrowseGamesContent />
    </Suspense>
  );
} 