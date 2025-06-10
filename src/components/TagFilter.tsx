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
  Badge
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearAllIcon from '@mui/icons-material/ClearAll';

import { gameDiscovery, GameFilter } from '@/utils/gameData';

interface TagFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  currentFilters?: GameFilter;
  maxVisibleTags?: number;
}

/**
 * Tag-based filtering component with categorized tags, counts, and multi-selection
 * Displays tags grouped by categories with accordion interface for better organization
 */
export default function TagFilter({ 
  selectedTags, 
  onTagsChange, 
  currentFilters = {},
  maxVisibleTags = 6
}: TagFilterProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['skill-type']); // Default expand skills

  // Get categorized tags with current counts
  const tagCategories = gameDiscovery.getTagsByCategory(currentFilters);

  // Handle tag selection/deselection
  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    onTagsChange(newTags);
  };

  // Handle category expansion
  const handleCategoryToggle = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Clear all selected tags
  const handleClearAll = () => {
    onTagsChange([]);
  };

  // Get total number of selected tags
  const totalSelectedTags = selectedTags.length;

  if (tagCategories.length === 0) {
    return null;
  }

  return (
    <Box>
      {/* Header with clear all button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2 
      }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Filter by Tags
          {totalSelectedTags > 0 && (
            <Badge 
              badgeContent={totalSelectedTags} 
              color="primary" 
              sx={{ ml: 1 }}
            />
          )}
        </Typography>
        
        {totalSelectedTags > 0 && (
          <Button
            size="small"
            startIcon={<ClearAllIcon />}
            onClick={handleClearAll}
            sx={{ 
              textTransform: 'none',
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            Clear All
          </Button>
        )}
      </Box>

      {/* Tag Categories */}
      <Box sx={{ mb: 2 }}>
        {tagCategories.map((category) => {
          const isExpanded = expandedCategories.includes(category.id);
          const categorySelectedTags = selectedTags.filter(tag => 
            category.tags.some(t => t.name === tag)
          );

          return (
            <Accordion
              key={category.id}
              expanded={isExpanded}
              onChange={() => handleCategoryToggle(category.id)}
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
                  
                  {/* Category badge showing total available tags */}
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
                  
                  {/* Selected tags count for this category */}
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
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {category.tags
                    .slice(0, isExpanded ? undefined : maxVisibleTags)
                    .map((tag) => {
                      const isSelected = selectedTags.includes(tag.name);
                      
                      return (
                        <Chip
                          key={tag.name}
                          label={`${tag.label} (${tag.count})`}
                          onClick={() => handleTagToggle(tag.name)}
                          variant={isSelected ? "filled" : "outlined"}
                          color={isSelected ? "primary" : "default"}
                          size="small"
                          sx={{
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              boxShadow: 2
                            },
                            ...(isSelected && {
                              fontWeight: 600,
                              boxShadow: 1
                            })
                          }}
                        />
                      );
                    })}
                  
                  {/* Show more button if there are more tags */}
                  {!isExpanded && category.tags.length > maxVisibleTags && (
                    <Chip
                      label={`+${category.tags.length - maxVisibleTags} more`}
                      onClick={() => handleCategoryToggle(category.id)}
                      variant="outlined"
                      size="small"
                      sx={{
                        cursor: 'pointer',
                        color: 'primary.main',
                        borderColor: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'primary.light'
                        }
                      }}
                    />
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>

      {/* Selected tags summary (if any) */}
      {totalSelectedTags > 0 && (
        <Box sx={{ 
          p: 2, 
          backgroundColor: 'primary.light', 
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'primary.main'
        }}>
          <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
            Active Filters ({totalSelectedTags})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selectedTags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleTagToggle(tag)}
                size="small"
                color="primary"
                sx={{ 
                  height: 24,
                  fontSize: '0.75rem'
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
} 