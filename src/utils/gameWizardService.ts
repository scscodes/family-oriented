import { createClient } from '@/lib/supabase/client';
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
  value: string | number | boolean;
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
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('game_wizard_sessions')
        .insert({
          avatar_id: avatarId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        avatarId: data.avatar_id,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      logger.error('Failed to start wizard session:', error);
      throw error;
    }
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
    try {
      const supabase = createClient();
      // Parse selections into game filters
      const filters = this.parseSelections(selections);

      // Get recommended games
      const recommendations = gameDiscovery.getRecommendedGames('', filters);

      // Update session with recommendations
      const { data, error } = await supabase
        .from('game_wizard_sessions')
        .update({
          parsed_filters: filters,
          selected_games: recommendations.map(r => r.game.id),
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        avatarId: data.avatar_id,
        parsedFilters: data.parsed_filters,
        selectedGames: data.selected_games,
        createdAt: new Date(data.created_at),
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined
      };
    } catch (error) {
      logger.error('Failed to get recommendations:', error);
      throw error;
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
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('game_wizard_completions')
        .insert({
          wizard_session_id: sessionId,
          game_id: gameId,
          score,
          time_spent: timeSpent
        });

      if (error) throw error;

      // Update session completion rate
      await this.updateCompletionRate(sessionId);
    } catch (error) {
      logger.error('Failed to track completion:', error);
      throw error;
    }
  }

  /**
   * Update session completion rate
   */
  private async updateCompletionRate(sessionId: string): Promise<void> {
    try {
      const supabase = createClient();
      // Get all completions for this session
      const { data: completions, error: completionsError } = await supabase
        .from('game_wizard_completions')
        .select('score')
        .eq('wizard_session_id', sessionId);

      if (completionsError) throw completionsError;

      // Calculate average score
      const avgScore = completions.reduce((sum, c) => sum + c.score, 0) / completions.length;

      // Update session
      const { error: updateError } = await supabase
        .from('game_wizard_sessions')
        .update({ completion_rate: avgScore })
        .eq('id', sessionId);

      if (updateError) throw updateError;
    } catch (error) {
      logger.error('Failed to update completion rate:', error);
      throw error;
    }
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