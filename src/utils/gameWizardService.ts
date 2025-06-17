import { gameDiscovery, Game, EnhancedGameFilter } from './gameData';
import { createClient } from '@/lib/supabase/client';
import { analyticsService } from './analyticsService';
import { logger } from './logger';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  type: 'age' | 'interests' | 'time' | 'goals';
  options: WizardOption[];
}

interface WizardOption {
  id: string;
  label: string;
  value: string | number | boolean | number[];
  icon?: string;
  description?: string;
}

interface WizardSession {
  id: string;
  avatarId: string;
  query?: string;
  parsedFilters?: Record<string, unknown>;
  selectedGames?: string[];
  completionRate?: number;
  createdAt: Date;
  completedAt?: Date;
}

export class GameWizardService {
  private supabase = createClient();
  private readonly steps: WizardStep[] = [
    {
      id: 'age',
      title: 'Age Range',
      description: 'Select the age range for the games',
      type: 'age',
      options: [
        { id: '2-3', label: '2-3 years', value: [2, 3], icon: '👶' },
        { id: '3-4', label: '3-4 years', value: [3, 4], icon: '🧒' },
        { id: '4-5', label: '4-5 years', value: [4, 5], icon: '👦' },
        { id: '5-6', label: '5-6 years', value: [5, 6], icon: '👧' },
        { id: '6+', label: '6+ years', value: [6, 10], icon: '🧑' }
      ]
    },
    {
      id: 'interests',
      title: 'Learning Interests',
      description: 'What subjects are you interested in?',
      type: 'interests',
      options: [
        { id: 'math', label: 'Mathematics', value: 'Mathematics', icon: '🔢' },
        { id: 'reading', label: 'Reading & Writing', value: 'Language Arts', icon: '📚' },
        { id: 'science', label: 'Science', value: 'Science', icon: '🔬' },
        { id: 'social', label: 'Social Studies', value: 'Social Studies', icon: '🌍' },
        { id: 'art', label: 'Art & Music', value: 'Arts', icon: '🎨' }
      ]
    },
    {
      id: 'time',
      title: 'Available Time',
      description: 'How much time do you have?',
      type: 'time',
      options: [
        { id: 'quick', label: 'Quick (≤5 min)', value: 'quick', icon: '⚡' },
        { id: 'short', label: 'Short (5-10 min)', value: 'short', icon: '⏱️' },
        { id: 'medium', label: 'Medium (10-15 min)', value: 'medium', icon: '⌛' },
        { id: 'long', label: 'Long (15+ min)', value: 'long', icon: '⏳' }
      ]
    },
    {
      id: 'goals',
      title: 'Learning Goals',
      description: 'What would you like to focus on?',
      type: 'goals',
      options: [
        { id: 'beginner', label: 'Beginner Skills', value: 'beginner', icon: '🌱' },
        { id: 'intermediate', label: 'Intermediate Skills', value: 'intermediate', icon: '🌿' },
        { id: 'advanced', label: 'Advanced Skills', value: 'advanced', icon: '🌳' }
      ]
    }
  ];

  /**
   * Start a new wizard session
   */
  async startSession(avatarId: string, selections?: Record<string, unknown>): Promise<WizardSession> {
    try {
      // Create a session ID for now
      const sessionId = `wizard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Validate and clean avatar ID
      const cleanAvatarId = avatarId || `temp_${Date.now()}`;
      
      logger.info('Starting wizard session:', { sessionId, avatarId: cleanAvatarId, selections });

      // Track wizard start with error handling
      try {
        await analyticsService.trackEvent(sessionId, cleanAvatarId, 'wizard_start', {
          timestamp: new Date().toISOString(),
          selections: selections || {},
          isTemporaryAvatar: cleanAvatarId.startsWith('temp_')
        });
      } catch (analyticsError) {
        logger.warn('Failed to track wizard start (continuing anyway):', analyticsError);
        // Continue without failing the session creation
      }

      const session: WizardSession = {
        id: sessionId,
        avatarId: cleanAvatarId,
        createdAt: new Date()
      };

      // Store selections in sessionStorage if available and valid
      if (selections && typeof window !== 'undefined') {
        try {
          const serializedSelections = JSON.stringify(selections);
          sessionStorage.setItem(`wizard_${sessionId}`, serializedSelections);
          logger.info('Stored wizard selections in sessionStorage');
        } catch (storageError) {
          logger.warn('Failed to store wizard selections (continuing anyway):', storageError);
          // Continue without failing - the selections are still passed to getRecommendations
        }
      }

      return session;
    } catch (error) {
      logger.error('Failed to start wizard session:', error);
      throw new Error('Unable to start game finder session. Please try again.');
    }
  }

  /**
   * Get wizard steps
   */
  getSteps(): WizardStep[] {
    return this.steps;
  }

  /**
   * Get recommended games based on wizard selections with progressive fallback
   */
  async getRecommendations(
    sessionId: string,
    selections: Record<string, unknown>
  ): Promise<WizardSession> {
    try {
      const filters = this.parseSelections(selections);
      
      // Try exact match first
      let recommendations = gameDiscovery.getRecommendedGames('', filters) || [];
      
      // If no exact matches, use progressive fallback strategy
      if (recommendations.length === 0) {
        recommendations = await this.findSimilarGames(filters, selections);
      }

      // TODO: Store in database when game_wizard_sessions table is created
      const session: WizardSession = {
        id: sessionId,
        avatarId: sessionId.includes('_') ? sessionId.split('_')[1] : 'temp',
        parsedFilters: filters,
        selectedGames: recommendations.map(r => r.game?.id).filter(Boolean),
        createdAt: new Date(),
        completedAt: new Date()
      };

      // Track wizard completion with error handling
      try {
        await analyticsService.trackEvent(sessionId, session.avatarId, 'wizard_complete', {
          timestamp: new Date().toISOString(),
          filters,
          originalSelections: selections,
          recommendations: recommendations.map(r => ({
            gameId: r.game?.id || 'unknown',
            score: r.score || 0,
            reason: r.reason || 'No reason provided'
          })),
          fallbackUsed: recommendations.some(r => r.reason.includes('Similar') || r.reason.includes('Popular'))
        });
      } catch (analyticsError) {
        logger.warn('Failed to track wizard completion:', analyticsError);
        // Continue without failing the entire operation
      }

      return session;
    } catch (error) {
      logger.error('Failed to get wizard recommendations:', error);
      
      // Even on error, try to provide some recommendations
      try {
        const fallbackRecommendations = await this.getFallbackRecommendations();
        return {
          id: sessionId,
          avatarId: sessionId.includes('_') ? sessionId.split('_')[1] : 'temp',
          parsedFilters: {},
          selectedGames: fallbackRecommendations.map(r => r.game.id),
          createdAt: new Date(),
          completedAt: new Date()
        };
      } catch {
        // Absolute fallback - return empty but valid session
        return {
          id: sessionId,
          avatarId: sessionId.includes('_') ? sessionId.split('_')[1] : 'temp',
          parsedFilters: {},
          selectedGames: [],
          createdAt: new Date(),
          completedAt: new Date()
        };
      }
    }
  }

  /**
   * Progressive fallback strategy to find similar games when exact matches fail
   */
  private async findSimilarGames(
    originalFilters: Record<string, unknown>,
    originalSelections: Record<string, unknown>
  ): Promise<Array<{ game: Game; score: number; reason: string }>> {
    const fallbackStrategies = [
      // Strategy 1: Relax skill level requirement
      {
        name: 'Similar difficulty',
        modifyFilters: (filters: Record<string, unknown>): Partial<EnhancedGameFilter> => ({
          subjects: Array.isArray(filters.subjects) ? filters.subjects as string[] : undefined,
          tags: Array.isArray(filters.tags) ? filters.tags as string[] : undefined,
          ageRange: Array.isArray(filters.ageRange) && filters.ageRange.length >= 2 ? 
            filters.ageRange as [number, number] : undefined,
          status: Array.isArray(filters.status) ? filters.status as string[] : ['active'],
          skillLevels: undefined
        })
      },
      
      // Strategy 2: Expand age range by 1 year on each side
      {
        name: 'Similar age range',
        modifyFilters: (filters: Record<string, unknown>): Partial<EnhancedGameFilter> => ({
          subjects: Array.isArray(filters.subjects) ? filters.subjects as string[] : undefined,
          tags: Array.isArray(filters.tags) ? filters.tags as string[] : undefined,
          status: Array.isArray(filters.status) ? filters.status as string[] : ['active'],
          skillLevels: undefined,
          ageRange: filters.ageRange && Array.isArray(filters.ageRange) && filters.ageRange.length >= 2 ? 
            [Math.max(2, filters.ageRange[0] - 1), Math.min(8, filters.ageRange[1] + 1)] as [number, number] : 
            undefined
        })
      },
      
      // Strategy 3: Keep subject but remove other constraints
      {
        name: 'Same subject',
        modifyFilters: (filters: Record<string, unknown>): Partial<EnhancedGameFilter> => ({
          subjects: Array.isArray(filters.subjects) ? filters.subjects as string[] : undefined,
          status: ['active']
        })
      },
      
      // Strategy 4: Popular games with relaxed age constraints
      {
        name: 'Popular games',
        modifyFilters: (filters: Record<string, unknown>): Partial<EnhancedGameFilter> => ({
          status: ['active'],
          ageRange: filters.ageRange && Array.isArray(filters.ageRange) && filters.ageRange.length >= 2 ? 
            [Math.max(2, filters.ageRange[0] - 1), Math.min(8, filters.ageRange[1] + 1)] as [number, number] : 
            undefined
        })
      }
    ];

    // Try each fallback strategy
    for (const strategy of fallbackStrategies) {
      try {
        const modifiedFilters = strategy.modifyFilters(originalFilters);
        const results = gameDiscovery.searchWithFacets('', modifiedFilters);
        
        if (results && results.length > 0) {
          // Score games based on similarity to original preferences
          const scoredResults = results.map(game => ({
            game,
            score: this.calculateSimilarityScore(game, originalSelections, originalFilters),
            reason: `Similar game (${strategy.name})`
          }));
          
          // Sort by similarity score and return top matches
          return scoredResults
            .sort((a, b) => b.score - a.score)
            .slice(0, 6); // Limit to 6 recommendations
        }
      } catch (strategyError) {
        logger.warn(`Fallback strategy "${strategy.name}" failed:`, strategyError);
        continue;
      }
    }

    // Ultimate fallback: return featured games
    return this.getFallbackRecommendations();
  }

  /**
   * Calculate similarity score between a game and original user preferences
   */
  private calculateSimilarityScore(
    game: Game,
    originalSelections: Record<string, unknown>,
    originalFilters: Record<string, unknown>
  ): number {
    let score = 0;
    
    // Subject match (highest weight)
    if (originalFilters.subjects && Array.isArray(originalFilters.subjects)) {
      if (originalFilters.subjects.includes(game.subject)) {
        score += 40;
      }
    }
    
    // Age range overlap
    if (originalFilters.ageRange && Array.isArray(originalFilters.ageRange)) {
      const [userMinAge, userMaxAge] = originalFilters.ageRange;
      const [gameMinAge, gameMaxAge] = game.ageRange || [0, 10];
      
      // Calculate overlap
      const overlapMin = Math.max(userMinAge, gameMinAge);
      const overlapMax = Math.min(userMaxAge, gameMaxAge);
      
      if (overlapMax >= overlapMin) {
        const overlapSize = overlapMax - overlapMin + 1;
        const userRangeSize = userMaxAge - userMinAge + 1;
        const overlapRatio = overlapSize / userRangeSize;
        score += Math.round(overlapRatio * 25); // Up to 25 points for perfect age overlap
      }
    }
    
    // Skill level match
    if (originalFilters.skillLevels && Array.isArray(originalFilters.skillLevels)) {
      if (originalFilters.skillLevels.includes(game.skillLevel)) {
        score += 20;
      }
    }
    
    // Game features and tags (bonus points)
    if (game.tags && Array.isArray(game.tags)) {
      // Bonus for interactive games if they selected goals/interests
      if (originalSelections.goals && game.isInteractive) {
        score += 5;
      }
      
      // Bonus for games with audio if they're younger
      if (originalSelections.age && Array.isArray(originalSelections.age) && 
          originalSelections.age[0] <= 4 && game.hasAudio) {
        score += 5;
      }
    }
    
    // Duration preference match
    if (originalSelections.time && game.estimatedDuration) {
      const timePreference = originalSelections.time as string;
      const duration = game.estimatedDuration;
      
      let timeMatch = false;
      switch (timePreference) {
        case 'quick':
          timeMatch = duration <= 5;
          break;
        case 'short':
          timeMatch = duration > 5 && duration <= 10;
          break;
        case 'medium':
          timeMatch = duration > 10 && duration <= 15;
          break;
        case 'long':
          timeMatch = duration > 15;
          break;
      }
      
      if (timeMatch) {
        score += 10;
      }
    }
    
    return score;
  }

  /**
   * Get fallback recommendations when all other strategies fail
   */
  private async getFallbackRecommendations(): Promise<Array<{ game: Game; score: number; reason: string }>> {
    try {
      const featuredGames = gameDiscovery.getFeaturedGames();
      
      if (featuredGames && featuredGames.length > 0) {
        return featuredGames.slice(0, 4).map(game => ({
          game,
          score: 0.3,
          reason: 'Popular featured game'
        }));
      }
      
      // If no featured games, get first few active games
      const allGames = gameDiscovery.searchWithFacets('', { status: ['active'] });
      return allGames.slice(0, 4).map(game => ({
        game,
        score: 0.2,
        reason: 'Available game'
      }));
      
    } catch (error) {
      logger.error('Failed to get fallback recommendations:', error);
      return [];
    }
  }

  /**
   * Get wizard session by ID (for displaying results)
   */
  async getSession(sessionId: string): Promise<WizardSession | null> {
    // TODO: Implement proper database retrieval when game_wizard_sessions table is created
    // For now, we'll recreate the session from the sessionId
    try {
      // Parse sessionId to extract avatarId and timestamp
      const parts = sessionId.split('_');
      if (parts.length < 2) {
        return null;
      }

      // Return a minimal session that can be used to reconstruct filters
      return {
        id: sessionId,
        avatarId: parts[1] || 'temp',
        createdAt: new Date(parseInt(parts[1]) || Date.now()),
        // Note: parsedFilters and selectedGames will need to be reconstructed
        // by calling getRecommendations with the original selections
      };
    } catch (error) {
      logger.error('Failed to get wizard session:', error);
      return null;
    }
  }

  /**
   * Track game completion from wizard recommendations
   */
  async trackCompletion(
    sessionId: string,
    gameId: string,
    score: number,
    timeSpent: number
  ): Promise<void> {
    // TODO: Store in database when game_wizard_completions table is created
    
    // Track game completion
    await analyticsService.trackEvent(sessionId, 'temp', 'wizard_game_complete', {
      gameId,
      score,
      timeSpent,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Update session completion rate
   */
  private async updateCompletionRate(): Promise<void> {
    // TODO: Implement when database tables are available
    // For now, this is a no-op
  }

  /**
   * Parse wizard selections into game filters
   */
  private parseSelections(selections: Record<string, unknown>): Record<string, unknown> {
    const filters: Record<string, unknown> = {};

    try {
      // Parse age range
      if (selections.age && Array.isArray(selections.age)) {
        filters.ageRange = selections.age;
      }

      // Parse subject
      if (selections.interests && typeof selections.interests === 'string') {
        filters.subjects = [selections.interests];
      }

      // Parse duration
      if (selections.time && typeof selections.time === 'string') {
        filters.duration = selections.time;
      }

      // Parse skill level
      if (selections.goals && typeof selections.goals === 'string') {
        filters.skillLevels = [selections.goals];
      }
    } catch (error) {
      logger.warn('Failed to parse wizard selections:', error);
      // Return empty filters if parsing fails
    }

    return filters;
  }
}

export const gameWizard = new GameWizardService(); 