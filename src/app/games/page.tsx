"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Typography, 
  Container, 
  Box,
  IconButton,
  Chip,
  Breadcrumbs
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import SearchBar from "@/components/SearchBar";
import AccordionCategory from "@/components/AccordionCategory";
import { SUBJECTS, gameDiscovery, Game } from "@/utils/gameData";
import { useEnhancedTheme } from "@/theme/EnhancedThemeProvider";
import ThemeSelector from "@/components/ThemeSelector";

/**
 * Browse all available games with search and filtering capabilities
 */
function BrowseGamesContent() {
  const { themeConfig } = useEnhancedTheme();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Set initial subject from URL parameter
  useEffect(() => {
    const subjectParam = searchParams.get('subject');
    if (subjectParam && subjectParam in SUBJECTS) {
      setSelectedSubject(subjectParam);
      setExpanded(subjectParam); // Auto-expand the selected subject
    }
  }, [searchParams]);

  // Get filtered games using the new discovery engine
  const searchResults = gameDiscovery.search(search, {
    subjects: selectedSubject ? [selectedSubject] : undefined,
    status: ['active']
  });

  // Group games by subject for display
  const gamesBySubject = Object.keys(SUBJECTS).reduce((acc, subject) => {
    const subjectGames = searchResults.filter(game => game.subject === subject);
    if (subjectGames.length > 0) {
      acc[subject as keyof typeof SUBJECTS] = subjectGames;
    }
    return acc;
  }, {} as Record<keyof typeof SUBJECTS, Game[]>);

  // Get tag facets for advanced filtering (could be used in future)
  // const facets = gameDiscovery.getFacets({
  //   subjects: selectedSubject ? [selectedSubject] : undefined
  // });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
            Explore our complete collection of educational games organized by subject
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
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

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <SearchBar 
          value={search}
          onChange={setSearch}
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
            onClick={() => setSelectedSubject(null)}
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
                onClick={() => setSelectedSubject(selectedSubject === subject ? null : subject)}
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

      {/* Results Summary */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          {search || selectedSubject ? (
            <>
              Found {searchResults.length} game{searchResults.length !== 1 ? 's' : ''}
              {search && ` matching "${search}"`}
              {selectedSubject && ` in ${selectedSubject}`}
            </>
          ) : (
            `Showing all ${searchResults.length} available games`
          )}
        </Typography>
      </Box>

      {/* Game Accordions by Subject */}
      <Box>
        {Object.entries(gamesBySubject).length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No games found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try adjusting your search terms or filters
            </Typography>
          </Box>
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