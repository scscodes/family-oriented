import { gameDiscovery } from './gameData';
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
  async startSession(avatarId: string): Promise<WizardSession> {
    // TODO: Implement with Supabase when game_wizard_sessions table is created
    return {
      id: `session_${Date.now()}`,
      avatarId,
      createdAt: new Date()
    };
  }

  /**
   * Get wizard steps
   */
  getSteps(): WizardStep[] {
    return this.steps;
  }

  /**
   * Get recommended games based on wizard selections
   */
  async getRecommendations(
    sessionId: string,
    selections: Record<string, unknown>
  ): Promise<WizardSession> {
    // TODO: Implement with Supabase when game_wizard_sessions table is created
    const filters = this.parseSelections(selections);
    const recommendations = gameDiscovery.getRecommendedGames('', filters);

    return {
      id: sessionId,
      avatarId: 'temp',
      parsedFilters: filters,
      selectedGames: recommendations.map(r => r.game.id),
      createdAt: new Date(),
      completedAt: new Date()
    };
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
    // TODO: Implement with Supabase when game_wizard_completions table is created
    logger.info('Tracking completion:', { sessionId, gameId, score, timeSpent });
  }

  /**
   * Update session completion rate
   */
  private async updateCompletionRate(sessionId: string): Promise<void> {
    // TODO: Implement with Supabase when tables are created
    logger.info('Updating completion rate for session:', sessionId);
  }

  /**
   * Parse wizard selections into game filters
   */
  private parseSelections(selections: Record<string, unknown>): Record<string, unknown> {
    const filters: Record<string, unknown> = {};

    // Parse age range
    if (selections.age) {
      filters.ageRange = selections.age;
    }

    // Parse subject
    if (selections.interests) {
      filters.subjects = [selections.interests];
    }

    // Parse duration
    if (selections.time) {
      filters.duration = selections.time;
    }

    // Parse skill level
    if (selections.goals) {
      filters.skillLevels = [selections.goals];
    }

    return filters;
  }
}

export const gameWizard = new GameWizardService(); 