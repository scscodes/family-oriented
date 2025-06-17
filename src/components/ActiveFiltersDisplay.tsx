'use client';

import { Box, Typography, Chip, Button, Avatar } from '@mui/material';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { SUBJECTS, FacetFilter } from '@/utils/gameData';

interface ActiveFiltersDisplayProps {
  selectedSubject: string | null;
  onSubjectChange: (subject: string | null) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  facetFilters: FacetFilter;
  onFacetFiltersChange: (filters: Partial<FacetFilter>) => void;
  searchTerm?: string;
  onSearchChange?: (search: string) => void;
}

/**
 * Component to display currently active filters with ability to remove them individually
 * Shows visual indicators of applied filters and provides quick removal functionality
 */
export default function ActiveFiltersDisplay({
  selectedSubject,
  onSubjectChange,
  selectedTags,
  onTagsChange,
  facetFilters,
  onFacetFiltersChange,
  searchTerm,
  onSearchChange
}: ActiveFiltersDisplayProps) {
  // Calculate total active filters
  const totalFacetFilters = Object.values(facetFilters).reduce(
    (total, filters) => total + filters.length,
    0
  );
  const totalActiveFilters = 
    (selectedSubject ? 1 : 0) + 
    selectedTags.length + 
    totalFacetFilters +
    (searchTerm?.trim() ? 1 : 0);

  // Handle tag removal
  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    onTagsChange(newTags);
  };

  // Handle facet filter removal
  const handleRemoveFacetFilter = (category: keyof FacetFilter, filterToRemove: string) => {
    const currentValues = facetFilters[category];
    const newValues = currentValues.filter(value => value !== filterToRemove);
    
    onFacetFiltersChange({
      [category]: newValues
    });
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    onSubjectChange(null);
    onTagsChange([]);
    onFacetFiltersChange({
      ageRanges: [],
      durations: [],
      skillLevels: [],
      features: []
    });
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  // Get readable category names
  const getCategoryDisplayName = (category: keyof FacetFilter): string => {
    switch (category) {
      case 'ageRanges': return 'Age';
      case 'durations': return 'Duration';
      case 'skillLevels': return 'Skill';
      case 'features': return 'Feature';
      default: return category;
    }
  };

  // Don't render if no active filters
  if (totalActiveFilters === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Active Filters ({totalActiveFilters})
        </Typography>
        <Button
          size="small"
          startIcon={<ClearAllIcon />}
          onClick={handleClearAllFilters}
          sx={{
            textTransform: 'none',
            color: 'text.secondary',
            fontSize: '0.75rem',
            '&:hover': {
              color: 'error.main'
            }
          }}
        >
          Clear All
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {/* Search term filter */}
        {searchTerm?.trim() && onSearchChange && (
          <Chip
            label={`Search: "${searchTerm.trim()}"`}
            onDelete={() => onSearchChange('')}
            size="small"
            color="info"
            sx={{ 
              height: 28, 
              fontSize: '0.8rem',
              '& .MuiChip-deleteIcon': {
                fontSize: '1rem'
              }
            }}
          />
        )}

        {/* Subject filter */}
        {selectedSubject && (
          <Chip
            avatar={
              <Avatar
                sx={{
                  backgroundColor: SUBJECTS[selectedSubject as keyof typeof SUBJECTS]?.color || 'primary.main',
                  width: 20,
                  height: 20,
                  fontSize: '0.7rem'
                }}
              >
                {SUBJECTS[selectedSubject as keyof typeof SUBJECTS]?.icon || '📚'}
              </Avatar>
            }
            label={`Subject: ${selectedSubject}`}
            onDelete={() => onSubjectChange(null)}
            size="small"
            color="primary"
            sx={{ 
              height: 28, 
              fontSize: '0.8rem',
              '& .MuiChip-deleteIcon': {
                fontSize: '1rem'
              }
            }}
          />
        )}

        {/* Tag filters */}
        {selectedTags.map((tag) => (
          <Chip
            key={tag}
            label={`Tag: ${tag}`}
            onDelete={() => handleRemoveTag(tag)}
            size="small"
            color="secondary"
            sx={{ 
              height: 28, 
              fontSize: '0.8rem',
              '& .MuiChip-deleteIcon': {
                fontSize: '1rem'
              }
            }}
          />
        ))}

        {/* Facet filters */}
        {Object.entries(facetFilters).map(([category, filters]) =>
          filters.map((filter: string) => (
            <Chip
              key={`${category}-${filter}`}
              label={`${getCategoryDisplayName(category as keyof FacetFilter)}: ${filter}`}
              onDelete={() => handleRemoveFacetFilter(category as keyof FacetFilter, filter)}
              size="small"
              variant="outlined"
              sx={{ 
                height: 28, 
                fontSize: '0.8rem',
                borderColor: 'primary.main',
                color: 'primary.main',
                '& .MuiChip-deleteIcon': {
                  fontSize: '1rem',
                  color: 'primary.main'
                }
              }}
            />
          ))
        )}
      </Box>
    </Box>
  );
} 