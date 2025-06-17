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
  useTheme,
  Avatar
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';

import { gameDiscovery, FacetFilter, EnhancedGameFilter, SUBJECTS } from '@/utils/gameData';

interface FacetedSidebarProps {
  currentFilters: EnhancedGameFilter;
  onFiltersChange: (filters: Partial<EnhancedGameFilter>) => void;
  selectedSubject: string | null;
  onSubjectChange: (subject: string | null) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  mobileOpen?: boolean;
  onMobileToggle?: () => void;
}

/**
 * Comprehensive faceted navigation sidebar with all filtering options
 * Includes Subject, Tags, Age Range, Duration, Skill Level, and Features
 */
export default function FacetedSidebar({
  currentFilters,
  onFiltersChange,
  selectedSubject,
  onSubjectChange,
  selectedTags,
  onTagsChange,
  mobileOpen = false,
  onMobileToggle
}: FacetedSidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'subjects',
    'skillLevels'
  ]); // Default expand key categories

  // Get current facet filters
  const currentFacets = currentFilters?.facets || {
    ageRanges: [],
    durations: [],
    skillLevels: [],
    features: []
  };

  // Get facet options with current counts
  const facetOptions = gameDiscovery.getFacetOptions(currentFilters) || {
    ageRanges: [],
    durations: [],
    skillLevels: [],
    features: []
  };
  
  // Get categorized tags with current counts
  const tagCategories = gameDiscovery.getTagsByCategory({
    subjects: selectedSubject ? [selectedSubject] : undefined,
    status: ['active']
  }) || [];

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

  // Handle tag selection/deselection
  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    onTagsChange(newTags);
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

  // Clear all filters
  const handleClearAllFilters = () => {
    onSubjectChange(null);
    onTagsChange([]);
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
  ) + (selectedSubject ? 1 : 0) + selectedTags.length;

  // Render subject filter category
  const renderSubjectCategory = () => {
    const isExpanded = expandedCategories.includes('subjects');
    
    return (
      <Accordion
        expanded={isExpanded}
        onChange={() => handleCategoryToggle('subjects')}
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
              Subject
            </Typography>

            {/* Available subjects count */}
            <Chip
              label={Object.keys(SUBJECTS).length}
              size="small"
              variant="outlined"
              sx={{
                height: 20,
                fontSize: '0.75rem',
                borderColor: 'text.secondary',
                color: 'text.secondary'
              }}
            />

            {/* Active subject indicator */}
            {selectedSubject && (
              <Chip
                label="1 selected"
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
            {selectedSubject && (
              <Box sx={{ mb: 1 }}>
                <Button
                  size="small"
                  startIcon={<ClearAllIcon />}
                  onClick={() => onSubjectChange(null)}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: '0.75rem'
                  }}
                >
                  Clear Subject
                </Button>
              </Box>
            )}

            {/* All Subjects option */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedSubject === null}
                  onChange={() => onSubjectChange(null)}
                  size="small"
                  sx={{ py: 0.5 }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">
                    All Subjects
                  </Typography>
                  <Chip
                    label={gameDiscovery.search('', { status: ['active'] }).length}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 18,
                      fontSize: '0.7rem',
                      borderColor: selectedSubject === null ? 'primary.main' : 'text.secondary',
                      color: selectedSubject === null ? 'primary.main' : 'text.secondary'
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

            {/* Individual subjects */}
            <FormGroup>
              {Object.entries(SUBJECTS).map(([subject, config]) => {
                const gameCount = gameDiscovery.getGamesBySubject(subject as keyof typeof SUBJECTS)?.length || 0;
                const isChecked = selectedSubject === subject;

                return (
                  <FormControlLabel
                    key={subject}
                    control={
                      <Checkbox
                        checked={isChecked}
                        onChange={() => onSubjectChange(isChecked ? null : subject)}
                        size="small"
                        sx={{ py: 0.5 }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{
                            backgroundColor: config.color,
                            width: 20,
                            height: 20,
                            fontSize: '0.75rem'
                          }}
                        >
                          {config.icon}
                        </Avatar>
                        <Typography variant="body2">
                          {subject}
                        </Typography>
                        <Chip
                          label={gameCount}
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

  // Render tag filter categories
  const renderTagCategories = () => {
    if (tagCategories.length === 0) return null;

    return tagCategories.map((category) => {
      const categoryKey = `tags-${category.id}`;
      const isExpanded = expandedCategories.includes(categoryKey);
      const categorySelectedTags = selectedTags.filter(tag => 
        category.tags.some(t => t.name === tag)
      );

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
                {category.name}
              </Typography>

              {/* Available tags count */}
              <Chip
                label={category.tags.length}
                size="small"
                variant="outlined"
                sx={{
                  height: 20,
                  fontSize: '0.75rem',
                  borderColor: 'text.secondary',
                  color: 'text.secondary'
                }}
              />

              {/* Active tags count */}
              {categorySelectedTags.length > 0 && (
                <Chip
                  label={`${categorySelectedTags.length} selected`}
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
              {categorySelectedTags.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Button
                    size="small"
                    startIcon={<ClearAllIcon />}
                    onClick={() => {
                      const newTags = selectedTags.filter(tag => 
                        !category.tags.some(t => t.name === tag)
                      );
                      onTagsChange(newTags);
                    }}
                    sx={{
                      textTransform: 'none',
                      color: 'text.secondary',
                      fontSize: '0.75rem'
                    }}
                  >
                    Clear {category.name}
                  </Button>
                </Box>
              )}

              {/* Tag options */}
              <FormGroup>
                {category.tags.map((tag) => {
                  const isChecked = selectedTags.includes(tag.name);

                  return (
                    <FormControlLabel
                      key={tag.name}
                      control={
                        <Checkbox
                          checked={isChecked}
                          onChange={() => handleTagToggle(tag.name)}
                          size="small"
                          sx={{ py: 0.5 }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">
                            {tag.name}
                          </Typography>
                          <Chip
                            label={tag.count}
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
    });
  };

  // Render facet filter category
  const renderFacetCategory = (
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
            onClick={handleClearAllFilters}
            sx={{ textTransform: 'none' }}
          >
            Clear All Filters
          </Button>
        </Box>
      )}

      {/* Filter Categories */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {/* Subject Filter */}
        {renderSubjectCategory()}

        {/* Tag Filters */}
        {renderTagCategories()}

        {/* Age Range */}
        {renderFacetCategory(
          'ageRanges',
          'Age Range',
          facetOptions.ageRanges
        )}

        {/* Duration */}
        {renderFacetCategory(
          'durations',
          'Duration',
          facetOptions.durations
        )}

        {/* Skill Level */}
        {renderFacetCategory(
          'skillLevels',
          'Skill Level',
          facetOptions.skillLevels
        )}

        {/* Features */}
        {renderFacetCategory(
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
              {/* Subject filter chip */}
              {selectedSubject && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  <Chip
                    label={`Subject: ${selectedSubject}`}
                    onDelete={() => onSubjectChange(null)}
                    size="small"
                    color="primary"
                    sx={{ height: 22, fontSize: '0.7rem' }}
                  />
                </Box>
              )}
              
              {/* Tag filter chips */}
              {selectedTags.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedTags.map((tag) => (
                    <Chip
                      key={tag}
                      label={`Tag: ${tag}`}
                      onDelete={() => handleTagToggle(tag)}
                      size="small"
                      color="primary"
                      sx={{ height: 22, fontSize: '0.7rem' }}
                    />
                  ))}
                </Box>
              )}
              
              {/* Facet filter chips */}
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