'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  TextField, 
  InputAdornment, 
  Paper, 
  List, 
  ListItem, 
  ListItemButton,
  ListItemIcon, 
  ListItemText,
  Chip,
  Box,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TagIcon from '@mui/icons-material/Tag';
import SchoolIcon from '@mui/icons-material/School';
import GamepadIcon from '@mui/icons-material/Gamepad';

import { gameDiscovery, AutocompleteSuggestion, SUBJECTS } from '@/utils/gameData';

interface AutocompleteSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

/**
 * Enhanced search bar with autocomplete suggestions from game titles, tags, and learning objectives
 * Supports keyboard navigation and highlighted matches
 */
export default function AutocompleteSearchBar({ 
  value, 
  onChange, 
  placeholder = "Search games, tags, or learning objectives...",
  debounceMs = 300
}: AutocompleteSearchBarProps) {
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounced search function
  const debouncedSearch = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      if (query.trim()) {
        setIsLoading(true);
        const results = gameDiscovery.getAutocompleteSuggestions(query, 8);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setSelectedIndex(-1);
        setIsLoading(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }, debounceMs);
  }, [debounceMs]);

  // Handle input change
  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    debouncedSearch(newValue);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: AutocompleteSuggestion) => {
    onChange(suggestion.value);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
        
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
        
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (inputRef.current && !inputRef.current.contains(target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get icon for suggestion type
  const getSuggestionIcon = (suggestion: AutocompleteSuggestion) => {
    switch (suggestion.type) {
      case 'game':
        return <GamepadIcon />;
      case 'tag':
        return <TagIcon />;
      case 'objective':
        return <SchoolIcon />;
      default:
        return <SearchIcon />;
    }
  };

  // Get subject color
  const getSubjectColor = (subject?: keyof typeof SUBJECTS) => {
    if (!subject) return undefined;
    return SUBJECTS[subject]?.color;
  };

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <Box component="span" key={index} sx={{ fontWeight: 600, backgroundColor: 'primary.light', color: 'primary.contrastText', px: 0.5, borderRadius: 0.5 }}>
          {part}
        </Box>
      ) : part
    );
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <TextField
        ref={inputRef}
        label="Search"
        variant="outlined"
        value={value}
        onChange={e => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        fullWidth
        size="medium"
        placeholder={placeholder}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          inputProps: {
            'aria-label': 'Search games with autocomplete',
            'aria-expanded': showSuggestions,
            'aria-haspopup': 'listbox',
            'aria-activedescendant': selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined,
            autoComplete: 'off'
          }
        }}
        sx={{ 
          background: '#fff',
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: 2
              }
            }
          }
        }}
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Paper 
          elevation={8}
          sx={{ 
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1300,
            maxHeight: 400,
            overflow: 'auto',
            mt: 1,
            borderRadius: 2
          }}
        >
          <List 
            ref={listRef}
            dense 
            role="listbox"
            aria-label="Search suggestions"
            sx={{ py: 0 }}
          >
            {suggestions.map((suggestion, index) => (
              <ListItem
                key={`${suggestion.type}-${suggestion.value}`}
                disablePadding
              >
                <ListItemButton
                  id={`suggestion-${index}`}
                  selected={selectedIndex === index}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  role="option"
                  aria-selected={selectedIndex === index}
                  sx={{
                    py: 1.5,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.main'
                      }
                    }
                  }}
                >
                <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                  {suggestion.emoji ? (
                    <Typography variant="h6">{suggestion.emoji}</Typography>
                  ) : (
                    getSuggestionIcon(suggestion)
                  )}
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {highlightMatch(suggestion.label, value)}
                      {suggestion.count && (
                        <Chip 
                          label={suggestion.count} 
                          size="small" 
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.75rem' }}
                        />
                      )}
                      {suggestion.subject && (
                        <Chip 
                          label={SUBJECTS[suggestion.subject].icon}
                          size="small"
                          sx={{ 
                            height: 20,
                            backgroundColor: getSubjectColor(suggestion.subject) + '20',
                            color: getSubjectColor(suggestion.subject),
                            border: `1px solid ${getSubjectColor(suggestion.subject)}50`
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={suggestion.gameTitle && (
                    <Typography variant="caption" color="text.secondary">
                      from {suggestion.gameTitle}
                    </Typography>
                  )}
                />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Loading indicator could be added here if needed */}
      {isLoading && (
        <Box sx={{ position: 'absolute', top: '50%', right: 16, transform: 'translateY(-50%)' }}>
          {/* Could add a small spinner here */}
        </Box>
      )}
    </Box>
  );
} 