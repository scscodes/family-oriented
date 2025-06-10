'use client';

import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  IconButton,
  SelectChangeEvent
} from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import SchoolIcon from '@mui/icons-material/School';

import { SortOptions } from '@/utils/gameData';

interface SortControlsProps {
  sortOptions: SortOptions;
  viewType: 'grid' | 'list';
  resultsPerPage: number;
  totalResults: number;
  onSortChange: (sort: SortOptions) => void;
  onViewChange: (view: 'grid' | 'list') => void;
  onResultsPerPageChange: (count: number) => void;
}

/**
 * Sort and view controls component with persistent user preferences
 * Includes sorting dropdown, grid/list toggle, and results per page selector
 */
export default function SortControls({
  sortOptions,
  viewType,
  resultsPerPage,
  totalResults,
  onSortChange,
  onViewChange,
  onResultsPerPageChange
}: SortControlsProps) {
  // Sort options configuration
  const sortConfigs = [
    {
      field: 'relevance' as const,
      label: 'Relevance',
      icon: <TrendingUpIcon fontSize="small" />,
      directions: [{ value: 'desc', label: 'Best Match' }]
    },
    {
      field: 'skillLevel' as const,
      label: 'Difficulty',
      icon: <SchoolIcon fontSize="small" />,
      directions: [
        { value: 'asc', label: 'Easy to Hard' },
        { value: 'desc', label: 'Hard to Easy' }
      ]
    },
    {
      field: 'duration' as const,
      label: 'Duration',
      icon: <AccessTimeIcon fontSize="small" />,
      directions: [
        { value: 'asc', label: 'Short to Long' },
        { value: 'desc', label: 'Long to Short' }
      ]
    },
    {
      field: 'lastUpdated' as const,
      label: 'Date',
      icon: <NewReleasesIcon fontSize="small" />,
      directions: [
        { value: 'desc', label: 'Newest First' },
        { value: 'asc', label: 'Oldest First' }
      ]
    },
    {
      field: 'title' as const,
      label: 'Name',
      icon: <SortByAlphaIcon fontSize="small" />,
      directions: [
        { value: 'asc', label: 'A to Z' },
        { value: 'desc', label: 'Z to A' }
      ]
    }
  ];

  // Results per page options
  const resultsPerPageOptions = [12, 24, 48, 0]; // 0 means "All"

  // Handle sort field/direction change
  const handleSortChange = (event: SelectChangeEvent) => {
    const [field, direction] = event.target.value.split('-') as [SortOptions['field'], SortOptions['direction']];
    onSortChange({ field, direction });
  };

  // Toggle sort direction for current field
  const toggleSortDirection = () => {
    const currentConfig = sortConfigs.find(config => config.field === sortOptions.field);
    if (currentConfig && currentConfig.directions.length > 1) {
      const newDirection = sortOptions.direction === 'asc' ? 'desc' : 'asc';
      onSortChange({ ...sortOptions, direction: newDirection });
    }
  };

  // Get current sort display value
  const getCurrentSortValue = () => {
    return `${sortOptions.field}-${sortOptions.direction}`;
  };



  // Get current sort icon
  const getCurrentSortIcon = () => {
    const config = sortConfigs.find(c => c.field === sortOptions.field);
    return config?.icon || <TrendingUpIcon fontSize="small" />;
  };

  // Check if current sort field supports direction toggle
  const canToggleDirection = () => {
    const config = sortConfigs.find(c => c.field === sortOptions.field);
    return config ? config.directions.length > 1 : false;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        p: 2,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1
      }}
    >
      {/* Left side - Sort controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 300 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getCurrentSortIcon()}
          <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 'fit-content' }}>
            Sort by:
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={getCurrentSortValue()}
            onChange={handleSortChange}
            displayEmpty
            sx={{ 
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }
            }}
          >
            {sortConfigs.map(config =>
              config.directions.map(direction => (
                <MenuItem
                  key={`${config.field}-${direction.value}`}
                  value={`${config.field}-${direction.value}`}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {config.icon}
                    <Typography variant="body2">
                      {direction.label}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        {/* Sort direction toggle (if applicable) */}
        {canToggleDirection() && (
          <IconButton
            onClick={toggleSortDirection}
            size="small"
            title={`Change to ${sortOptions.direction === 'asc' ? 'descending' : 'ascending'} order`}
            sx={{
              transform: sortOptions.direction === 'desc' ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s'
            }}
          >
            <SwapVertIcon />
          </IconButton>
        )}
      </Box>

      {/* Center - Results info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Showing{' '}
          {resultsPerPage === 0 || resultsPerPage >= totalResults 
            ? totalResults 
            : `${Math.min(resultsPerPage, totalResults)} of ${totalResults}`
          }{' '}
          results
        </Typography>
      </Box>

      {/* Right side - View controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Results per page */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 'fit-content' }}>
            Per page:
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {resultsPerPageOptions.map(count => (
              <Chip
                key={count}
                label={count === 0 ? 'All' : count}
                onClick={() => onResultsPerPageChange(count)}
                variant={resultsPerPage === count ? 'filled' : 'outlined'}
                color={resultsPerPage === count ? 'primary' : 'default'}
                size="small"
                sx={{
                  cursor: 'pointer',
                  minWidth: 40,
                  '&:hover': {
                    backgroundColor: resultsPerPage === count ? 'primary.dark' : 'action.hover'
                  }
                }}
              />
            ))}
          </Box>
        </Box>

        {/* View type toggle */}
        <ToggleButtonGroup
          value={viewType}
          exclusive
          onChange={(_, newView) => newView && onViewChange(newView)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              border: '1px solid',
              borderColor: 'divider',
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark'
                }
              }
            }
          }}
        >
          <ToggleButton value="grid" aria-label="grid view">
            <GridViewIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="list" aria-label="list view">
            <ViewListIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
} 