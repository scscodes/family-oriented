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
import { GAME_CATEGORIES } from "@/utils/gameData";
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

  // Generate subjects with theme colors
  const subjects = {
    'Language Arts': { color: themeConfig.primary, icon: '📚' },
    'Mathematics': { color: themeConfig.secondary, icon: '🔢' },
    'Social Studies': { color: themeConfig.accent, icon: '🌍' },
    'Visual Arts': { color: `color-mix(in srgb, ${themeConfig.primary} 70%, ${themeConfig.secondary} 30%)`, icon: '🎨' }
  };

  // Set initial subject from URL parameter
  useEffect(() => {
    const subjectParam = searchParams.get('subject');
    if (subjectParam) {
      setSelectedSubject(subjectParam);
    }
  }, [searchParams]);

  // Filter logic: filter categories and subgames by search term and subject
  const searchTerm = search.trim().toLowerCase();
  const filteredCategories = GAME_CATEGORIES
    .filter(category => !selectedSubject || category.subject === selectedSubject)
    .map(category => {
      // Filter subgames by search
      const filteredSubgames = category.subgames.filter(subgame =>
        subgame.title.toLowerCase().includes(searchTerm) ||
        subgame.description.toLowerCase().includes(searchTerm)
      );
      return { ...category, subgames: filteredSubgames };
    })
    .filter(category => category.subgames.length > 0);

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
            color: '#4361ee',
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
                color: 'rgba(0, 0, 0, 0.5)',
                '&:hover': { 
                  color: 'rgba(0, 0, 0, 0.7)',
                  backgroundColor: 'rgba(0, 0, 0, 0.05)'
                }
              }}
            >
              <SettingsIcon fontSize="large" />
            </IconButton>
          </Link>
        </Box>
      </Box>

      <SearchBar value={search} onChange={setSearch} />
      
      {/* Subject filter chips */}
      <Box mt={2} mb={4}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'text.secondary' }}>
          Filter by Subject:
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          <Chip
            label="All Subjects"
            onClick={() => setSelectedSubject(null)}
            variant={selectedSubject === null ? "filled" : "outlined"}
            sx={{ 
              backgroundColor: selectedSubject === null ? '#e3f2fd' : 'transparent',
              '&:hover': { backgroundColor: selectedSubject === null ? '#bbdefb' : '#f5f5f5' }
            }}
          />
          {Object.entries(subjects).map(([subject, config]) => (
            <Chip
              key={subject}
              label={`${config.icon} ${subject}`}
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
          ))}
        </Box>
      </Box>

      <Box>
        {filteredCategories.map(category => (
          <AccordionCategory
            key={category.key}
            category={category}
            expanded={expanded === category.key}
            onChange={() => setExpanded(expanded === category.key ? null : category.key)}
          />
        ))}
      </Box>
    </Container>
  );
}

export default function BrowseGames() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowseGamesContent />
    </Suspense>
  );
} 