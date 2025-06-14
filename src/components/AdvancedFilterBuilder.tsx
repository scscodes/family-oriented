"use client";

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import FilterListIcon from '@mui/icons-material/FilterList';
import { gameDiscovery, EnhancedGameFilter } from '@/utils/gameData';

interface FilterRule {
  id: string;
  field: 'subject' | 'tag' | 'ageRange' | 'skillLevel' | 'feature' | 'duration';
  operator: 'equals' | 'contains' | 'in' | 'between';
  value: string | string[] | number[];
  logic: 'AND' | 'OR';
}

interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  rules: FilterRule[];
  createdAt: Date;
}

interface AdvancedFilterBuilderProps {
  currentFilters: EnhancedGameFilter;
  onFiltersChange: (filters: EnhancedGameFilter) => void;
}

/**
 * Advanced Filter Builder with complex query logic, presets, and natural language support
 */
export default function AdvancedFilterBuilder({
  currentFilters,
  onFiltersChange
}: AdvancedFilterBuilderProps) {
  const [open, setOpen] = useState(false);
  const [rules, setRules] = useState<FilterRule[]>([]);
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState('');
  const [presetsMenuAnchor, setPresetsMenuAnchor] = useState<null | HTMLElement>(null);

  // Load saved presets from localStorage
  useEffect(() => {
    try {
      const savedPresets = localStorage.getItem('gameFilterPresets');
      if (savedPresets) {
        const parsedPresets = JSON.parse(savedPresets).map((preset: FilterPreset & { createdAt: string }) => ({
          ...preset,
          createdAt: new Date(preset.createdAt)
        }));
        setPresets(parsedPresets);
      }
    } catch (error) {
      console.warn('Failed to load filter presets:', error);
    }
  }, []);

  // Save presets to localStorage
  const savePresets = (newPresets: FilterPreset[]) => {
    try {
      localStorage.setItem('gameFilterPresets', JSON.stringify(newPresets));
      setPresets(newPresets);
    } catch (error) {
      console.warn('Failed to save filter presets:', error);
    }
  };

  // Add a new filter rule
  const addRule = () => {
    const newRule: FilterRule = {
      id: `rule_${Date.now()}`,
      field: 'subject',
      operator: 'equals',
      value: '',
      logic: 'AND'
    };
    setRules([...rules, newRule]);
  };

  // Update a filter rule
  const updateRule = (ruleId: string, updates: Partial<FilterRule>) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  // Remove a filter rule
  const removeRule = (ruleId: string) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
  };

  // Convert rules to EnhancedGameFilter
  const rulesToFilters = (filterRules: FilterRule[]): EnhancedGameFilter => {
    const filters: EnhancedGameFilter = {
      ...currentFilters,
      subjects: [],
      tags: [],
      facets: {
        ageRanges: [],
        durations: [],
        skillLevels: [],
        features: []
      }
    };

    filterRules.forEach(rule => {
      switch (rule.field) {
        case 'subject':
          if (Array.isArray(rule.value)) {
            filters.subjects = [...(filters.subjects || []), ...(rule.value as string[])];
          } else if (rule.value) {
            filters.subjects = [...(filters.subjects || []), rule.value as string];
          }
          break;
        case 'tag':
          if (Array.isArray(rule.value)) {
            filters.tags = [...(filters.tags || []), ...(rule.value as string[])];
          } else if (rule.value) {
            filters.tags = [...(filters.tags || []), rule.value as string];
          }
          break;
        case 'skillLevel':
          if (Array.isArray(rule.value)) {
            filters.facets!.skillLevels = [...filters.facets!.skillLevels, ...(rule.value as string[])];
          } else if (rule.value) {
            filters.facets!.skillLevels = [...filters.facets!.skillLevels, rule.value as string];
          }
          break;
        case 'feature':
          if (Array.isArray(rule.value)) {
            filters.facets!.features = [...filters.facets!.features, ...(rule.value as string[])];
          } else if (rule.value) {
            filters.facets!.features = [...filters.facets!.features, rule.value as string];
          }
          break;
        case 'duration':
          if (Array.isArray(rule.value)) {
            filters.facets!.durations = [...filters.facets!.durations, ...(rule.value as string[])];
          } else if (rule.value) {
            filters.facets!.durations = [...filters.facets!.durations, rule.value as string];
          }
          break;
        case 'ageRange':
          if (Array.isArray(rule.value) && rule.value.length === 2) {
            filters.ageRange = rule.value as [number, number];
          }
          break;
      }
    });

    // Remove duplicates
    if (filters.subjects) filters.subjects = [...new Set(filters.subjects)];
    if (filters.tags) filters.tags = [...new Set(filters.tags)];
    if (filters.facets) {
      filters.facets.skillLevels = [...new Set(filters.facets.skillLevels)];
      filters.facets.features = [...new Set(filters.facets.features)];
      filters.facets.durations = [...new Set(filters.facets.durations)];
      filters.facets.ageRanges = [...new Set(filters.facets.ageRanges)];
    }

    return filters;
  };

  // Apply current rules as filters
  const applyRules = () => {
    const newFilters = rulesToFilters(rules);
    onFiltersChange(newFilters);
    setOpen(false);
  };

  // Parse natural language query
  const parseNaturalLanguage = () => {
    const parsed = gameDiscovery.parseNaturalLanguageQuery(naturalLanguageQuery);
    const newRules: FilterRule[] = [];

    if (parsed.subject) {
      newRules.push({
        id: `rule_${Date.now()}_subject`,
        field: 'subject',
        operator: 'equals',
        value: parsed.subject,
        logic: 'AND'
      });
    }

    if (parsed.skillLevel) {
      newRules.push({
        id: `rule_${Date.now()}_skill`,
        field: 'skillLevel',
        operator: 'equals',
        value: parsed.skillLevel,
        logic: 'AND'
      });
    }

    if (parsed.duration) {
      newRules.push({
        id: `rule_${Date.now()}_duration`,
        field: 'duration',
        operator: 'equals',
        value: parsed.duration,
        logic: 'AND'
      });
    }

    if (parsed.features && parsed.features.length > 0) {
      newRules.push({
        id: `rule_${Date.now()}_features`,
        field: 'feature',
        operator: 'in',
        value: parsed.features,
        logic: 'AND'
      });
    }

    if (parsed.ageRange) {
      newRules.push({
        id: `rule_${Date.now()}_age`,
        field: 'ageRange',
        operator: 'between',
        value: parsed.ageRange,
        logic: 'AND'
      });
    }

    setRules(newRules);
    setNaturalLanguageQuery('');
  };

  // Save current rules as preset
  const savePreset = () => {
    if (!presetName.trim()) return;

    const newPreset: FilterPreset = {
      id: `preset_${Date.now()}`,
      name: presetName.trim(),
      description: presetDescription.trim(),
      rules: [...rules],
      createdAt: new Date()
    };

    const newPresets = [...presets, newPreset];
    savePresets(newPresets);
    
    setPresetName('');
    setPresetDescription('');
    setSaveDialogOpen(false);
  };

  // Load a preset
  const loadPreset = (preset: FilterPreset) => {
    setRules([...preset.rules]);
    setPresetsMenuAnchor(null);
  };

  // Delete a preset
  const deletePreset = (presetId: string) => {
    const newPresets = presets.filter(p => p.id !== presetId);
    savePresets(newPresets);
  };

  // Get field options
  const getFieldOptions = (field: string) => {
    switch (field) {
      case 'subject':
        return ['Mathematics', 'Language Arts', 'Visual Arts', 'Social Studies'];
      case 'skillLevel':
        return ['beginner', 'intermediate', 'advanced'];
      case 'feature':
        return ['audio', 'interactive', 'visuals', 'multiplayer'];
      case 'duration':
        return ['quick', 'short', 'medium', 'long'];
      case 'tag':
        // Get all available tags
        const allTags = gameDiscovery.getTagsByCategory();
        return allTags.flatMap(category => category.tags.map(tag => tag.name));
      default:
        return [];
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <Tooltip title="Advanced Filter Builder">
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => setOpen(true)}
          sx={{ textTransform: 'none' }}
        >
          Advanced Filters
        </Button>
      </Tooltip>

      {/* Main Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '70vh' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon />
          Advanced Filter Builder
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<BookmarkIcon />}
              onClick={(e) => setPresetsMenuAnchor(e.currentTarget)}
            >
              Presets
            </Button>
            <Button
              size="small"
              startIcon={<SaveIcon />}
              onClick={() => setSaveDialogOpen(true)}
              disabled={rules.length === 0}
            >
              Save
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Natural Language Query */}
          <Accordion sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SmartToyIcon />
                <Typography>Natural Language Query</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Alert severity="info" sx={{ mb: 2 }}>
                Try queries like: &quot;beginner math games under 10 minutes with audio&quot; or &quot;intermediate visual arts games for 5-6 year olds&quot;
              </Alert>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Describe the games you're looking for..."
                  value={naturalLanguageQuery}
                  onChange={(e) => setNaturalLanguageQuery(e.target.value)}
                  multiline
                  rows={2}
                />
                <Button
                  variant="contained"
                  onClick={parseNaturalLanguage}
                  disabled={!naturalLanguageQuery.trim()}
                  sx={{ minWidth: 120 }}
                >
                  Parse
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Filter Rules */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Filter Rules</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={addRule}
                variant="outlined"
                size="small"
              >
                Add Rule
              </Button>
            </Box>

            {rules.length === 0 ? (
              <Alert severity="info">
                No filter rules defined. Add a rule or use natural language query to get started.
              </Alert>
            ) : (
              rules.map((rule, index) => (
                <Box key={rule.id} sx={{ 
                  p: 2, 
                  border: '1px solid', 
                  borderColor: 'divider', 
                  borderRadius: 1, 
                  mb: 2,
                  backgroundColor: 'background.paper'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    {index > 0 && (
                      <FormControl size="small" sx={{ minWidth: 80 }}>
                        <InputLabel>Logic</InputLabel>
                        <Select
                          value={rule.logic}
                          label="Logic"
                          onChange={(e) => updateRule(rule.id, { logic: e.target.value as 'AND' | 'OR' })}
                        >
                          <MenuItem value="AND">AND</MenuItem>
                          <MenuItem value="OR">OR</MenuItem>
                        </Select>
                      </FormControl>
                    )}

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Field</InputLabel>
                      <Select
                        value={rule.field}
                        label="Field"
                        onChange={(e) => updateRule(rule.id, { 
                          field: e.target.value as FilterRule['field'],
                          value: '' // Reset value when field changes
                        })}
                      >
                        <MenuItem value="subject">Subject</MenuItem>
                        <MenuItem value="tag">Tag</MenuItem>
                        <MenuItem value="skillLevel">Skill Level</MenuItem>
                        <MenuItem value="feature">Feature</MenuItem>
                        <MenuItem value="duration">Duration</MenuItem>
                        <MenuItem value="ageRange">Age Range</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <InputLabel>Operator</InputLabel>
                      <Select
                        value={rule.operator}
                        label="Operator"
                        onChange={(e) => updateRule(rule.id, { operator: e.target.value as FilterRule['operator'] })}
                      >
                        <MenuItem value="equals">Equals</MenuItem>
                        <MenuItem value="contains">Contains</MenuItem>
                        <MenuItem value="in">In</MenuItem>
                        {rule.field === 'ageRange' && <MenuItem value="between">Between</MenuItem>}
                      </Select>
                    </FormControl>

                    <Box sx={{ flex: 1 }}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Value</InputLabel>
                        <Select
                          value={rule.value as string}
                          label="Value"
                          onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                        >
                          {getFieldOptions(rule.field).map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeRule(rule.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))
            )}
          </Box>

          {/* Preview */}
          {rules.length > 0 && (
            <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Filter Preview:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {rules.map((rule, index) => (
                  <span key={rule.id}>
                    {index > 0 && ` ${rule.logic} `}
                    <strong>{rule.field}</strong> {rule.operator} <em>{
                      Array.isArray(rule.value) ? rule.value.join(', ') : rule.value
                    }</em>
                  </span>
                ))}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={applyRules}
            disabled={rules.length === 0}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Presets Menu */}
      <Menu
        anchorEl={presetsMenuAnchor}
        open={Boolean(presetsMenuAnchor)}
        onClose={() => setPresetsMenuAnchor(null)}
      >
        {presets.length === 0 ? (
          <MenuItem disabled>No saved presets</MenuItem>
        ) : (
          presets.map((preset) => (
            <MenuItem key={preset.id}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Box onClick={() => loadPreset(preset)} sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {preset.name}
                  </Typography>
                  {preset.description && (
                    <Typography variant="caption" color="text.secondary">
                      {preset.description}
                    </Typography>
                  )}
                </Box>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePreset(preset.id);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>

      {/* Save Preset Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Filter Preset</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Preset Name"
            fullWidth
            variant="outlined"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            value={presetDescription}
            onChange={(e) => setPresetDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={savePreset}
            variant="contained"
            disabled={!presetName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 