/**
 * Comprehensive Analytics Service for Game Tracking and Learning Progression
 * Supports both individual user analytics and aggregate platform metrics
 */

import { GameType } from './gameUtils';

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
 * Analytics Service Class
 * Handles all game tracking, learning progression, and performance analytics
 */
export class AnalyticsService {
  private sessions: Map<string, GameSessionData> = new Map();
  private events: GameEventData[] = [];
  private progressData: Map<string, LearningProgressData[]> = new Map();

  /**
   * Start tracking a new game session
   */
  startGameSession(avatarId: string, gameId: GameType, settings: Record<string, unknown>, orgId?: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: GameSessionData = {
      id: sessionId,
      avatarId,
      orgId,
      gameId,
      sessionStart: new Date(),
      totalDuration: 0,
      questionsAttempted: 0,
      questionsCorrect: 0,
      completionStatus: 'in_progress',
      difficultyLevel: 'beginner',
      settingsUsed: settings
    };

    this.sessions.set(sessionId, session);
    
    // Track session start event
    this.trackEvent(sessionId, avatarId, 'game_start', { gameId, settings });
    
    return sessionId;
  }

  /**
   * Track individual game events during a session
   */
  trackEvent(sessionId: string, avatarId: string, eventType: GameEventData['eventType'], eventData: Record<string, unknown>): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.warn(`Session ${sessionId} not found for event tracking`);
      return;
    }

    const event: GameEventData = {
      sessionId,
      avatarId,
      eventType,
      eventData,
      timestamp: new Date(),
      sequenceNumber: this.events.filter(e => e.sessionId === sessionId).length + 1
    };

    this.events.push(event);

    // Update session data based on event
    this.updateSessionFromEvent(session, event);
  }

  /**
   * Complete a game session and calculate final metrics
   */
  completeGameSession(sessionId: string, finalScore: number, questionsAttempted: number, questionsCorrect: number): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.warn(`Session ${sessionId} not found for completion`);
      return;
    }

    session.sessionEnd = new Date();
    session.totalDuration = Math.floor((session.sessionEnd.getTime() - session.sessionStart.getTime()) / 1000);
    session.questionsAttempted = questionsAttempted;
    session.questionsCorrect = questionsCorrect;
    session.completionStatus = 'completed';

    // Track completion event
    this.trackEvent(sessionId, session.avatarId, 'game_complete', {
      finalScore,
      questionsAttempted,
      questionsCorrect,
      duration: session.totalDuration
    });

    // Update learning progress
    this.updateLearningProgress(session, finalScore);
  }

  /**
   * Get learning path recommendations for an avatar
   */
  getLearningPathRecommendations(avatarId: string, maxRecommendations: number = 5): LearningPathRecommendation[] {
    const progress = this.progressData.get(avatarId) || [];
    const recommendations: LearningPathRecommendation[] = [];

    // Import games data for analysis
    // This would typically come from the gameData.ts GAMES array
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
  getPerformanceMetrics(avatarId: string): PerformanceMetrics {
    const progress = this.progressData.get(avatarId) || [];
    const avatarSessions = Array.from(this.sessions.values()).filter(s => s.avatarId === avatarId);

    const totalGamesPlayed = avatarSessions.length;
    const averageSessionDuration = avatarSessions.reduce((sum, s) => sum + s.totalDuration, 0) / totalGamesPlayed || 0;
    const completedSessions = avatarSessions.filter(s => s.completionStatus === 'completed');
    const overallCompletionRate = completedSessions.length / totalGamesPlayed || 0;

    // Calculate skill level distribution
    const skillLevelDistribution = progress.reduce((dist, p) => {
      dist[p.skillLevel] = (dist[p.skillLevel] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);

    // Calculate subject preferences based on play frequency
    const subjectPreferences = this.calculateSubjectPreferences(avatarSessions);

    // Calculate learning velocity (objectives mastered per week)
    const learningVelocity = this.calculateLearningVelocity(progress);

    // Calculate engagement score based on various factors
    const engagementScore = this.calculateEngagementScore(avatarSessions);

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
   * Get aggregate analytics for platform-wide metrics
   */
  getAggregateAnalytics(orgId?: string): {
    totalSessions: number;
    uniquePlayers: number;
    averageDuration: number;
    completionRate: number;
    popularGames: Array<{ gameId: GameType; sessions: number; avgScore: number }>;
    learningEffectiveness: Record<string, number>;
  } {
    const relevantSessions = Array.from(this.sessions.values())
      .filter(s => !orgId || s.orgId === orgId);

    const totalSessions = relevantSessions.length;
    const uniquePlayers = new Set(relevantSessions.map(s => s.avatarId)).size;
    const averageDuration = relevantSessions.reduce((sum, s) => sum + s.totalDuration, 0) / totalSessions || 0;
    const completedSessions = relevantSessions.filter(s => s.completionStatus === 'completed');
    const completionRate = completedSessions.length / totalSessions || 0;

    // Calculate popular games
    const gameStats = relevantSessions.reduce((stats, session) => {
      if (!stats[session.gameId]) {
        stats[session.gameId] = { sessions: 0, totalScore: 0, completedSessions: 0 };
      }
      stats[session.gameId].sessions++;
      if (session.completionStatus === 'completed') {
        stats[session.gameId].completedSessions++;
        stats[session.gameId].totalScore += (session.questionsCorrect / session.questionsAttempted) * 100 || 0;
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
    const learningEffectiveness = this.calculateLearningEffectiveness(relevantSessions);

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

  private updateLearningProgress(session: GameSessionData, finalScore: number): void {
    const avatarProgress = this.progressData.get(session.avatarId) || [];
    let gameProgress = avatarProgress.find(p => p.gameId === session.gameId);

    if (!gameProgress) {
      gameProgress = {
        avatarId: session.avatarId,
        gameId: session.gameId,
        skillLevel: 'beginner',
        masteryScore: 0,
        learningObjectivesMet: [],
        prerequisiteCompletion: {},
        lastPlayed: new Date(),
        totalSessions: 0,
        averagePerformance: 0,
        improvementTrend: 'stable'
      };
      avatarProgress.push(gameProgress);
    }

    // Update progress metrics
    gameProgress.lastPlayed = new Date();
    gameProgress.totalSessions++;
    
    const previousAverage = gameProgress.averagePerformance;
    gameProgress.averagePerformance = (previousAverage * (gameProgress.totalSessions - 1) + finalScore) / gameProgress.totalSessions;
    
    // Determine improvement trend
    if (gameProgress.totalSessions > 1) {
      if (gameProgress.averagePerformance > previousAverage * 1.1) {
        gameProgress.improvementTrend = 'improving';
      } else if (gameProgress.averagePerformance < previousAverage * 0.9) {
        gameProgress.improvementTrend = 'declining';
      } else {
        gameProgress.improvementTrend = 'stable';
      }
    }

    // Update mastery score (weighted average favoring recent performance)
    gameProgress.masteryScore = Math.min(100, (gameProgress.masteryScore * 0.7) + (finalScore * 0.3));

    // Check for skill level advancement
    if (gameProgress.masteryScore >= 80 && gameProgress.skillLevel === 'beginner') {
      gameProgress.skillLevel = 'intermediate';
    } else if (gameProgress.masteryScore >= 90 && gameProgress.skillLevel === 'intermediate') {
      gameProgress.skillLevel = 'advanced';
    }

    this.progressData.set(session.avatarId, avatarProgress);
  }

  private calculateGameRecommendation(
    game: { id: string; prerequisites?: string[]; learningObjectives?: string[] }, 
    gameProgress?: LearningProgressData, 
    allProgress?: LearningProgressData[]
  ): LearningPathRecommendation | null {
    // This would integrate with the actual GAMES array from gameData.ts
    // For now, using placeholder logic
    
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

  private calculateLearningEffectiveness(sessions: GameSessionData[]): Record<string, number> {
    // Calculate effectiveness by subject based on improvement over time
    const subjectEffectiveness: Record<string, number> = {};
    
    // Placeholder implementation - would group sessions by subject in real implementation
    const subject = this.getGameSubject();
    const effectiveness = sessions.length > 0 ? this.calculateSubjectEffectiveness() : 0;
    subjectEffectiveness[subject] = effectiveness;

    return subjectEffectiveness;
  }

  // Additional helper methods would be implemented here...
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
export const analyticsService = new AnalyticsService(); 