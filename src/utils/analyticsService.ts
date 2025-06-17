/**
 * Comprehensive Analytics Service for Game Tracking and Learning Progression
 * Supports both individual user analytics and aggregate platform metrics
 * Integrated with Supabase for persistent data storage
 */

import { GameType } from './gameUtils';
import { createClient } from '@/lib/supabase/client';
import type { Json } from '@/lib/supabase/database.types';
import { logger } from './logger';

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
  scoreData?: {
    finalScore: number;
    accuracy: number;
    questionsCorrect: number;
    questionsAttempted: number;
    completionRate: number;
  };
}

export interface GameEventData {
  sessionId: string;
  avatarId: string;
  eventType: 
    | 'game_start' 
    | 'game_complete' 
    | 'question_start' 
    | 'question_answer' 
    | 'hint_used' 
    | 'game_pause' 
    | 'game_resume' 
    | 'difficulty_change' 
    | 'game_abandon'
    | 'wizard_start'
    | 'wizard_complete'
    | 'wizard_game_complete';
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
        settings_used: settings as Json,
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
        event_data: eventData as Json,
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
    logger.debug('=== GETTING AVATAR SESSIONS ===');
    logger.debug('Querying sessions for avatar ID:', avatarId);
    
    let query = this.supabase
      .from('game_sessions')
      .select('*')
      .eq('avatar_id', avatarId)
      .order('session_start', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) {
      logger.error('Error fetching sessions:', error);
      throw error;
    }

    logger.debug('Raw session data from database:', data);
    logger.debug('Number of sessions found:', data?.length || 0);

    // Also check all sessions in database to see what avatar IDs exist
    const { data: allSessions } = await this.supabase
      .from('game_sessions')
      .select('avatar_id, game_type, id')
      .limit(10);
    
    logger.debug('Sample of all sessions in database:', allSessions);
    const uniqueAvatarIds = [...new Set(allSessions?.map(s => s.avatar_id) || [])];
    logger.debug('Unique avatar IDs that have sessions:', uniqueAvatarIds);

    // Transform Supabase data to our interface
    const transformedData = (data || []).map(row => ({
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
      settingsUsed: (row.settings_used as Record<string, unknown>) || {},
      scoreData: row.score_data as {
        finalScore: number;
        accuracy: number;
        questionsCorrect: number;
        questionsAttempted: number;
        completionRate: number;
      }
    }));

    logger.debug('Transformed session data:', transformedData);
    logger.debug('=== END GETTING AVATAR SESSIONS ===');
    
    return transformedData;
  }

  /**
   * Get learning path recommendations for an avatar
   */
  async getLearningPathRecommendations(avatarId: string, maxRecommendations: number = 5): Promise<LearningPathRecommendation[]> {
    const progress = await this.getAvatarProgress(avatarId);
    const recommendations: LearningPathRecommendation[] = [];

    // Import games data for analysis
    const availableGames = this.getAvailableGames();
    logger.debug('Available games:', availableGames.length);

    // If no progress yet, recommend beginner games
    if (progress.length === 0) {
      logger.debug('No progress found, recommending beginner games');
      return availableGames
        .filter(game => game.skillLevel === 'beginner')
        .slice(0, maxRecommendations)
        .map(game => ({
          gameId: game.id,
          reason: 'Great game to start with!',
          priority: 8,
          estimatedDifficulty: 'beginner',
          learningObjectives: game.learningObjectives || [],
          prerequisitesMet: true
        }));
    }

    logger.debug('Processing recommendations for progress:', progress.length, 'games');

    // First, recommend games that need improvement
    const needsImprovement = progress
      .filter(p => p.masteryScore < 70)
      .sort((a, b) => a.masteryScore - b.masteryScore);

    for (const gameProgress of needsImprovement) {
      const game = availableGames.find(g => g.id === gameProgress.gameId);
      if (game) {
        recommendations.push({
          gameId: game.id,
          reason: `Keep practicing to improve your ${game.id} skills!`,
          priority: 9,
          estimatedDifficulty: gameProgress.skillLevel,
          learningObjectives: game.learningObjectives || [],
          prerequisitesMet: true
        });
      }
    }

    // Then, recommend new games in the same subject as games with good progress
    const goodProgress = progress.filter(p => p.masteryScore >= 70);
    const subjectsToExplore = new Set(goodProgress.map(p => this.getGameSubject(p.gameId)));

    for (const subject of subjectsToExplore) {
      const newGamesInSubject = availableGames
        .filter(game => 
          this.getGameSubject(game.id) === subject && 
          !progress.some(p => p.gameId === game.id)
        );

      for (const game of newGamesInSubject) {
        recommendations.push({
          gameId: game.id,
          reason: `Try this ${subject} game to expand your skills!`,
          priority: 7,
          estimatedDifficulty: 'beginner',
          learningObjectives: game.learningObjectives || [],
          prerequisitesMet: true
        });
      }
    }

    // Finally, add any remaining games not yet played
    const playedGames = new Set(progress.map(p => p.gameId));
    const unplayedGames = availableGames.filter(game => !playedGames.has(game.id as GameType));

    for (const game of unplayedGames) {
      if (recommendations.length < maxRecommendations) {
        recommendations.push({
          gameId: game.id,
          reason: 'New game to explore!',
          priority: 6,
          estimatedDifficulty: 'beginner',
          learningObjectives: game.learningObjectives || [],
          prerequisitesMet: true
        });
      }
    }

    logger.debug('Generated recommendations:', recommendations.length);

    // Sort by priority and return top recommendations
    return recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, maxRecommendations);
  }

  private getGameSubject(gameId: string): string {
    const subjectMap: Record<string, string> = {
      'numbers': 'Mathematics',
      'math': 'Mathematics',
      'letters': 'Language Arts',
      'colors': 'Visual Arts',
      'shapes': 'Visual Arts',
      'geography': 'Social Studies'
    };
    return subjectMap[gameId] || 'Other';
  }

  /**
   * Get comprehensive performance metrics for an avatar
   */
  async getPerformanceMetrics(avatarId: string): Promise<PerformanceMetrics> {
    const [progress, sessions] = await Promise.all([
      this.getAvatarProgress(avatarId),
      this.getAvatarSessions(avatarId)
    ]);

    logger.debug('=== PERFORMANCE METRICS DEBUG ===');
    logger.debug('Avatar ID:', avatarId);
    logger.debug('Total sessions found:', sessions.length);
    logger.debug('First few sessions:', sessions.slice(0, 3).map(s => ({
      id: s.id,
      gameId: s.gameId,
      completionStatus: s.completionStatus,
      totalDuration: s.totalDuration,
      questionsAttempted: s.questionsAttempted,
      questionsCorrect: s.questionsCorrect,
      scoreData: s.scoreData
    })));

    // Basic metrics
    const totalGamesPlayed = sessions.length;
    logger.debug('Total games played:', totalGamesPlayed);
    
    const completedSessions = sessions.filter(s => s.completionStatus === 'completed');
    logger.debug('Completed sessions:', completedSessions.length);
    logger.debug('Completed sessions details:', completedSessions.map(s => ({
      gameId: s.gameId,
      totalDuration: s.totalDuration,
      scoreData: s.scoreData
    })));
    
    const averageSessionDuration = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.totalDuration || 0), 0) / completedSessions.length
      : 0;
    logger.debug('Average session duration (seconds):', averageSessionDuration);
    
    const overallCompletionRate = totalGamesPlayed > 0
      ? completedSessions.length / totalGamesPlayed
      : 0;
    logger.debug('Overall completion rate:', overallCompletionRate);

    // Calculate skill level distribution
    const skillLevelDistribution = progress.reduce((dist, p) => {
      dist[p.skillLevel] = (dist[p.skillLevel] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);
    logger.debug('Skill level distribution:', skillLevelDistribution);

    // Calculate subject preferences based on play frequency and performance
    const subjectPreferences = this.calculateSubjectPreferences(sessions);
    logger.debug('Subject preferences:', subjectPreferences);

    // Calculate learning velocity (objectives mastered per week)
    const learningVelocity = this.calculateLearningVelocity(progress);
    logger.debug('Learning velocity:', learningVelocity);

    // Calculate engagement score based on various factors
    const engagementScore = this.calculateEngagementScore(sessions);
    logger.debug('Engagement score calculation details:');
    logger.debug('- Sessions for engagement:', sessions.length);
    logger.debug('- Completed for engagement:', completedSessions.length);
    logger.debug('- Final engagement score:', engagementScore);

    const metrics = {
      totalGamesPlayed,
      averageSessionDuration,
      overallCompletionRate,
      skillLevelDistribution,
      subjectPreferences,
      learningVelocity,
      engagementScore
    };

    logger.debug('=== FINAL CALCULATED METRICS ===');
    logger.debug(metrics);
    logger.debug('=== END DEBUG ===');
    return metrics;
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
        const scoreData = session.score_data as Record<string, unknown>;
        const finalScore = typeof scoreData?.finalScore === 'number' ? scoreData.finalScore : 0;
        stats[gameType].totalScore += finalScore;
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

    // Transform raw session data to GameSessionData format
    const transformedSessions: GameSessionData[] = sessionData.map(row => ({
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
      settingsUsed: (row.settings_used as Record<string, unknown>) || {},
      scoreData: row.score_data as {
        finalScore: number;
        accuracy: number;
        questionsCorrect: number;
        questionsAttempted: number;
        completionRate: number;
      }
    }));

    // Calculate learning effectiveness by subject
    const learningEffectiveness = this.calculateLearningEffectivenessFromSessions(transformedSessions);

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
    const preferences: Record<string, number> = {};
    const gameTypes = new Set(sessions.map(s => s.gameId));
    
    gameTypes.forEach(gameType => {
      const gameSessions = sessions.filter(s => s.gameId === gameType);
      const completedSessions = gameSessions.filter(s => s.completionStatus === 'completed');
      
      if (completedSessions.length > 0) {
        const averageScore = completedSessions.reduce((sum, s) => {
          // Use the scoreData field directly
          const score = s.scoreData?.finalScore || 0;
          return sum + score;
        }, 0) / completedSessions.length;
        
        preferences[gameType] = averageScore;
      }
    });

    return preferences;
  }

  private calculateLearningVelocity(progress: LearningProgressData[]): number {
    if (progress.length === 0) return 0;

    // Count objectives mastered in the last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentProgress = progress.filter(p => 
      p.lastPlayed >= oneWeekAgo && p.masteryScore >= 80
    );

    return recentProgress.length;
  }

  private calculateEngagementScore(sessions: GameSessionData[]): number {
    if (sessions.length === 0) return 0;

    const factors = {
      sessionFrequency: 0,
      completionRate: 0,
      averageDuration: 0,
      consistency: 0
    };

    // Session frequency (0-25 points)
    const sessionCount = sessions.length;
    factors.sessionFrequency = Math.min(25, sessionCount * 2);

    // Completion rate (0-25 points)
    const completedSessions = sessions.filter(s => s.completionStatus === 'completed');
    const completionRate = completedSessions.length / sessionCount;
    factors.completionRate = completionRate * 25;

    // Average duration (0-25 points)
    const totalDuration = completedSessions.reduce((sum, s) => sum + (s.totalDuration || 0), 0);
    const avgDuration = completedSessions.length > 0 ? totalDuration / completedSessions.length : 0;
    factors.averageDuration = Math.min(25, avgDuration / 60); // Convert to minutes and cap at 25

    // Consistency (0-25 points)
    const recentSessions = sessions.slice(-5);
    const recentCompletionRate = recentSessions.filter(s => s.completionStatus === 'completed').length / recentSessions.length;
    factors.consistency = recentCompletionRate * 25;

    // Calculate total engagement score (0-100)
    const totalScore = Object.values(factors).reduce((sum, score) => sum + score, 0);
    return Math.round(totalScore);
  }

  /**
   * Calculate learning effectiveness metrics from session data
   */
  private calculateLearningEffectivenessFromSessions(sessions: GameSessionData[]): Record<string, number> {
    const gameEffectiveness: Record<string, { totalScore: number; sessionCount: number }> = {};
    
    sessions.forEach(session => {
      if (session.completionStatus === 'completed') {
        const gameType = session.gameId;
        const accuracy = session.scoreData?.accuracy || 0;
        
        if (!gameEffectiveness[gameType]) {
          gameEffectiveness[gameType] = { totalScore: 0, sessionCount: 0 };
        }
        
        gameEffectiveness[gameType].totalScore += accuracy;
        gameEffectiveness[gameType].sessionCount += 1;
      }
    });

    // Convert to average effectiveness scores
    const effectiveness: Record<string, number> = {};
    Object.keys(gameEffectiveness).forEach(gameType => {
      const { totalScore, sessionCount } = gameEffectiveness[gameType];
      effectiveness[gameType] = sessionCount > 0 ? totalScore / sessionCount : 0;
    });

    return effectiveness;
  }

  /**
   * Get list of available games for recommendations
   */
  private getAvailableGames(): Array<{
    id: string;
    skillLevel: string;
    learningObjectives: string[];
    prerequisites?: string[];
  }> {
    // Define available games with their metadata
    return [
      {
        id: 'numbers',
        skillLevel: 'beginner',
        learningObjectives: ['Number recognition', 'Basic counting'],
        prerequisites: []
      },
      {
        id: 'math',
        skillLevel: 'beginner',
        learningObjectives: ['Basic addition', 'Number patterns'],
        prerequisites: ['numbers']
      },
      {
        id: 'letters',
        skillLevel: 'beginner',
        learningObjectives: ['Letter recognition', 'Basic phonics'],
        prerequisites: []
      },
      {
        id: 'colors',
        skillLevel: 'beginner',
        learningObjectives: ['Color recognition', 'Color mixing'],
        prerequisites: []
      },
      {
        id: 'shapes',
        skillLevel: 'beginner',
        learningObjectives: ['Shape recognition', 'Basic geometry'],
        prerequisites: []
      },
      {
        id: 'geography',
        skillLevel: 'beginner',
        learningObjectives: ['Map reading', 'Basic geography'],
        prerequisites: []
      }
    ];
  }

  // Additional helper methods (preserved from original implementation)
  private calculateWeeksActive(): number {
    // Get first and last session dates from the database
    const firstSession = this.getFirstSessionDate();
    const lastSession = this.getLastSessionDate();
    
    if (!firstSession || !lastSession) {
      return 0;
    }

    const weeksDiff = Math.ceil(
      (lastSession.getTime() - firstSession.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    
    return Math.max(1, weeksDiff); // Minimum 1 week to avoid division by zero
  }

  private calculatePlayConsistency(): number {
    // Legacy method - return default value
    return 0.5; // Default for new users
  }

  private calculateSubjectEffectiveness(): number {
    // Legacy method - return default value
    return 0;
  }

  private getFirstSessionDate(): Date | null {
    // Legacy method - return null
    return null;
  }

  private getLastSessionDate(): Date | null {
    // Legacy method - return null
    return null;
  }


}

// Export singleton instance
export const analyticsService = new SupabaseAnalyticsService(); 