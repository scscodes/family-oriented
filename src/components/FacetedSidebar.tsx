'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Badge,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';

import { gameDiscovery, FacetFilter, EnhancedGameFilter } from '@/utils/gameData';

interface FacetedSidebarProps {
  currentFilters: EnhancedGameFilter;
  onFiltersChange: (filters: Partial<EnhancedGameFilter>) => void;
  mobileOpen?: boolean;
  onMobileToggle?: () => void;
}

/**
 * Comprehensive faceted navigation sidebar with collapsible filter categories
 * Includes Age Range, Duration, Skill Level, Features with real-time counts
 */
export default function FacetedSidebar({
  currentFilters,
  onFiltersChange,
  mobileOpen = false,
  onMobileToggle
}: FacetedSidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'ageRanges', 
    'skillLevels'
  ]); // Default expand key categories

  // Get current facet filters
  const currentFacets = currentFilters.facets || {
    ageRanges: [],
    durations: [],
    skillLevels: [],
    features: []
  };

  // Get facet options with current counts
  const facetOptions = gameDiscovery.getFacetOptions(currentFilters);

  // Handle category expansion
  const handleCategoryToggle = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Handle facet filter changes
  const handleFacetChange = (category: keyof FacetFilter, value: string, checked: boolean) => {
    const currentValues = currentFacets[category];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);

    onFiltersChange({
      facets: {
        ...currentFacets,
        [category]: newValues
      }
    });
  };

  // Clear all filters in a category
  const handleClearCategory = (category: keyof FacetFilter) => {
    onFiltersChange({
      facets: {
        ...currentFacets,
        [category]: []
      }
    });
  };

  // Clear all facet filters
  const handleClearAllFacets = () => {
    onFiltersChange({
      facets: {
        ageRanges: [],
        durations: [],
        skillLevels: [],
        features: []
      }
    });
  };

  // Get total active filter count
  const totalActiveFilters = Object.values(currentFacets).reduce(
    (total, filters) => total + filters.length, 
    0
  );

  // Render filter category
  const renderFilterCategory = (
    categoryKey: keyof FacetFilter,
    categoryTitle: string,
    options: Array<{range?: string, level?: string, feature?: string, label: string, count: number}>
  ) => {
    const isExpanded = expandedCategories.includes(categoryKey);
    const categoryFilters = currentFacets[categoryKey];
    const activeCount = categoryFilters.length;

    if (options.length === 0) return null;

    return (
      <Accordion
        key={categoryKey}
        expanded={isExpanded}
        onChange={() => handleCategoryToggle(categoryKey)}
        sx={{
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'divider',
          '&:before': { display: 'none' },
          '&.Mui-expanded': {
            margin: '8px 0'
          }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            minHeight: 48,
            '&.Mui-expanded': {
              minHeight: 48
            },
            '& .MuiAccordionSummary-content': {
              margin: '8px 0',
              '&.Mui-expanded': {
                margin: '8px 0'
              }
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {categoryTitle}
            </Typography>

            {/* Available options count */}
            <Chip
              label={options.length}
              size="small"
              variant="outlined"
              sx={{
                height: 20,
                fontSize: '0.75rem',
                borderColor: 'text.secondary',
                color: 'text.secondary'
              }}
            />

            {/* Active filters count */}
            {activeCount > 0 && (
              <Chip
                label={`${activeCount} selected`}
                size="small"
                color="primary"
                sx={{
                  height: 20,
                  fontSize: '0.75rem',
                  ml: 'auto'
                }}
              />
            )}
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ pt: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Clear category button */}
            {activeCount > 0 && (
              <Box sx={{ mb: 1 }}>
                <Button
                  size="small"
                  startIcon={<ClearAllIcon />}
                  onClick={() => handleClearCategory(categoryKey)}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: '0.75rem'
                  }}
                >
                  Clear {categoryTitle}
                </Button>
              </Box>
            )}

            {/* Filter options */}
            <FormGroup>
              {options.map((option) => {
                const value = option.range || option.level || option.feature || '';
                const isChecked = categoryFilters.includes(value);

                return (
                  <FormControlLabel
                    key={value}
                    control={
                      <Checkbox
                        checked={isChecked}
                        onChange={(e) => handleFacetChange(categoryKey, value, e.target.checked)}
                        size="small"
                        sx={{ py: 0.5 }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {option.label}
                        </Typography>
                        <Chip
                          label={option.count}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 18,
                            fontSize: '0.7rem',
                            borderColor: isChecked ? 'primary.main' : 'text.secondary',
                            color: isChecked ? 'primary.main' : 'text.secondary'
                          }}
                        />
                      </Box>
                    }
                    sx={{
                      margin: 0,
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                );
              })}
            </FormGroup>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  // Sidebar content
  const sidebarContent = (
    <Box sx={{ width: 300, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filters
          </Typography>
          {totalActiveFilters > 0 && (
            <Badge badgeContent={totalActiveFilters} color="primary" />
          )}
        </Box>

        {/* Mobile close button */}
        {isMobile && (
          <IconButton onClick={onMobileToggle} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Clear all button */}
      {totalActiveFilters > 0 && (
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ClearAllIcon />}
            onClick={handleClearAllFacets}
            sx={{ textTransform: 'none' }}
          >
            Clear All Filters
          </Button>
        </Box>
      )}

      {/* Filter Categories */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {/* Age Range */}
        {renderFilterCategory(
          'ageRanges',
          'Age Range',
          facetOptions.ageRanges
        )}

        {/* Duration */}
        {renderFilterCategory(
          'durations',
          'Duration',
          facetOptions.durations
        )}

        {/* Skill Level */}
        {renderFilterCategory(
          'skillLevels',
          'Skill Level',
          facetOptions.skillLevels
        )}

        {/* Features */}
        {renderFilterCategory(
          'features',
          'Features',
          facetOptions.features
        )}

        {/* Active filters summary */}
        {totalActiveFilters > 0 && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'primary.light', borderRadius: 1 }}>
            <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
              Active Filters ({totalActiveFilters})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {Object.entries(currentFacets).map(([category, filters]) =>
                filters.length > 0 ? (
                  <Box key={category} sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {filters.map((filter: string) => (
                      <Chip
                        key={filter}
                        label={filter}
                        onDelete={() => handleFacetChange(category as keyof FacetFilter, filter, false)}
                        size="small"
                        color="primary"
                        sx={{ height: 22, fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                ) : null
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );

  // Render as drawer on mobile, fixed sidebar on desktop
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={onMobileToggle}
        ModalProps={{
          keepMounted: true // Better mobile performance
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 300,
            boxSizing: 'border-box'
          }
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  // Desktop sidebar
  return (
    <Box
      sx={{
        width: 300,
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: 'calc(100vh - 32px)', // Account for container padding
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        backgroundColor: 'background.paper'
      }}
    >
      {sidebarContent}
    </Box>
  );
} 