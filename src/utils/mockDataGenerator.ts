/**
 * Mock Data Generator for Analytics Testing
 * Creates realistic analytics data using the demo user with multiple avatars
 * representing different learning levels and gameplay patterns
 */

import { analyticsService } from './analyticsService';
import { GameType } from './gameUtils';
import { createClient } from '@/lib/supabase/client';
import { logger } from './logger';

type AvatarProfile = {
  id: string;
  name: string;
  level: SkillLevel;
  pattern: LearningPattern;
};

// Avatar profiles representing different learning levels and patterns
const AVATAR_PROFILES: AvatarProfile[] = [
  // Original hardcoded demo avatar (kept for backward compatibility)
  {
    id: '00000000-0000-0000-0000-000000000002', // Existing demo avatar
    name: 'My Child',
    level: 'beginner',
    pattern: 'steady_improvement'
  },
  {
    id: '00000000-0000-0000-0000-000000000012',
    name: 'Quick Learner',
    level: 'advanced',
    pattern: 'high_performer'
  },
  {
    id: '00000000-0000-0000-0000-000000000013',
    name: 'Struggling Student',
    level: 'beginner',
    pattern: 'needs_support'
  },
  {
    id: '00000000-0000-0000-0000-000000000014',
    name: 'Consistent Player',
    level: 'intermediate',
    pattern: 'steady_player'
  },
  {
    id: '00000000-0000-0000-0000-000000000015',
    name: 'Math Enthusiast',
    level: 'intermediate',
    pattern: 'subject_focused'
  },

  // New demo scenario avatars - Personal Basic (2 avatars)
  {
    id: 'demo-personal-basic-avatar-1',
    name: 'Demo Child 1',
    level: 'beginner',
    pattern: 'steady_improvement'
  },
  {
    id: 'demo-personal-basic-avatar-2',
    name: 'Demo Child 2',
    level: 'intermediate',
    pattern: 'steady_player'
  },

  // Personal Limit (5 avatars)
  {
    id: 'demo-personal-limit-avatar-1',
    name: 'Demo Child 1',
    level: 'beginner',
    pattern: 'steady_improvement'
  },
  {
    id: 'demo-personal-limit-avatar-2',
    name: 'Demo Child 2',
    level: 'intermediate',
    pattern: 'steady_player'
  },
  {
    id: 'demo-personal-limit-avatar-3',
    name: 'Demo Child 3',
    level: 'advanced',
    pattern: 'high_performer'
  },
  {
    id: 'demo-personal-limit-avatar-4',
    name: 'Demo Child 4',
    level: 'beginner',
    pattern: 'needs_support'
  },
  {
    id: 'demo-personal-limit-avatar-5',
    name: 'Demo Child 5',
    level: 'intermediate',
    pattern: 'subject_focused'
  },

  // Professional Educator (15 avatars - representative sample)
  {
    id: 'demo-professional-educator-avatar-1',
    name: 'Demo Child 1',
    level: 'beginner',
    pattern: 'steady_improvement'
  },
  {
    id: 'demo-professional-educator-avatar-2',
    name: 'Demo Child 2',
    level: 'intermediate',
    pattern: 'steady_player'
  },
  {
    id: 'demo-professional-educator-avatar-3',
    name: 'Demo Child 3',
    level: 'advanced',
    pattern: 'high_performer'
  },
  {
    id: 'demo-professional-educator-avatar-4',
    name: 'Demo Child 4',
    level: 'beginner',
    pattern: 'needs_support'
  },
  {
    id: 'demo-professional-educator-avatar-5',
    name: 'Demo Child 5',
    level: 'intermediate',
    pattern: 'subject_focused'
  },
  {
    id: 'demo-professional-educator-avatar-6',
    name: 'Demo Child 6',
    level: 'advanced',
    pattern: 'steady_improvement'
  },
  {
    id: 'demo-professional-educator-avatar-7',
    name: 'Demo Child 7',
    level: 'beginner',
    pattern: 'steady_player'
  },
  {
    id: 'demo-professional-educator-avatar-8',
    name: 'Demo Child 8',
    level: 'intermediate',
    pattern: 'high_performer'
  },

  // Professional Admin (25 avatars - representative sample)
  {
    id: 'demo-professional-admin-avatar-1',
    name: 'Demo Child 1',
    level: 'beginner',
    pattern: 'steady_improvement'
  },
  {
    id: 'demo-professional-admin-avatar-2',
    name: 'Demo Child 2',
    level: 'intermediate',
    pattern: 'steady_player'
  },
  {
    id: 'demo-professional-admin-avatar-3',
    name: 'Demo Child 3',
    level: 'advanced',
    pattern: 'high_performer'
  },
  {
    id: 'demo-professional-admin-avatar-4',
    name: 'Demo Child 4',
    level: 'beginner',
    pattern: 'needs_support'
  },
  {
    id: 'demo-professional-admin-avatar-5',
    name: 'Demo Child 5',
    level: 'intermediate',
    pattern: 'subject_focused'
  },
  {
    id: 'demo-professional-admin-avatar-10',
    name: 'Demo Child 10',
    level: 'advanced',
    pattern: 'steady_improvement'
  },
  {
    id: 'demo-professional-admin-avatar-15',
    name: 'Demo Child 15',
    level: 'intermediate',
    pattern: 'steady_player'
  },
  {
    id: 'demo-professional-admin-avatar-20',
    name: 'Demo Child 20',
    level: 'beginner',
    pattern: 'high_performer'
  },

  // Enterprise Full (150 avatars - representative sample)
  {
    id: 'demo-enterprise-full-avatar-1',
    name: 'Demo Child 1',
    level: 'beginner',
    pattern: 'steady_improvement'
  },
  {
    id: 'demo-enterprise-full-avatar-2',
    name: 'Demo Child 2',
    level: 'intermediate',
    pattern: 'steady_player'
  },
  {
    id: 'demo-enterprise-full-avatar-3',
    name: 'Demo Child 3',
    level: 'advanced',
    pattern: 'high_performer'
  },
  {
    id: 'demo-enterprise-full-avatar-4',
    name: 'Demo Child 4',
    level: 'beginner',
    pattern: 'needs_support'
  },
  {
    id: 'demo-enterprise-full-avatar-5',
    name: 'Demo Child 5',
    level: 'intermediate',
    pattern: 'subject_focused'
  },
  {
    id: 'demo-enterprise-full-avatar-25',
    name: 'Demo Child 25',
    level: 'advanced',
    pattern: 'steady_improvement'
  },
  {
    id: 'demo-enterprise-full-avatar-50',
    name: 'Demo Child 50',
    level: 'intermediate',
    pattern: 'steady_player'
  },
  {
    id: 'demo-enterprise-full-avatar-75',
    name: 'Demo Child 75',
    level: 'beginner',
    pattern: 'high_performer'
  },
  {
    id: 'demo-enterprise-full-avatar-100',
    name: 'Demo Child 100',
    level: 'advanced',
    pattern: 'needs_support'
  },
  {
    id: 'demo-enterprise-full-avatar-125',
    name: 'Demo Child 125',
    level: 'intermediate',
    pattern: 'subject_focused'
  },

  // Educator Only (0 avatars in demoConfig but we'll add some for testing)
  {
    id: 'demo-educator-only-avatar-1',
    name: 'Test Student',
    level: 'intermediate',
    pattern: 'steady_player'
  }
] as const;

type LearningPattern = 'steady_improvement' | 'high_performer' | 'needs_support' | 'steady_player' | 'subject_focused';
type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

interface GameSessionTemplate {
  gameId: GameType;
  difficulty: string;
  baseScore: number;
  variance: number;
  duration: number;
  questionsCount: number;
}


interface QuickTestResult {
  success: boolean;
  sessionId?: string;
  error?: string;
}

interface ClearDataResult {
  success: boolean;
  error?: string;
}

interface SessionForProgress {
  game_type: GameType;
  completion_status: string;
  score_data?: { finalScore?: number } | null;
}

interface ProgressSummary {
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  masteryScore: number;
  learningObjectivesMet: string[];
  prerequisiteCompletion: Record<string, boolean>;
  totalSessions: number;
  averagePerformance: number;
  improvementTrend: 'improving' | 'stable' | 'declining';
}

/**
 * Enhanced Mock Data Generator Class
 */
export class MockDataGenerator {
  private supabase = createClient();
  
  /**
   * Generate realistic session templates based on avatar profile
   */
  private getSessionTemplatesForProfile(level: SkillLevel, pattern: LearningPattern): GameSessionTemplate[] {
    const baseTemplates: Record<SkillLevel, GameSessionTemplate[]> = {
      beginner: [
        { gameId: 'numbers', difficulty: 'beginner', baseScore: 60, variance: 20, duration: 120, questionsCount: 5 },
        { gameId: 'letters', difficulty: 'beginner', baseScore: 65, variance: 15, duration: 90, questionsCount: 4 },
        { gameId: 'colors', difficulty: 'beginner', baseScore: 75, variance: 10, duration: 60, questionsCount: 6 },
        { gameId: 'shapes', difficulty: 'beginner', baseScore: 70, variance: 15, duration: 80, questionsCount: 5 }
      ],
      intermediate: [
        { gameId: 'math', difficulty: 'intermediate', baseScore: 75, variance: 15, duration: 180, questionsCount: 8 },
        { gameId: 'math', difficulty: 'intermediate', baseScore: 70, variance: 20, duration: 200, questionsCount: 8 },
        { gameId: 'fill-in-the-blank', difficulty: 'intermediate', baseScore: 80, variance: 12, duration: 150, questionsCount: 6 },
        { gameId: 'rhyming', difficulty: 'intermediate', baseScore: 72, variance: 18, duration: 120, questionsCount: 7 },
        { gameId: 'patterns', difficulty: 'intermediate', baseScore: 78, variance: 15, duration: 140, questionsCount: 6 }
      ],
      advanced: [
        { gameId: 'math', difficulty: 'advanced', baseScore: 90, variance: 8, duration: 240, questionsCount: 12 },
        { gameId: 'math', difficulty: 'advanced', baseScore: 88, variance: 10, duration: 220, questionsCount: 10 },
        { gameId: 'geography', difficulty: 'advanced', baseScore: 85, variance: 12, duration: 300, questionsCount: 15 },
        { gameId: 'fill-in-the-blank', difficulty: 'advanced', baseScore: 92, variance: 6, duration: 180, questionsCount: 8 }
      ]
    };

    let templates = [...baseTemplates[level]];

    // Modify templates based on learning pattern
    switch (pattern) {
      case 'high_performer':
        templates = templates.map(t => ({ ...t, baseScore: t.baseScore + 15, variance: t.variance - 5 }));
        break;
      case 'needs_support':
        templates = templates.map(t => ({ ...t, baseScore: t.baseScore - 20, variance: t.variance + 10 }));
        break;
      case 'subject_focused':
        // Focus on math games
        templates = templates.filter(t => ['numbers', 'math'].includes(t.gameId));
        templates = templates.map(t => ({ ...t, baseScore: t.baseScore + 10 }));
        break;
    }

    return templates;
  }

  /**
   * Generate score with realistic progression over time
   */
  private generateProgressiveScore(
    baseScore: number, 
    variance: number, 
    sessionNumber: number, 
    pattern: LearningPattern
  ): number {
    let progressionFactor = 0;
    
    switch (pattern) {
      case 'steady_improvement':
        progressionFactor = Math.min(sessionNumber * 2, 20); // Improve by 2% per session, max 20%
        break;
      case 'high_performer':
        progressionFactor = Math.min(sessionNumber * 1, 10); // Already high, small improvements
        break;
      case 'needs_support':
        progressionFactor = Math.min(sessionNumber * 0.5, 10); // Slow improvement
        break;
      case 'steady_player':
        progressionFactor = Math.min(sessionNumber * 1.5, 15); // Steady improvement
        break;
      case 'subject_focused':
        progressionFactor = Math.min(sessionNumber * 3, 25); // Fast improvement in focused area
        break;
    }

    const randomVariance = (Math.random() - 0.5) * variance;
    const score = Math.max(0, Math.min(100, baseScore + progressionFactor + randomVariance));
    
    return Math.round(score);
  }

  /**
   * Generate realistic question attempt data
   */
  private generateQuestionAttempts(finalScore: number, questionsCount: number): { correct: number; attempted: number } {
    const accuracy = finalScore / 100;
    const attempted = questionsCount;
    const correct = Math.round(attempted * accuracy);
    
    return { correct: Math.min(correct, attempted), attempted };
  }

  /**
   * Generate a realistic game session with events
   */
  private async generateGameSession(
    avatarId: string,
    template: GameSessionTemplate,
    sessionNumber: number,
    pattern: LearningPattern
  ): Promise<string> {
    const finalScore = this.generateProgressiveScore(
      template.baseScore,
      template.variance,
      sessionNumber,
      pattern
    );

    const { correct, attempted } = this.generateQuestionAttempts(finalScore, template.questionsCount);

    // Start session
    const sessionId = await analyticsService.startGameSession(
      avatarId,
      template.gameId,
      {
        difficulty: template.difficulty,
        questionsPerSession: template.questionsCount
      }
    );

    // Generate realistic question events
    for (let i = 0; i < attempted; i++) {
      const isCorrect = i < correct || Math.random() < (finalScore / 100);
      
      await analyticsService.trackEvent(sessionId, avatarId, 'question_answer', {
        correct: isCorrect,
        questionNumber: i + 1,
        timeSpent: Math.round(Math.random() * 15 + 5), // 5-20 seconds per question
        hintsUsed: isCorrect ? 0 : Math.floor(Math.random() * 2) // 0-1 hints if incorrect
      });

      // Occasionally track other events
      if (Math.random() < 0.1) {
        await analyticsService.trackEvent(sessionId, avatarId, 'game_pause', {
          questionNumber: i + 1
        });
      }
    }

    await analyticsService.completeGameSession(sessionId, finalScore, attempted, correct);

    return sessionId;
  }

  /**
   * Generate sessions over time for realistic progression
   */
  private async generateSessionsForAvatar(
    profile: AvatarProfile,
    sessionCount: number = 15
  ): Promise<void> {
    logger.info(`Generating ${sessionCount} sessions for ${profile.name} (${profile.level}, ${profile.pattern})`);
    
    const templates = this.getSessionTemplatesForProfile(profile.level, profile.pattern);
    
    for (let i = 0; i < sessionCount; i++) {
      // Pick a random game template with some preference for variety
      const template = templates[Math.floor(Math.random() * templates.length)];
      
      try {
        const sessionId = await this.generateGameSession(profile.id, template, i + 1, profile.pattern);
        logger.info(`  Session ${i + 1}/${sessionCount}: ${template.gameId} - ${sessionId}`);
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        logger.error(`Failed to generate session ${i + 1} for ${profile.name}:`, error);
      }
    }
  }

  /**
   * Generate some abandoned sessions for realistic data
   */
  private async generateAbandonedSessions(avatarId: string, count: number = 2): Promise<void> {
    logger.info(`Generating ${count} abandoned sessions for avatar ${avatarId}`);
    
    for (let i = 0; i < count; i++) {
      try {
        const sessionId = await analyticsService.startGameSession(
          avatarId,
          'numbers',
          { difficulty: 'beginner', questionsPerSession: 5 }
        );

        // Track a few events then abandon
        await analyticsService.trackEvent(sessionId, avatarId, 'question_answer', {
          correct: Math.random() > 0.5,
          questionNumber: 1
        });

        if (Math.random() > 0.5) {
          await analyticsService.trackEvent(sessionId, avatarId, 'question_answer', {
            correct: Math.random() > 0.5,
            questionNumber: 2
          });
        }

        // Don't complete the session - it will remain as abandoned
        logger.info(`  Abandoned session: ${sessionId}`);
      } catch (error) {
        logger.error(`Failed to generate abandoned session ${i + 1}:`, error);
      }
    }
  }

  /**
   * Generate validation scenarios for specific test cases
   */
  private async generateValidationScenarios(): Promise<void> {
    logger.info('Generating validation scenarios...');

    // Scenario 1: Rapid skill advancement
    await this.generateRapidAdvancementScenario();
    
    // Scenario 2: Cross-subject learning
    await this.generateCrossSubjectScenario();
    
    // Scenario 3: Regression detection
    await this.generateRegressionScenario();
    
    // Scenario 4: Learning plateaus
    await this.generatePlateauScenario();
  }

  /**
   * Generate data for rapid skill advancement testing
   */
  private async generateRapidAdvancementScenario(): Promise<void> {
    const avatarId = '00000000-0000-0000-0000-000000000002'; // My Child
    const gameId = 'numbers';
    const sessions = [
      { score: 60, questionsCount: 10, duration: 120 },
      { score: 80, questionsCount: 10, duration: 100 },
      { score: 90, questionsCount: 10, duration: 90 },
      { score: 95, questionsCount: 10, duration: 80 }
    ];

    for (const session of sessions) {
      const sessionId = await analyticsService.startGameSession(
        avatarId,
        gameId,
        {
          difficulty: 'beginner',
          questionsPerSession: session.questionsCount
        }
      );

      const correct = Math.round(session.questionsCount * (session.score / 100));
      for (let i = 0; i < session.questionsCount; i++) {
        const isCorrect = i < correct;
        await analyticsService.trackEvent(sessionId, avatarId, 'question_answer', {
          correct: isCorrect,
          questionNumber: i + 1,
          timeSpent: Math.round(session.duration / session.questionsCount),
          hintsUsed: isCorrect ? 0 : Math.floor(Math.random() * 2)
        });
      }

      await analyticsService.completeGameSession(
        sessionId,
        session.score,
        session.questionsCount,
        correct
      );
    }
  }

  /**
   * Generate data for cross-subject learning testing
   */
  private async generateCrossSubjectScenario(): Promise<void> {
    const avatarId = '00000000-0000-0000-0000-000000000014'; // Consistent Player
    const sessions = [
      { gameId: 'numbers', score: 75, questionsCount: 8, duration: 120 },
      { gameId: 'letters', score: 70, questionsCount: 8, duration: 130 },
      { gameId: 'colors', score: 80, questionsCount: 8, duration: 110 },
      { gameId: 'shapes', score: 85, questionsCount: 8, duration: 100 }
    ];

    for (const session of sessions) {
      const sessionId = await analyticsService.startGameSession(
        avatarId,
        session.gameId,
        {
          difficulty: 'intermediate',
          questionsPerSession: session.questionsCount
        }
      );

      const correct = Math.round(session.questionsCount * (session.score / 100));
      for (let i = 0; i < session.questionsCount; i++) {
        const isCorrect = i < correct;
        await analyticsService.trackEvent(sessionId, avatarId, 'question_answer', {
          correct: isCorrect,
          questionNumber: i + 1,
          timeSpent: Math.round(session.duration / session.questionsCount),
          hintsUsed: isCorrect ? 0 : Math.floor(Math.random() * 2)
        });
      }

      await analyticsService.completeGameSession(
        sessionId,
        session.score,
        session.questionsCount,
        correct
      );
    }
  }

  /**
   * Generate data for regression detection testing
   */
  private async generateRegressionScenario(): Promise<void> {
    const avatarId = '00000000-0000-0000-0000-000000000013'; // Struggling Student
    const gameId = 'math';
    const sessions = [
      { score: 80, questionsCount: 10, duration: 120 },
      { score: 75, questionsCount: 10, duration: 130 },
      { score: 65, questionsCount: 10, duration: 140 },
      { score: 60, questionsCount: 10, duration: 150 }
    ];

    for (const session of sessions) {
      const sessionId = await analyticsService.startGameSession(
        avatarId,
        gameId,
        {
          difficulty: 'intermediate',
          questionsPerSession: session.questionsCount
        }
      );

      const correct = Math.round(session.questionsCount * (session.score / 100));
      for (let i = 0; i < session.questionsCount; i++) {
        const isCorrect = i < correct;
        await analyticsService.trackEvent(sessionId, avatarId, 'question_answer', {
          correct: isCorrect,
          questionNumber: i + 1,
          timeSpent: Math.round(session.duration / session.questionsCount),
          hintsUsed: isCorrect ? 0 : Math.floor(Math.random() * 2)
        });
      }

      await analyticsService.completeGameSession(
        sessionId,
        session.score,
        session.questionsCount,
        correct
      );
    }
  }

  /**
   * Generate data for learning plateau testing
   */
  private async generatePlateauScenario(): Promise<void> {
    const avatarId = '00000000-0000-0000-0000-000000000015'; // Math Enthusiast
    const gameId = 'math';
    const sessions = [
      { score: 85, questionsCount: 10, duration: 120 },
      { score: 87, questionsCount: 10, duration: 118 },
      { score: 86, questionsCount: 10, duration: 122 },
      { score: 88, questionsCount: 10, duration: 115 }
    ];

    for (const session of sessions) {
      const sessionId = await analyticsService.startGameSession(
        avatarId,
        gameId,
        {
          difficulty: 'advanced',
          questionsPerSession: session.questionsCount
        }
      );

      const correct = Math.round(session.questionsCount * (session.score / 100));
      for (let i = 0; i < session.questionsCount; i++) {
        const isCorrect = i < correct;
        await analyticsService.trackEvent(sessionId, avatarId, 'question_answer', {
          correct: isCorrect,
          questionNumber: i + 1,
          timeSpent: Math.round(session.duration / session.questionsCount),
          hintsUsed: isCorrect ? 0 : Math.floor(Math.random() * 2)
        });
      }

      await analyticsService.completeGameSession(
        sessionId,
        session.score,
        session.questionsCount,
        correct
      );
    }
  }

  /**
   * Check if an avatar has specific mock data patterns
   */
  private async getMissingDataPatterns(avatarId: string): Promise<{
    hasRegularSessions: boolean;
    hasAbandonedSessions: boolean;
    hasValidationScenarios: boolean;
  }> {
    try {
      const sessions = await analyticsService.getAvatarSessions(avatarId);
      
      // Check for regular sessions (15 sessions)
      const hasRegularSessions = sessions.filter(s => 
        s.completionStatus !== 'abandoned' && s.gameId !== 'math' && s.gameId !== 'numbers'
      ).length >= 15;

      // Check for abandoned sessions (2 sessions)
      const hasAbandonedSessions = sessions.filter(s => 
        s.completionStatus === 'abandoned'
      ).length >= 2;

      // Check for validation scenarios (16 sessions across 4 scenarios)
      const hasValidationScenarios = sessions.filter(s => 
        (s.gameId === 'math' || s.gameId === 'numbers') && 
        s.completionStatus !== 'abandoned'
      ).length >= 16;

      return {
        hasRegularSessions,
        hasAbandonedSessions,
        hasValidationScenarios
      };
    } catch (err) {
      logger.error('Error checking data patterns:', err);
      return {
        hasRegularSessions: false,
        hasAbandonedSessions: false,
        hasValidationScenarios: false
      };
    }
  }

  /**
   * Generate comprehensive mock data for testing
   */
  async generateComprehensiveMockData(): Promise<{ success: boolean; message: string }> {
    try {
      logger.info('Starting comprehensive mock data generation...');
      
      // Get all avatars
      const { data: avatars, error: avatarError } = await this.supabase
        .from('avatars')
        .select('*');
      
      if (avatarError) throw avatarError;
      if (!avatars?.length) throw new Error('No avatars found');
      
      logger.info(`Found ${avatars.length} avatars to generate data for`);
      logger.info('Avatar details:', avatars.map(a => ({ id: a.id, name: a.name })));

      // Check for existing game sessions
      const { data: existingSessions, error: sessionError } = await this.supabase
        .from('game_sessions')
        .select('*');
      
      if (sessionError) throw sessionError;
      logger.info(`Found ${existingSessions?.length || 0} existing game sessions`);

      // Generate data for each avatar
      for (const avatar of avatars) {
        logger.info(`\nGenerating data for avatar: ${avatar.name} (${avatar.id})`);
        
        // Check if this avatar already has sessions
        const existingAvatarSessions = existingSessions?.filter(s => s.avatar_id === avatar.id) || [];
        logger.info(`Avatar ${avatar.name} already has ${existingAvatarSessions.length} sessions`);
        
        if (existingAvatarSessions.length > 0) {
          logger.info(`Skipping ${avatar.name} - already has sessions`);
          continue;
        }
        
        // Generate 15-20 game sessions per avatar
        const sessionCount = Math.floor(Math.random() * 6) + 15; // 15-20 sessions
        logger.info(`Will generate ${sessionCount} sessions for this avatar`);

        for (let i = 0; i < sessionCount; i++) {
          const gameType = this.getRandomGameType();
          const sessionStart = new Date();
          sessionStart.setDate(sessionStart.getDate() - Math.floor(Math.random() * 30)); // Random date in last 30 days
          
          const questionsAttempted = Math.floor(Math.random() * 5) + 5; // 5-10 questions
          const questionsCorrect = Math.floor(Math.random() * 5) + 3; // 3-8 correct
          const finalScore = Math.floor(Math.random() * 40) + 60; // 60-100 score
          
          const session = {
            avatar_id: avatar.id,
            game_type: gameType,
            session_start: sessionStart.toISOString(),
            session_end: new Date(sessionStart.getTime() + (Math.random() * 600 + 300) * 1000).toISOString(), // 5-15 minutes
            total_duration: Math.floor(Math.random() * 600 + 300), // 5-15 minutes in seconds
            questions_attempted: questionsAttempted,
            questions_correct: questionsCorrect,
            completion_status: Math.random() > 0.1 ? 'completed' : 'abandoned', // 90% completion rate
            difficulty_level: 'beginner',
            settings_used: {
              difficulty: 'beginner',
              timeLimit: 600,
              hintsEnabled: true
            },
            score_data: {
              finalScore,
              accuracy: questionsCorrect / questionsAttempted,
              questionsCorrect,
              questionsAttempted,
              completionRate: Math.random() > 0.1 ? 1.0 : 0.0
            }
          };

          logger.info(`\nGenerating session ${i + 1}/${sessionCount} for ${avatar.name}:`);
          logger.info('- Avatar ID:', avatar.id);
          logger.info('- Game Type:', gameType);
          logger.info('- Duration:', session.total_duration, 'seconds');
          logger.info('- Questions:', session.questions_attempted, 'attempted,', session.questions_correct, 'correct');
          logger.info('- Score:', session.score_data.finalScore);
          logger.info('- Status:', session.completion_status);

          const { data: sessionData, error: sessionError } = await this.supabase
            .from('game_sessions')
            .insert(session)
            .select()
            .single();

          if (sessionError) {
            logger.error('Error creating session:', sessionError);
            throw sessionError;
          }
          if (!sessionData) {
            logger.warn('No session data returned after insert');
            continue;
          }

          logger.info('Successfully created session with ID:', sessionData.id);

          // Generate 5-10 events per session
          const eventCount = Math.floor(Math.random() * 6) + 5;
          logger.info(`Generating ${eventCount} events for this session`);

          for (let j = 0; j < eventCount; j++) {
            const event = {
              session_id: sessionData.id,
              avatar_id: avatar.id,
              event_type: this.getRandomEventType(),
              event_data: {
                questionNumber: j + 1,
                correct: Math.random() > 0.3,
                timeSpent: Math.floor(Math.random() * 15) + 5,
                hintsUsed: Math.floor(Math.random() * 2)
              },
              timestamp: new Date(sessionStart.getTime() + (j * 60000)).toISOString(), // 1 minute apart
              sequence_number: j + 1
            };

            const { error: eventError } = await this.supabase
              .from('game_events')
              .insert(event);

            if (eventError) {
              logger.error('Error creating event:', eventError);
              throw eventError;
            }
          }
        }

        // Calculate and store learning progress
        const { data: newAvatarSessions, error: progressError } = await this.supabase
          .from('game_sessions')
          .select('*')
          .eq('avatar_id', avatar.id);

        if (progressError) throw progressError;
        if (!newAvatarSessions?.length) {
          logger.warn(`No sessions found for avatar ${avatar.id} to calculate progress`);
          continue;
        }

        logger.info(`\nCalculating learning progress for ${avatar.name}:`);
        logger.info(`Found ${newAvatarSessions.length} sessions for progress calculation`);
        const progress = this.calculateLearningProgress(
          newAvatarSessions.map(session => ({
            game_type: session.game_type as GameType,
            completion_status: session.completion_status || 'completed',
            score_data: session.score_data as { finalScore?: number } | null
          }))
        );
        logger.info('Progress data:', progress);

        // Store progress in learning_progress table
        for (const [gameType, gameProgress] of Object.entries(progress)) {
          const { error: insertError } = await this.supabase
            .from('learning_progress')
            .insert({
              avatar_id: avatar.id,
              game_type: gameType,
              skill_level: gameProgress.skillLevel,
              mastery_score: gameProgress.masteryScore,
              learning_objectives_met: gameProgress.learningObjectivesMet || [],
              prerequisite_completion: gameProgress.prerequisiteCompletion || {},
              last_played: new Date().toISOString(),
              total_sessions: gameProgress.totalSessions,
              average_performance: gameProgress.averagePerformance,
              improvement_trend: gameProgress.improvementTrend
            });

          if (insertError) {
            logger.error('Error storing progress:', insertError);
            throw insertError;
          }
        }
      }

      logger.info('\nMock data generation completed successfully');
      return {
        success: true,
        message: `Generated mock data for ${avatars.length} avatars`
      };
    } catch (err) {
      logger.error('Error generating mock data:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  }

  private calculateLearningProgress(
    sessions: SessionForProgress[]
  ): Record<string, ProgressSummary> {
    const progress: Record<string, ProgressSummary> = {};
    
    // Group sessions by game type
    const sessionsByGame = sessions.reduce<Record<string, SessionForProgress[]>>( (acc, session) => {
      if (!acc[session.game_type]) {
        acc[session.game_type] = [];
      }
      acc[session.game_type].push(session);
      return acc;
    }, {});

    // Calculate progress for each game type
    for (const [gameType, gameSessions] of Object.entries(sessionsByGame)) {
      const completedSessions = gameSessions.filter(s => s.completion_status === 'completed');
      const totalSessions = gameSessions.length;

      // Calculate average score with proper null checks
      let averageScore = 0;
      if (completedSessions.length > 0) {
        const totalScore = completedSessions.reduce((sum, s) => {
          const score = s.score_data?.finalScore || 0;
          return sum + score;
        }, 0);
        averageScore = totalScore / completedSessions.length;
      }
      
      // Determine skill level based on average score
      let skillLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
      if (averageScore >= 90) {
        skillLevel = 'advanced';
      } else if (averageScore >= 70) {
        skillLevel = 'intermediate';
      }

      // Calculate mastery score (0-100)
      const masteryScore = Math.min(100, averageScore);

      // Determine improvement trend
      let improvementTrend: 'improving' | 'stable' | 'declining' = 'stable';
      if (totalSessions >= 3) {
        const recentSessions = completedSessions.slice(-3);
        if (recentSessions.length > 0) {
          const recentAverage = recentSessions.reduce((sum, s) => {
            const score = s.score_data?.finalScore || 0;
            return sum + score;
          }, 0) / recentSessions.length;

          if (recentAverage > averageScore * 1.1) {
            improvementTrend = 'improving';
          } else if (recentAverage < averageScore * 0.9) {
            improvementTrend = 'declining';
          }
        }
      }

      progress[gameType] = {
        skillLevel,
        masteryScore,
        learningObjectivesMet: [],
        prerequisiteCompletion: {},
        totalSessions,
        averagePerformance: averageScore,
        improvementTrend
      };
    }

    return progress;
  }

  private getRandomGameType(): string {
    const gameTypes = ['numbers', 'math', 'letters', 'shapes', 'colors', 'animals'];
    return gameTypes[Math.floor(Math.random() * gameTypes.length)];
  }

  private getRandomEventType(): string {
    const eventTypes = ['question_start', 'question_answer', 'hint_used', 'game_pause', 'game_resume'];
    return eventTypes[Math.floor(Math.random() * eventTypes.length)];
  }

  /**
   * Generate quick test data for a single avatar
   */
  async generateQuickTestData(avatarId: string): Promise<QuickTestResult> {
    try {
      const profile = AVATAR_PROFILES.find(p => p.id === avatarId);
      if (!profile) {
        throw new Error(`Avatar ${avatarId} not found in demo profiles`);
      }

      const templates = this.getSessionTemplatesForProfile(profile.level, profile.pattern);
      const template = templates[Math.floor(Math.random() * templates.length)];
      
      const sessionId = await this.generateGameSession(profile.id, template, 1, profile.pattern);
      return { success: true, sessionId };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  }

  /**
   * Clear all analytics data for testing
   */
  async clearAllAnalyticsData(): Promise<ClearDataResult> {
    try {
      // Clear game_sessions table
      const { error: sessionsError } = await this.supabase
        .from('game_sessions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Keep the dummy record

      if (sessionsError) throw sessionsError;

      // Clear game_events table
      const { error: eventsError } = await this.supabase
        .from('game_events')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Keep the dummy record

      if (eventsError) throw eventsError;

      // Clear learning_progress table
      const { error: progressError } = await this.supabase
        .from('learning_progress')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Keep the dummy record

      if (progressError) throw progressError;

      return { success: true };
    } catch (err) {
      logger.error('Failed to clear analytics data:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const mockDataGenerator = new MockDataGenerator(); 