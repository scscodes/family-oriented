/**
 * Comprehensive Analytics Service for Game Tracking and Learning Progression
 * Supports both individual user analytics and aggregate platform metrics
 * Integrated with Supabase for persistent data storage
 */

import { GameType } from './gameUtils';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

// Core interfaces for analytics data
export interface GameSessionData {
  id: string;
  avatarId: string;
  orgId?: string;
  gameId: GameType;
  sessionStart: Date;
  sessionEnd?: Date;
  totalDuration: number; // seconds
  questionsAttempted: number;
  questionsCorrect: number;
  completionStatus: 'completed' | 'abandoned' | 'in_progress';
  difficultyLevel: string;
  settingsUsed: Record<string, unknown>;
}

export interface GameEventData {
  sessionId: string;
  avatarId: string;
  eventType: 'game_start' | 'game_complete' | 'question_start' | 'question_answer' | 'hint_used' | 'game_pause' | 'game_resume' | 'difficulty_change' | 'game_abandon';
  eventData: Record<string, unknown>;
  timestamp: Date;
  sequenceNumber: number;
}

export interface LearningProgressData {
  avatarId: string;
  gameId: GameType;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  masteryScore: number; // 0-100
  learningObjectivesMet: string[];
  prerequisiteCompletion: Record<string, boolean>;
  lastPlayed: Date;
  totalSessions: number;
  averagePerformance: number;
  improvementTrend: 'improving' | 'stable' | 'declining';
}

export interface LearningPathRecommendation {
  gameId: string;
  reason: string;
  priority: number; // 1-10, higher is more recommended
  estimatedDifficulty: string;
  learningObjectives: string[];
  prerequisitesMet: boolean;
}

export interface PerformanceMetrics {
  totalGamesPlayed: number;
  averageSessionDuration: number;
  overallCompletionRate: number;
  skillLevelDistribution: Record<string, number>;
  subjectPreferences: Record<string, number>;
  learningVelocity: number; // objectives mastered per week
  engagementScore: number; // 0-100
}

/**
 * Supabase-Integrated Analytics Service Class
 * Handles all game tracking, learning progression, and performance analytics
 * with persistent storage via Supabase
 */
export class SupabaseAnalyticsService {
  private supabase = createClient();
  
  // Local cache for performance (still maintain for complex calculations)
  private sessionCache: Map<string, GameSessionData> = new Map();
  private eventSequenceCounters: Map<string, number> = new Map();

  /**
   * Start tracking a new game session (Supabase-integrated)
   */
  async startGameSession(
    avatarId: string,
    gameType: string, // Using gameType to match Supabase schema
    settings: Record<string, unknown>,
    orgId?: string
  ): Promise<string> {
    const { data, error } = await this.supabase
      .from('game_sessions')
      .insert({
        avatar_id: avatarId,
        org_id: orgId,
        game_type: gameType,
        settings_used: settings as any,
        session_start: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) throw error;

    // Cache session locally for immediate access
    const session: GameSessionData = {
      id: data.id,
      avatarId,
      orgId,
      gameId: gameType as GameType,
      sessionStart: new Date(),
      totalDuration: 0,
      questionsAttempted: 0,
      questionsCorrect: 0,
      completionStatus: 'in_progress',
      difficultyLevel: 'beginner',
      settingsUsed: settings
    };

    this.sessionCache.set(data.id, session);
    this.eventSequenceCounters.set(data.id, 0);
    
    // Track session start event
    await this.trackEvent(data.id, avatarId, 'game_start', { gameType, settings });
    
    return data.id;
  }

  /**
   * Track individual game events during a session (Supabase-integrated)
   */
  async trackEvent(
    sessionId: string,
    avatarId: string,
    eventType: GameEventData['eventType'],
    eventData: Record<string, unknown>
  ): Promise<void> {
    const sequenceNumber = (this.eventSequenceCounters.get(sessionId) || 0) + 1;
    this.eventSequenceCounters.set(sessionId, sequenceNumber);

    const { error } = await this.supabase
      .from('game_events')
      .insert({
        session_id: sessionId,
        avatar_id: avatarId,
        event_type: eventType,
        event_data: eventData as any,
        timestamp: new Date().toISOString(),
        sequence_number: sequenceNumber
      });

    if (error) throw error;

    // Update local cache if session exists
    const session = this.sessionCache.get(sessionId);
    if (session) {
      this.updateSessionFromEvent(session, {
        sessionId,
        avatarId,
        eventType,
        eventData,
        timestamp: new Date(),
        sequenceNumber
      });
    }
  }

  /**
   * Complete a game session and calculate final metrics (Supabase-integrated)
   */
  async completeGameSession(
    sessionId: string,
    finalScore: number,
    questionsAttempted: number,
    questionsCorrect: number
  ): Promise<void> {
    const scoreData = {
      finalScore,
      accuracy: questionsAttempted > 0 ? questionsCorrect / questionsAttempted : 0,
      questionsCorrect,
      questionsAttempted,
      completionRate: 1.0
    };

    // Calculate duration from cached session or fetch from DB
    let totalDuration = 0;
    const cachedSession = this.sessionCache.get(sessionId);
    if (cachedSession) {
      totalDuration = Math.floor((new Date().getTime() - cachedSession.sessionStart.getTime()) / 1000);
    }

    const { error } = await this.supabase
      .from('game_sessions')
      .update({
        session_end: new Date().toISOString(),
        total_duration: totalDuration,
        questions_attempted: questionsAttempted,
        questions_correct: questionsCorrect,
        completion_status: 'completed',
        score_data: scoreData
      })
      .eq('id', sessionId);

    if (error) throw error;

    // Track completion event
    await this.trackEvent(sessionId, cachedSession?.avatarId || '', 'game_complete', {
      finalScore,
      questionsAttempted,
      questionsCorrect,
      duration: totalDuration
    });

    // Update learning progress
    if (cachedSession) {
      await this.updateLearningProgress(cachedSession, finalScore);
    }

    // Clean up cache
    this.sessionCache.delete(sessionId);
    this.eventSequenceCounters.delete(sessionId);
  }

  /**
   * Get learning progress for an avatar (Supabase-integrated)
   */
  async getAvatarProgress(avatarId: string): Promise<LearningProgressData[]> {
    const { data, error } = await this.supabase
      .from('learning_progress')
      .select('*')
      .eq('avatar_id', avatarId)
      .order('last_played', { ascending: false });

    if (error) throw error;

    // Transform Supabase data to our interface
    return (data || []).map(row => ({
      avatarId: row.avatar_id,
      gameId: row.game_type as GameType,
      skillLevel: row.skill_level as 'beginner' | 'intermediate' | 'advanced',
      masteryScore: row.mastery_score || 0,
      learningObjectivesMet: row.learning_objectives_met || [],
      prerequisiteCompletion: (row.prerequisite_completion as Record<string, boolean>) || {},
      lastPlayed: new Date(row.last_played),
      totalSessions: row.total_sessions || 0,
      averagePerformance: row.average_performance || 0,
      improvementTrend: row.improvement_trend as 'improving' | 'stable' | 'declining'
    }));
  }

  /**
   * Get game sessions for an avatar (Supabase-integrated)
   */
  async getAvatarSessions(avatarId: string, limit?: number): Promise<GameSessionData[]> {
    let query = this.supabase
      .from('game_sessions')
      .select('*')
      .eq('avatar_id', avatarId)
      .order('session_start', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Transform Supabase data to our interface
    return (data || []).map(row => ({
      id: row.id,
      avatarId: row.avatar_id,
      orgId: row.org_id || undefined,
      gameId: row.game_type as GameType,
      sessionStart: new Date(row.session_start),
      sessionEnd: row.session_end ? new Date(row.session_end) : undefined,
      totalDuration: row.total_duration || 0,
      questionsAttempted: row.questions_attempted || 0,
      questionsCorrect: row.questions_correct || 0,
      completionStatus: row.completion_status as 'completed' | 'abandoned' | 'in_progress',
      difficultyLevel: row.difficulty_level,
      settingsUsed: (row.settings_used as Record<string, unknown>) || {}
    }));
  }

  /**
   * Get learning path recommendations for an avatar
   */
  async getLearningPathRecommendations(avatarId: string, maxRecommendations: number = 5): Promise<LearningPathRecommendation[]> {
    const progress = await this.getAvatarProgress(avatarId);
    const recommendations: LearningPathRecommendation[] = [];

    // Import games data for analysis
    const availableGames = this.getAvailableGames();

    for (const game of availableGames) {
      const gameProgress = progress.find(p => p.gameId === game.id);
      const recommendation = this.calculateGameRecommendation(game, gameProgress, progress);
      
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    // Sort by priority and return top recommendations
    return recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, maxRecommendations);
  }

  /**
   * Get comprehensive performance metrics for an avatar
   */
  async getPerformanceMetrics(avatarId: string): Promise<PerformanceMetrics> {
    const [progress, sessions] = await Promise.all([
      this.getAvatarProgress(avatarId),
      this.getAvatarSessions(avatarId)
    ]);

    const totalGamesPlayed = sessions.length;
    const averageSessionDuration = sessions.reduce((sum, s) => sum + s.totalDuration, 0) / totalGamesPlayed || 0;
    const completedSessions = sessions.filter(s => s.completionStatus === 'completed');
    const overallCompletionRate = completedSessions.length / totalGamesPlayed || 0;

    // Calculate skill level distribution
    const skillLevelDistribution = progress.reduce((dist, p) => {
      dist[p.skillLevel] = (dist[p.skillLevel] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);

    // Calculate subject preferences based on play frequency
    const subjectPreferences = this.calculateSubjectPreferences(sessions);

    // Calculate learning velocity (objectives mastered per week)
    const learningVelocity = this.calculateLearningVelocity(progress);

    // Calculate engagement score based on various factors
    const engagementScore = this.calculateEngagementScore(sessions);

    return {
      totalGamesPlayed,
      averageSessionDuration,
      overallCompletionRate,
      skillLevelDistribution,
      subjectPreferences,
      learningVelocity,
      engagementScore
    };
  }

  /**
   * Get aggregate analytics for platform-wide metrics (Supabase-integrated)
   */
  async getAggregateAnalytics(orgId?: string): Promise<{
    totalSessions: number;
    uniquePlayers: number;
    averageDuration: number;
    completionRate: number;
    popularGames: Array<{ gameId: GameType; sessions: number; avgScore: number }>;
    learningEffectiveness: Record<string, number>;
  }> {
    let query = this.supabase
      .from('game_sessions')
      .select('*');

    if (orgId) {
      query = query.eq('org_id', orgId);
    }

    const { data: sessions, error } = await query;
    if (error) throw error;

    const sessionData = sessions || [];
    const totalSessions = sessionData.length;
    const uniquePlayers = new Set(sessionData.map(s => s.avatar_id)).size;
    const averageDuration = sessionData.reduce((sum, s) => sum + (s.total_duration || 0), 0) / totalSessions || 0;
    const completedSessions = sessionData.filter(s => s.completion_status === 'completed');
    const completionRate = completedSessions.length / totalSessions || 0;

    // Calculate popular games
    const gameStats = sessionData.reduce((stats, session) => {
      const gameType = session.game_type;
      if (!stats[gameType]) {
        stats[gameType] = { sessions: 0, totalScore: 0, completedSessions: 0 };
      }
      stats[gameType].sessions++;
      if (session.completion_status === 'completed' && session.score_data) {
        stats[gameType].completedSessions++;
        const scoreData = session.score_data as any;
        stats[gameType].totalScore += scoreData.finalScore || 0;
      }
      return stats;
    }, {} as Record<string, { sessions: number; totalScore: number; completedSessions: number }>);

    const popularGames = Object.entries(gameStats)
      .map(([gameId, stats]) => ({
        gameId: gameId as GameType,
        sessions: stats.sessions,
        avgScore: stats.completedSessions > 0 ? stats.totalScore / stats.completedSessions : 0
      }))
      .sort((a, b) => b.sessions - a.sessions);

    // Calculate learning effectiveness by subject
    const learningEffectiveness = this.calculateLearningEffectivenessFromSessions(sessionData);

    return {
      totalSessions,
      uniquePlayers,
      averageDuration,
      completionRate,
      popularGames,
      learningEffectiveness
    };
  }

  // Private helper methods

  private updateSessionFromEvent(session: GameSessionData, event: GameEventData): void {
    switch (event.eventType) {
      case 'question_answer':
        session.questionsAttempted++;
        if (event.eventData.correct) {
          session.questionsCorrect++;
        }
        break;
      case 'difficulty_change':
        session.difficultyLevel = event.eventData.newDifficulty as string;
        break;
    }
  }

  private async updateLearningProgress(session: GameSessionData, finalScore: number): Promise<void> {
    // Check if progress record exists
    const { data: existingProgress } = await this.supabase
      .from('learning_progress')
      .select('*')
      .eq('avatar_id', session.avatarId)
      .eq('game_type', session.gameId)
      .single();

    const now = new Date().toISOString();
    
    if (!existingProgress) {
      // Create new progress record
      const { error } = await this.supabase
        .from('learning_progress')
        .insert({
          avatar_id: session.avatarId,
          org_id: session.orgId,
          game_type: session.gameId,
          skill_level: 'beginner',
          mastery_score: finalScore,
          learning_objectives_met: [],
          prerequisite_completion: {},
          last_played: now,
          total_sessions: 1,
          average_performance: finalScore,
          improvement_trend: 'stable',
          needs_realtime_update: true
        });

      if (error) throw error;
    } else {
      // Update existing progress
      const totalSessions = (existingProgress.total_sessions || 0) + 1;
      const previousAverage = existingProgress.average_performance || 0;
      const newAverage = (previousAverage * (totalSessions - 1) + finalScore) / totalSessions;
      
      // Determine improvement trend
      let improvementTrend = 'stable';
      if (totalSessions > 1) {
        if (newAverage > previousAverage * 1.1) {
          improvementTrend = 'improving';
        } else if (newAverage < previousAverage * 0.9) {
          improvementTrend = 'declining';
        }
      }

      // Update mastery score (weighted average favoring recent performance)
      const masteryScore = Math.min(100, ((existingProgress.mastery_score || 0) * 0.7) + (finalScore * 0.3));

      // Check for skill level advancement
      let skillLevel = existingProgress.skill_level;
      if (masteryScore >= 80 && skillLevel === 'beginner') {
        skillLevel = 'intermediate';
      } else if (masteryScore >= 90 && skillLevel === 'intermediate') {
        skillLevel = 'advanced';
      }

      const { error } = await this.supabase
        .from('learning_progress')
        .update({
          skill_level: skillLevel,
          mastery_score: masteryScore,
          last_played: now,
          total_sessions: totalSessions,
          average_performance: newAverage,
          improvement_trend: improvementTrend,
          needs_realtime_update: true,
          updated_at: now
        })
        .eq('id', existingProgress.id);

      if (error) throw error;
    }
  }

  private calculateGameRecommendation(
    game: { id: string; prerequisites?: string[]; learningObjectives?: string[] }, 
    gameProgress?: LearningProgressData, 
    allProgress?: LearningProgressData[]
  ): LearningPathRecommendation | null {
    let priority = 5; // base priority
    let reason = 'Recommended for continued learning';

    // Check prerequisites
    const prerequisitesMet = this.checkPrerequisites(game, allProgress || []);
    if (!prerequisitesMet) {
      return null; // Don't recommend if prerequisites not met
    }

    // Boost priority for games not yet played
    if (!gameProgress) {
      priority += 2;
      reason = 'New game to explore';
    }

    // Boost priority for games where user is improving
    if (gameProgress?.improvementTrend === 'improving') {
      priority += 1;
      reason = 'You\'re making great progress here!';
    }

    // Lower priority for mastered games
    if (gameProgress?.masteryScore && gameProgress.masteryScore >= 90) {
      priority -= 2;
      reason = 'Review and reinforce mastered skills';
    }

    return {
      gameId: game.id,
      reason,
      priority: Math.max(1, Math.min(10, priority)),
      estimatedDifficulty: gameProgress?.skillLevel || 'beginner',
      learningObjectives: game.learningObjectives || [],
      prerequisitesMet
    };
  }

  private checkPrerequisites(game: { prerequisites?: string[] }, progress: LearningProgressData[]): boolean {
    if (!game.prerequisites || game.prerequisites.length === 0) {
      return true;
    }

    return game.prerequisites.every((prereqId: string) => {
      const prereqProgress = progress.find(p => p.gameId === prereqId);
      return prereqProgress && prereqProgress.masteryScore >= 70; // 70% mastery required
    });
  }

  private calculateSubjectPreferences(sessions: GameSessionData[]): Record<string, number> {
    // This would map game IDs to subjects using the GAMES array
    // Placeholder implementation
    const sessionCount = sessions.length;
    const subject = this.getGameSubject();
    return { [subject]: sessionCount };
  }

  private calculateLearningVelocity(progress: LearningProgressData[]): number {
    // Calculate objectives mastered per week based on progress data
    const totalObjectives = progress.reduce((sum, p) => sum + p.learningObjectivesMet.length, 0);
    const weeksActive = this.calculateWeeksActive();
    return weeksActive > 0 ? totalObjectives / weeksActive : 0;
  }

  private calculateEngagementScore(sessions: GameSessionData[]): number {
    // Complex engagement calculation based on multiple factors
    let score = 50; // base score

    // Factor in completion rate
    const completionRate = sessions.filter(s => s.completionStatus === 'completed').length / sessions.length || 0;
    score += completionRate * 30;

    // Factor in consistency (regular play)
    const consistency = this.calculatePlayConsistency();
    score += consistency * 20;

    return Math.max(0, Math.min(100, score));
  }

  private calculateLearningEffectivenessFromSessions(sessions: any[]): Record<string, number> {
    // Calculate effectiveness by subject based on improvement over time
    const subjectEffectiveness: Record<string, number> = {};
    
    // Placeholder implementation - would group sessions by subject in real implementation
    const subject = this.getGameSubject();
    const effectiveness = sessions.length > 0 ? this.calculateSubjectEffectiveness() : 0;
    subjectEffectiveness[subject] = effectiveness;

    return subjectEffectiveness;
  }

  // Additional helper methods (preserved from original implementation)
  private getAvailableGames(): Array<{ id: string; prerequisites?: string[]; learningObjectives?: string[] }> {
    // This would return the GAMES array from gameData.ts
    return [];
  }

  private getGameSubject(): string {
    // This would look up the subject from the GAMES array
    return 'Mathematics'; // placeholder
  }

  private calculateWeeksActive(): number {
    // Calculate weeks between first and last play
    return 1; // placeholder
  }

  private calculatePlayConsistency(): number {
    // Calculate how consistently the user plays (0-1 score)
    return 0.5; // placeholder
  }

  private calculateSubjectEffectiveness(): number {
    // Calculate learning effectiveness for a specific subject
    return 75; // placeholder percentage
  }
}

// Export singleton instance
export const analyticsService = new SupabaseAnalyticsService(); 