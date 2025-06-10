// Academic subject definitions with colors
export const SUBJECTS = {
  'Language Arts': { color: '#ff6d00', icon: '📚' },
  'Mathematics': { color: '#4361ee', icon: '🔢' },
  'Social Studies': { color: '#64f7e7', icon: '🌍' },
  'Visual Arts': { color: '#ff5a5f', icon: '🎨' }
} as const;

// Tag categories for organized filtering
export const TAG_CATEGORIES = {
  'skill-type': ['counting', 'recognition', 'memory', 'logic', 'creativity', 'phonics', 'vocabulary', 'spatial-awareness'],
  'interaction': ['drag-drop', 'click', 'keyboard', 'voice', 'touch', 'gesture'],
  'difficulty': ['starter', 'easy', 'medium', 'challenging'],
  'duration': ['quick', 'short', 'medium', 'long'],
  'feature': ['audio', 'animation', 'multiplayer', 'adaptive', 'progressive'],
  'curriculum': ['common-core', 'early-learning', 'pre-k', 'kindergarten']
} as const;

// Core game interface with rich metadata
export interface Game {
  id: string;
  title: string;
  description: string;
  href: string;
  emoji: string;
  color: string;
  subject: keyof typeof SUBJECTS;
  
  // Rich metadata for filtering and discovery
  tags: string[];
  ageRange: [number, number];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // minutes
  learningObjectives: string[];
  prerequisites?: string[]; // IDs of prerequisite games
  
  // Content and feature flags
  hasAudio: boolean;
  hasVisuals: boolean;
  isInteractive: boolean;
  supportsMultiplayer: boolean;
  
  // Administrative metadata
  status: 'active' | 'beta' | 'coming-soon' | 'deprecated';
  lastUpdated: string;
  version: string;
}

// Filtering interface
export interface GameFilter {
  subjects?: string[];
  tags?: string[];
  ageRange?: [number, number];
  skillLevels?: string[];
  features?: string[];
  status?: string[];
}

// Dynamic grouping interface
export interface GameGroup {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  criteria: GameFilter;
  featured?: boolean;
}

// Autocomplete suggestion interface
export interface AutocompleteSuggestion {
  type: 'game' | 'tag' | 'objective';
  value: string;
  label: string;
  emoji?: string;
  subject?: keyof typeof SUBJECTS;
  count?: number;
  gameTitle?: string;
}

// Tag category data interface
export interface TagCategoryData {
  id: string;
  name: string;
  tags: TagData[];
}

// Individual tag data interface
export interface TagData {
  name: string;
  count: number;
  label: string;
}

// Facet filter interface for sidebar
export interface FacetFilter {
  ageRanges: string[];
  durations: string[];
  skillLevels: string[];
  features: string[];
}

// Sort options interface
export interface SortOptions {
  field: 'relevance' | 'skillLevel' | 'duration' | 'lastUpdated' | 'title';
  direction: 'asc' | 'desc';
}

// View preferences interface
export interface ViewPreferences {
  sortBy: SortOptions;
  viewType: 'grid' | 'list';
  resultsPerPage: number;
}

// Enhanced game filter including facets
export interface EnhancedGameFilter extends GameFilter {
  facets?: FacetFilter;
  sort?: SortOptions;
  query?: string;
}

// Flat game registry - all games in one array
export const GAMES: Game[] = [
  {
    id: 'numbers',
    title: 'Numbers',
    description: 'Learn to recognize numbers and count objects',
    href: '/games/numbers',
    emoji: '🔢',
    color: '#4361ee',
    subject: 'Mathematics',
    tags: ['counting', 'recognition', 'numbers', 'beginner'],
    ageRange: [3, 6],
    skillLevel: 'beginner',
    estimatedDuration: 10,
    learningObjectives: ['Number recognition', 'Counting skills', 'One-to-one correspondence'],
    hasAudio: true,
    hasVisuals: true,
    isInteractive: true,
    supportsMultiplayer: false,
    status: 'active',
    lastUpdated: '2024-01-15',
    version: '1.0.0'
  },
  {
    id: 'letters',
    title: 'Letters',
    description: 'Learn the alphabet and letter sounds',
    href: '/games/letters',
    emoji: '🔤',
    color: '#ff6d00',
    subject: 'Language Arts',
    tags: ['alphabet', 'phonics', 'recognition', 'beginner'],
    ageRange: [3, 7],
    skillLevel: 'beginner',
    estimatedDuration: 12,
    learningObjectives: ['Letter recognition', 'Phonetic awareness', 'Alphabet sequence'],
    hasAudio: true,
    hasVisuals: true,
    isInteractive: true,
    supportsMultiplayer: false,
    status: 'active',
    lastUpdated: '2024-01-15',
    version: '1.0.0'
  },
  {
    id: 'shapes',
    title: 'Shapes',
    description: 'Identify different shapes',
    href: '/games/shapes',
    emoji: '⭐',
    color: '#2ec4b6',
    subject: 'Visual Arts',
    tags: ['shapes', 'geometry', 'recognition', 'spatial-awareness'],
    ageRange: [3, 6],
    skillLevel: 'beginner',
    estimatedDuration: 8,
    learningObjectives: ['Shape recognition', 'Geometric understanding', 'Visual discrimination'],
    hasAudio: true,
    hasVisuals: true,
    isInteractive: true,
    supportsMultiplayer: false,
    status: 'active',
    lastUpdated: '2024-01-15',
    version: '1.0.0'
  },
  {
    id: 'shape-sorter',
    title: 'Shape Sorter',
    description: 'Drag shapes into the correct holes',
    href: '/games/shapes/sorter',
    emoji: '🔷',
    color: '#2ec4b6',
    subject: 'Visual Arts',
    tags: ['shapes', 'drag-drop', 'sorting', 'spatial-awareness', 'motor-skills'],
    ageRange: [3, 5],
    skillLevel: 'beginner',
    estimatedDuration: 6,
    learningObjectives: ['Fine motor skills', 'Shape matching', 'Problem solving'],
    prerequisites: ['shapes'],
    hasAudio: true,
    hasVisuals: true,
    isInteractive: true,
    supportsMultiplayer: false,
    status: 'active',
    lastUpdated: '2024-01-15',
    version: '1.0.0'
  },
  {
    id: 'colors',
    title: 'Colors',
    description: 'Recognize and match colors',
    href: '/games/colors',
    emoji: '🌈',
    color: '#ff5a5f',
    subject: 'Visual Arts',
    tags: ['colors', 'recognition', 'matching', 'visual-perception'],
    ageRange: [2, 5],
    skillLevel: 'beginner',
    estimatedDuration: 7,
    learningObjectives: ['Color recognition', 'Color naming', 'Visual discrimination'],
    hasAudio: true,
    hasVisuals: true,
    isInteractive: true,
    supportsMultiplayer: false,
    status: 'active',
    lastUpdated: '2024-01-15',
    version: '1.0.0'
  },
  {
    id: 'patterns',
    title: 'Patterns',
    description: 'Find the patterns and sequences',
    href: '/games/patterns',
    emoji: '📊',
    color: '#ffbe0b',
    subject: 'Visual Arts',
    tags: ['patterns', 'sequences', 'logic', 'prediction'],
    ageRange: [4, 7],
    skillLevel: 'intermediate',
    estimatedDuration: 12,
    learningObjectives: ['Pattern recognition', 'Logical thinking', 'Prediction skills'],
    hasAudio: true,
    hasVisuals: true,
    isInteractive: true,
    supportsMultiplayer: false,
    status: 'active',
    lastUpdated: '2024-01-15',
    version: '1.0.0'
  },
  {
    id: 'addition',
    title: 'Addition',
    description: 'Practice simple addition problems',
    href: '/games/math/addition',
    emoji: '➕',
    color: '#2ec4b6',
    subject: 'Mathematics',
    tags: ['addition', 'arithmetic', 'calculation', 'numbers'],
    ageRange: [5, 8],
    skillLevel: 'intermediate',
    estimatedDuration: 15,
    learningObjectives: ['Addition facts', 'Mathematical reasoning', 'Problem solving'],
    prerequisites: ['numbers'],
    hasAudio: true,
    hasVisuals: true,
    isInteractive: true,
    supportsMultiplayer: false,
    status: 'active',
    lastUpdated: '2024-01-15',
    version: '1.0.0'
  },
  {
    id: 'subtraction',
    title: 'Subtraction',
    description: 'Practice simple subtraction problems',
    href: '/games/math/subtraction',
    emoji: '➖',
    color: '#ffbe0b',
    subject: 'Mathematics',
    tags: ['subtraction', 'arithmetic', 'calculation', 'numbers'],
    ageRange: [5, 8],
    skillLevel: 'intermediate',
    estimatedDuration: 15,
    learningObjectives: ['Subtraction facts', 'Mathematical reasoning', 'Problem solving'],
    prerequisites: ['numbers', 'addition'],
    hasAudio: true,
    hasVisuals: true,
    isInteractive: true,
    supportsMultiplayer: false,
    status: 'active',
    lastUpdated: '2024-01-15',
    version: '1.0.0'
  },
  {
    id: 'fill-in-the-blank',
    title: 'Fill in the Blank',
    description: 'Complete the missing letters in words',
    href: '/games/fill-in-the-blank',
    emoji: '✏️',
    color: '#ff9e40',
    subject: 'Language Arts',
    tags: ['spelling', 'vocabulary', 'letters', 'word-completion'],
    ageRange: [5, 8],
    skillLevel: 'intermediate',
    estimatedDuration: 10,
    learningObjectives: ['Spelling skills', 'Word recognition', 'Letter-sound relationships'],
    prerequisites: ['letters'],
    hasAudio: true,
    hasVisuals: true,
    isInteractive: true,
    supportsMultiplayer: false,
    status: 'active',
    lastUpdated: '2024-01-15',
    version: '1.0.0'
  },
  {
    id: 'geography',
    title: 'Geography',
    description: 'Learn about continents and US states',
    href: '/games/geography',
    emoji: '🌍',
    color: '#64f7e7',
    subject: 'Social Studies',
    tags: ['geography', 'continents', 'states', 'world-knowledge'],
    ageRange: [6, 10],
    skillLevel: 'intermediate',
    estimatedDuration: 20,
    learningObjectives: ['Geographic knowledge', 'Spatial relationships', 'Cultural awareness'],
    hasAudio: true,
    hasVisuals: true,
    isInteractive: true,
    supportsMultiplayer: false,
    status: 'active',
    lastUpdated: '2024-01-15',
    version: '1.0.0'
  },
  {
    id: 'rhyming',
    title: 'Rhyming Words',
    description: 'Pick the word that rhymes!',
    href: '/games/rhyming',
    emoji: '🧩',
    color: '#64f7e7',
    subject: 'Language Arts',
    tags: ['rhyming', 'phonics', 'word-play', 'sound-patterns'],
    ageRange: [4, 7],
    skillLevel: 'intermediate',
    estimatedDuration: 8,
    learningObjectives: ['Phonological awareness', 'Sound patterns', 'Vocabulary expansion'],
    prerequisites: ['letters'],
    hasAudio: true,
    hasVisuals: true,
    isInteractive: true,
    supportsMultiplayer: false,
    status: 'active',
    lastUpdated: '2024-01-15',
    version: '1.0.0'
  },
  {
    id: 'alphabet-sequence',
    title: 'Alphabet Sequence',
    description: 'Memorize the alphabet order by finding missing letters',
    href: '/games/alphabet-sequence',
    emoji: '🔤',
    color: '#9381ff',
    subject: 'Language Arts',
    tags: ['alphabet', 'memory', 'sequence', 'order', 'beginner'],
    ageRange: [4, 7],
    skillLevel: 'beginner',
    estimatedDuration: 10,
    learningObjectives: ['Alphabet memorization', 'Sequential thinking', 'Letter recognition'],
    prerequisites: ['letters'],
    hasAudio: true,
    hasVisuals: true,
    isInteractive: true,
    supportsMultiplayer: false,
    status: 'active',
    lastUpdated: '2024-01-15',
    version: '1.0.0'
  },
  {
    id: 'number-sequence',
    title: 'Number Sequence',
    description: 'Memorize number order by finding missing numbers',
    href: '/games/number-sequence',
    emoji: '1️⃣',
    color: '#4361ee',
    subject: 'Mathematics',
    tags: ['numbers', 'memory', 'sequence', 'order', 'counting'],
    ageRange: [4, 7],
    skillLevel: 'beginner',
    estimatedDuration: 10,
    learningObjectives: ['Number sequence memorization', 'Sequential counting', 'Number recognition'],
    prerequisites: ['numbers'],
    hasAudio: true,
    hasVisuals: true,
    isInteractive: true,
    supportsMultiplayer: false,
    status: 'active',
    lastUpdated: '2024-01-15',
    version: '1.0.0'
  }
];

// Predefined dynamic groupings
export const GAME_GROUPINGS: GameGroup[] = [
  {
    id: 'math-basics',
    title: 'Math Fundamentals',
    description: 'Essential math skills for early learners',
    emoji: '🔢',
    color: '#4361ee',
    criteria: { 
      subjects: ['Mathematics'], 
      skillLevels: ['beginner'] 
    },
    featured: true
  },
  {
    id: 'language-foundation',
    title: 'Language Building Blocks',
    description: 'Core language and literacy skills',
    emoji: '📚',
    color: '#ff6d00',
    criteria: { 
      subjects: ['Language Arts'], 
      skillLevels: ['beginner'] 
    },
    featured: true
  },
  {
    id: 'quick-games',
    title: 'Quick Play',
    description: 'Games that can be completed in under 10 minutes',
    emoji: '⚡',
    color: '#2ec4b6',
    criteria: { 
      tags: ['quick'] 
    }
  },
  {
    id: 'interactive-play',
    title: 'Interactive Adventures',
    description: 'Hands-on games with rich interactions',
    emoji: '🎮',
    color: '#ff5a5f',
    criteria: { 
      tags: ['drag-drop', 'interactive'] 
    }
  },
  {
    id: 'visual-arts',
    title: 'Creative & Visual',
    description: 'Games focusing on visual skills and creativity',
    emoji: '🎨',
    color: '#ff5a5f',
    criteria: { 
      subjects: ['Visual Arts'] 
    },
    featured: true
  },
  {
    id: 'advanced-learners',
    title: 'Challenge Mode',
    description: 'Advanced games for confident learners',
    emoji: '🏆',
    color: '#9381ff',
    criteria: { 
      skillLevels: ['intermediate', 'advanced'] 
    }
  }
];

// Game discovery and filtering engine
export class GameDiscoveryEngine {
  private games: Game[];
  
  constructor(games: Game[] = GAMES) {
    this.games = games;
  }
  
  /**
   * Search games with text query and filters
   */
  search(query: string = '', filters: GameFilter = {}): Game[] {
    let results = [...this.games];
    
    // Filter by status (default to active only)
    if (!filters.status) {
      results = results.filter(game => game.status === 'active');
    } else {
      results = results.filter(game => filters.status!.includes(game.status));
    }
    
    // Text search
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      results = results.filter(game => 
        game.title.toLowerCase().includes(searchTerm) ||
        game.description.toLowerCase().includes(searchTerm) ||
        game.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        game.learningObjectives.some(obj => obj.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply filters
    if (filters.subjects?.length) {
      results = results.filter(g => filters.subjects!.includes(g.subject));
    }
    
    if (filters.tags?.length) {
      results = results.filter(g => 
        filters.tags!.some(tag => g.tags.includes(tag))
      );
    }
    
    if (filters.ageRange) {
      const [minAge, maxAge] = filters.ageRange;
      results = results.filter(g => 
        g.ageRange[0] <= maxAge && g.ageRange[1] >= minAge
      );
    }
    
    if (filters.skillLevels?.length) {
      results = results.filter(g => filters.skillLevels!.includes(g.skillLevel));
    }
    
    if (filters.features?.length) {
      results = results.filter(g => filters.features!.every(feature => 
        (feature === 'audio' && g.hasAudio) ||
        (feature === 'multiplayer' && g.supportsMultiplayer) ||
        (feature === 'interactive' && g.isInteractive) ||
        g.tags.includes(feature)
      ));
    }
    
    return results;
  }
  
  /**
   * Get games for a specific grouping
   */
  getGamesForGroup(groupId: string): Game[] {
    const group = GAME_GROUPINGS.find(g => g.id === groupId);
    if (!group) return [];
    
    return this.search('', group.criteria);
  }
  
  /**
   * Get games by subject
   */
  getGamesBySubject(subject: keyof typeof SUBJECTS): Game[] {
    return this.search('', { subjects: [subject] });
  }
  
  /**
   * Get featured games
   */
  getFeaturedGames(): Game[] {
    const featuredGroups = GAME_GROUPINGS.filter(g => g.featured);
    const featuredGameIds = new Set<string>();
    
    featuredGroups.forEach(group => {
      const games = this.getGamesForGroup(group.id);
      games.slice(0, 2).forEach(game => featuredGameIds.add(game.id)); // Max 2 per group
    });
    
    return Array.from(featuredGameIds).map(id => this.games.find(g => g.id === id)!);
  }
  
  /**
   * Get available filter facets based on current results
   */
  getFacets(currentFilters: GameFilter = {}): Record<string, unknown> {
    const filteredGames = this.search('', currentFilters);
    
    return {
      subjects: this.buildFacet(filteredGames, 'subject'),
      skillLevels: this.buildFacet(filteredGames, 'skillLevel'),
      tags: this.buildTagFacets(filteredGames),
      ageRanges: this.buildAgeRangeFacets(filteredGames)
    };
  }

  /**
   * Get autocomplete suggestions based on search query
   * Returns suggestions from game titles, tags, and learning objectives
   */
  getAutocompleteSuggestions(query: string, limit: number = 8): AutocompleteSuggestion[] {
    if (!query.trim()) return [];
    
    const suggestions: AutocompleteSuggestion[] = [];
    const queryLower = query.toLowerCase();
    const seen = new Set<string>();

    // Game titles
    this.games.forEach(game => {
      if (game.title.toLowerCase().includes(queryLower) && !seen.has(game.title)) {
        suggestions.push({
          type: 'game',
          value: game.title,
          label: game.title,
          emoji: game.emoji,
          subject: game.subject
        });
        seen.add(game.title);
      }
    });

    // Popular tags
    const allTags = this.games.flatMap(game => game.tags);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(tagCounts)
      .filter(([tag]) => tag.toLowerCase().includes(queryLower) && !seen.has(tag))
      .sort(([, a], [, b]) => b - a) // Sort by popularity
      .forEach(([tag]) => {
        suggestions.push({
          type: 'tag',
          value: tag,
          label: `#${tag}`,
          count: tagCounts[tag]
        });
        seen.add(tag);
      });

    // Learning objectives
    this.games.forEach(game => {
      game.learningObjectives.forEach(objective => {
        if (objective.toLowerCase().includes(queryLower) && !seen.has(objective)) {
          suggestions.push({
            type: 'objective',
            value: objective,
            label: objective,
            gameTitle: game.title
          });
          seen.add(objective);
        }
      });
    });

    return suggestions.slice(0, limit);
  }

  /**
   * Get all available tags grouped by category with counts
   */
  getTagsByCategory(currentFilters: GameFilter = {}): TagCategoryData[] {
    const filteredGames = this.search('', currentFilters);
    const allTags = filteredGames.flatMap(game => game.tags);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(TAG_CATEGORIES).map(([categoryKey, categoryTags]) => ({
      id: categoryKey,
      name: this.formatCategoryName(categoryKey),
      tags: categoryTags
        .filter(tag => tagCounts[tag] > 0)
        .map(tag => ({
          name: tag,
          count: tagCounts[tag],
          label: this.formatTagLabel(tag)
        }))
        .sort((a, b) => b.count - a.count)
    })).filter(category => category.tags.length > 0);
  }

  /**
   * Format category name for display
   */
  private formatCategoryName(categoryKey: string): string {
    const nameMap: Record<string, string> = {
      'skill-type': 'Skills',
      'interaction': 'Interaction',
      'difficulty': 'Difficulty',
      'duration': 'Duration',
      'feature': 'Features',
      'curriculum': 'Curriculum'
    };
    return nameMap[categoryKey] || categoryKey;
  }

  /**
   * Format tag label for display
   */
  private formatTagLabel(tag: string): string {
    return tag.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  /**
   * Enhanced search with facet filtering and sorting
   */
  searchWithFacets(query: string = '', filters: EnhancedGameFilter = {}): Game[] {
    let results = this.search(query, filters);

    // Apply facet filters
    if (filters.facets) {
      results = this.applyFacetFilters(results, filters.facets);
    }

    // Apply sorting
    if (filters.sort) {
      results = this.sortGames(results, filters.sort, query);
    }

    return results;
  }

  /**
   * Apply facet filters to game results
   */
  private applyFacetFilters(games: Game[], facets: FacetFilter): Game[] {
    let filtered = games;

    // Age range filtering
    if (facets.ageRanges.length > 0) {
      filtered = filtered.filter(game => {
        return facets.ageRanges.some(range => {
          const [minAge, maxAge] = this.parseAgeRange(range);
          return game.ageRange[0] <= maxAge && game.ageRange[1] >= minAge;
        });
      });
    }

    // Duration filtering
    if (facets.durations.length > 0) {
      filtered = filtered.filter(game => {
        return facets.durations.some(duration => {
          const [minDuration, maxDuration] = this.parseDurationRange(duration);
          return game.estimatedDuration >= minDuration && game.estimatedDuration <= maxDuration;
        });
      });
    }

    // Skill level filtering
    if (facets.skillLevels.length > 0) {
      filtered = filtered.filter(game => 
        facets.skillLevels.includes(game.skillLevel)
      );
    }

    // Features filtering
    if (facets.features.length > 0) {
      filtered = filtered.filter(game => {
        return facets.features.every(feature => {
          switch (feature) {
            case 'audio':
              return game.hasAudio;
            case 'multiplayer':
              return game.supportsMultiplayer;
            case 'interactive':
              return game.isInteractive;
            case 'visuals':
              return game.hasVisuals;
            default:
              return game.tags.includes(feature);
          }
        });
      });
    }

    return filtered;
  }

  /**
   * Sort games based on criteria
   */
  private sortGames(games: Game[], sort: SortOptions, query: string = ''): Game[] {
    const sorted = [...games];

    switch (sort.field) {
      case 'relevance':
        return this.sortByRelevance(sorted, query);
      
      case 'skillLevel':
        return sorted.sort((a, b) => {
          const skillOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
          const comparison = skillOrder[a.skillLevel] - skillOrder[b.skillLevel];
          return sort.direction === 'desc' ? -comparison : comparison;
        });
      
      case 'duration':
        return sorted.sort((a, b) => {
          const comparison = a.estimatedDuration - b.estimatedDuration;
          return sort.direction === 'desc' ? -comparison : comparison;
        });
      
      case 'lastUpdated':
        return sorted.sort((a, b) => {
          const comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
          return sort.direction === 'desc' ? -comparison : comparison;
        });
      
      case 'title':
        return sorted.sort((a, b) => {
          const comparison = a.title.localeCompare(b.title);
          return sort.direction === 'desc' ? -comparison : comparison;
        });
      
      default:
        return sorted;
    }
  }

  /**
   * Sort by relevance based on search query
   */
  private sortByRelevance(games: Game[], query: string): Game[] {
    if (!query.trim()) {
      // If no query, sort by popularity (tag count) and then alphabetically
      return games.sort((a, b) => {
        const aPopularity = a.tags.length;
        const bPopularity = b.tags.length;
        if (aPopularity !== bPopularity) {
          return bPopularity - aPopularity;
        }
        return a.title.localeCompare(b.title);
      });
    }

    const queryLower = query.toLowerCase();
    
    return games.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Title exact match (highest priority)
      if (a.title.toLowerCase() === queryLower) scoreA += 100;
      if (b.title.toLowerCase() === queryLower) scoreB += 100;

      // Title starts with query
      if (a.title.toLowerCase().startsWith(queryLower)) scoreA += 50;
      if (b.title.toLowerCase().startsWith(queryLower)) scoreB += 50;

      // Title contains query
      if (a.title.toLowerCase().includes(queryLower)) scoreA += 25;
      if (b.title.toLowerCase().includes(queryLower)) scoreB += 25;

      // Tag exact match
      if (a.tags.some(tag => tag.toLowerCase() === queryLower)) scoreA += 20;
      if (b.tags.some(tag => tag.toLowerCase() === queryLower)) scoreB += 20;

      // Tag contains query
      if (a.tags.some(tag => tag.toLowerCase().includes(queryLower))) scoreA += 10;
      if (b.tags.some(tag => tag.toLowerCase().includes(queryLower))) scoreB += 10;

      // Learning objectives contain query
      if (a.learningObjectives.some(obj => obj.toLowerCase().includes(queryLower))) scoreA += 5;
      if (b.learningObjectives.some(obj => obj.toLowerCase().includes(queryLower))) scoreB += 5;

      // Description contains query
      if (a.description.toLowerCase().includes(queryLower)) scoreA += 2;
      if (b.description.toLowerCase().includes(queryLower)) scoreB += 2;

      return scoreB - scoreA;
    });
  }

  /**
   * Parse age range string to min/max values
   */
  private parseAgeRange(range: string): [number, number] {
    const rangeMap: Record<string, [number, number]> = {
      '2-3': [2, 3],
      '3-4': [3, 4],
      '4-5': [4, 5],
      '5-6': [5, 6],
      '6+': [6, 10]
    };
    return rangeMap[range] || [0, 10];
  }

  /**
   * Parse duration range string to min/max values (in minutes)
   */
  private parseDurationRange(range: string): [number, number] {
    const rangeMap: Record<string, [number, number]> = {
      'quick': [0, 5],
      'short': [5, 10],
      'medium': [10, 15],
      'long': [15, 60]
    };
    return rangeMap[range] || [0, 60];
  }

  /**
   * Get facet options with counts for sidebar
   */
  getFacetOptions(currentFilters: EnhancedGameFilter = {}): {
    ageRanges: Array<{range: string, label: string, count: number}>;
    durations: Array<{range: string, label: string, count: number}>;
    skillLevels: Array<{level: string, label: string, count: number}>;
    features: Array<{feature: string, label: string, count: number}>;
  } {
    const baseGames = this.search(currentFilters.query || '', currentFilters);

    return {
      ageRanges: [
        { range: '2-3', label: '2-3 years', count: this.countGamesInAgeRange(baseGames, '2-3') },
        { range: '3-4', label: '3-4 years', count: this.countGamesInAgeRange(baseGames, '3-4') },
        { range: '4-5', label: '4-5 years', count: this.countGamesInAgeRange(baseGames, '4-5') },
        { range: '5-6', label: '5-6 years', count: this.countGamesInAgeRange(baseGames, '5-6') },
        { range: '6+', label: '6+ years', count: this.countGamesInAgeRange(baseGames, '6+') }
      ].filter(item => item.count > 0),

      durations: [
        { range: 'quick', label: 'Quick (≤5 min)', count: this.countGamesInDurationRange(baseGames, 'quick') },
        { range: 'short', label: 'Short (5-10 min)', count: this.countGamesInDurationRange(baseGames, 'short') },
        { range: 'medium', label: 'Medium (10-15 min)', count: this.countGamesInDurationRange(baseGames, 'medium') },
        { range: 'long', label: 'Long (15+ min)', count: this.countGamesInDurationRange(baseGames, 'long') }
      ].filter(item => item.count > 0),

      skillLevels: [
        { level: 'beginner', label: 'Beginner', count: this.countGamesBySkillLevel(baseGames, 'beginner') },
        { level: 'intermediate', label: 'Intermediate', count: this.countGamesBySkillLevel(baseGames, 'intermediate') },
        { level: 'advanced', label: 'Advanced', count: this.countGamesBySkillLevel(baseGames, 'advanced') }
      ].filter(item => item.count > 0),

      features: [
        { feature: 'audio', label: 'Audio Support', count: this.countGamesByFeature(baseGames, 'audio') },
        { feature: 'interactive', label: 'Interactive', count: this.countGamesByFeature(baseGames, 'interactive') },
        { feature: 'visuals', label: 'Rich Visuals', count: this.countGamesByFeature(baseGames, 'visuals') },
        { feature: 'multiplayer', label: 'Multiplayer', count: this.countGamesByFeature(baseGames, 'multiplayer') }
      ].filter(item => item.count > 0)
    };
  }

  /**
   * Helper methods for counting games by facet criteria
   */
  private countGamesInAgeRange(games: Game[], range: string): number {
    const [minAge, maxAge] = this.parseAgeRange(range);
    return games.filter(game => 
      game.ageRange[0] <= maxAge && game.ageRange[1] >= minAge
    ).length;
  }

  private countGamesInDurationRange(games: Game[], range: string): number {
    const [minDuration, maxDuration] = this.parseDurationRange(range);
    return games.filter(game => 
      game.estimatedDuration >= minDuration && game.estimatedDuration <= maxDuration
    ).length;
  }

  private countGamesBySkillLevel(games: Game[], level: string): number {
    return games.filter(game => game.skillLevel === level).length;
  }

  private countGamesByFeature(games: Game[], feature: string): number {
    return games.filter(game => {
      switch (feature) {
        case 'audio': return game.hasAudio;
        case 'interactive': return game.isInteractive;
        case 'visuals': return game.hasVisuals;
        case 'multiplayer': return game.supportsMultiplayer;
        default: return false;
      }
    }).length;
  }
  
  private buildFacet(games: Game[], field: keyof Game) {
    const counts = games.reduce((acc, game) => {
      const value = game[field] as string;
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
  }
  
  private buildTagFacets(games: Game[]) {
    const tagCounts = games.reduce((acc, game) => {
      game.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }
  
  private buildAgeRangeFacets(games: Game[]) {
    const ranges = [
      { label: '2-3 years', min: 2, max: 3 },
      { label: '3-4 years', min: 3, max: 4 },
      { label: '4-5 years', min: 4, max: 5 },
      { label: '5-6 years', min: 5, max: 6 },
      { label: '6+ years', min: 6, max: 10 }
    ];
    
    return ranges.map(range => ({
      ...range,
      count: games.filter(g => 
        g.ageRange[0] <= range.max && g.ageRange[1] >= range.min
      ).length
    })).filter(range => range.count > 0);
  }
}

// Create global instance
export const gameDiscovery = new GameDiscoveryEngine();

// Utility functions for backward compatibility and convenience
export const GameUtils = {
  /**
   * Get all games grouped by subject (for compatibility)
   */
  getGamesBySubjects(): Record<string, Game[]> {
    return Object.keys(SUBJECTS).reduce((acc, subject) => {
      acc[subject] = gameDiscovery.getGamesBySubject(subject as keyof typeof SUBJECTS);
      return acc;
    }, {} as Record<string, Game[]>);
  },
  
  /**
   * Get game count by subject
   */
  getGameCountBySubject(subject: keyof typeof SUBJECTS): number {
    return gameDiscovery.getGamesBySubject(subject).length;
  },
  
  /**
   * Find game by ID
   */
  getGameById(id: string): Game | undefined {
    return GAMES.find(game => game.id === id);
  },
  
  /**
   * Get prerequisites for a game
   */
  getGamePrerequisites(gameId: string): Game[] {
    const game = this.getGameById(gameId);
    if (!game?.prerequisites) return [];
    
    return game.prerequisites
      .map(id => this.getGameById(id))
      .filter(Boolean) as Game[];
  }
};

// Legacy compatibility exports (will be deprecated)
export interface GameData {
  title: string;
  description: string;
  href: string;
  emoji: string;
  color: string;
}

export interface CategoryData {
  key: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  subject: string;
  subgames: GameData[];
}

/**
 * @deprecated Use GAMES and gameDiscovery instead
 * Legacy compatibility - converts flat games back to old nested structure
 */
export const GAME_CATEGORIES: CategoryData[] = Object.keys(SUBJECTS).map(subject => {
  const subjectGames = gameDiscovery.getGamesBySubject(subject as keyof typeof SUBJECTS);
  
  return {
    key: subject.toLowerCase().replace(/\s+/g, '-'),
    title: subject,
    description: `${subject} games and activities`,
    emoji: SUBJECTS[subject as keyof typeof SUBJECTS].icon,
    color: SUBJECTS[subject as keyof typeof SUBJECTS].color,
    subject: subject,
    subgames: subjectGames.map(game => ({
      title: game.title,
      description: game.description,
      href: game.href,
      emoji: game.emoji,
      color: game.color
    }))
  };
});