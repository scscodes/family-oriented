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