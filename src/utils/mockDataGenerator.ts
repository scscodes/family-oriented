/**
 * Mock Data Generator for Analytics Testing
 * Creates realistic analytics data using the demo user with multiple avatars
 * representing different learning levels and gameplay patterns
 */

import { analyticsService } from './analyticsService';
import { GAMES } from './gameData';
import { GameType } from './gameUtils';

// Demo user ID (already exists in the system)
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

// Avatar profiles representing different learning levels and patterns
const AVATAR_PROFILES = [
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

/**
 * Enhanced Mock Data Generator Class
 */
export class MockDataGenerator {
  
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
        { gameId: 'addition', difficulty: 'intermediate', baseScore: 75, variance: 15, duration: 180, questionsCount: 8 },
        { gameId: 'subtraction', difficulty: 'intermediate', baseScore: 70, variance: 20, duration: 200, questionsCount: 8 },
        { gameId: 'fill-in-the-blank', difficulty: 'intermediate', baseScore: 80, variance: 12, duration: 150, questionsCount: 6 },
        { gameId: 'rhyming', difficulty: 'intermediate', baseScore: 72, variance: 18, duration: 120, questionsCount: 7 },
        { gameId: 'patterns', difficulty: 'intermediate', baseScore: 78, variance: 15, duration: 140, questionsCount: 6 }
      ],
      advanced: [
        { gameId: 'addition', difficulty: 'advanced', baseScore: 90, variance: 8, duration: 240, questionsCount: 12 },
        { gameId: 'subtraction', difficulty: 'advanced', baseScore: 88, variance: 10, duration: 220, questionsCount: 10 },
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
        templates = templates.filter(t => ['numbers', 'addition', 'subtraction'].includes(t.gameId));
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

    // Complete session
    await analyticsService.completeGameSession(sessionId, finalScore, attempted, correct);

    return sessionId;
  }

  /**
   * Generate sessions over time for realistic progression
   */
  private async generateSessionsForAvatar(
    profile: typeof AVATAR_PROFILES[0],
    sessionCount: number = 15
  ): Promise<void> {
    console.log(`Generating ${sessionCount} sessions for ${profile.name} (${profile.level}, ${profile.pattern})`);
    
    const templates = this.getSessionTemplatesForProfile(profile.level, profile.pattern);
    
    for (let i = 0; i < sessionCount; i++) {
      // Pick a random game template with some preference for variety
      const template = templates[Math.floor(Math.random() * templates.length)];
      
      try {
        const sessionId = await this.generateGameSession(profile.id, template, i + 1, profile.pattern);
        console.log(`  Session ${i + 1}/${sessionCount}: ${template.gameId} - ${sessionId}`);
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to generate session ${i + 1} for ${profile.name}:`, error);
      }
    }
  }

  /**
   * Generate some abandoned sessions for realistic data
   */
  private async generateAbandonedSessions(avatarId: string, count: number = 2): Promise<void> {
    console.log(`Generating ${count} abandoned sessions for avatar ${avatarId}`);
    
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
        console.log(`  Abandoned session: ${sessionId}`);
      } catch (error) {
        console.error(`Failed to generate abandoned session ${i + 1}:`, error);
      }
    }
  }

  /**
   * Main method to generate comprehensive mock data
   */
  async generateComprehensiveMockData(): Promise<{ success: boolean; summary: any; error?: string }> {
    try {
      console.log('🎯 Starting comprehensive mock data generation...');
      
      const summary = {
        avatarsProcessed: 0,
        totalSessions: 0,
        abandonedSessions: 0,
        errors: []
      };

      // Generate data for each avatar profile
      for (const profile of AVATAR_PROFILES) {
        try {
          console.log(`\n👤 Processing avatar: ${profile.name}`);
          
          // Generate main sessions
          const sessionCount = Math.floor(Math.random() * 10) + 10; // 10-20 sessions per avatar
          await this.generateSessionsForAvatar(profile, sessionCount);
          summary.totalSessions += sessionCount;
          
          // Generate some abandoned sessions
          const abandonedCount = Math.floor(Math.random() * 3) + 1; // 1-3 abandoned sessions
          await this.generateAbandonedSessions(profile.id, abandonedCount);
          summary.abandonedSessions += abandonedCount;
          
          summary.avatarsProcessed += 1;
        } catch (error) {
          console.error(`Error processing avatar ${profile.name}:`, error);
          summary.errors.push(`${profile.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      console.log('\n✅ Mock data generation completed!');
      console.log('Summary:', summary);

      return { success: true, summary };
    } catch (error) {
      console.error('❌ Mock data generation failed:', error);
      return {
        success: false,
        summary: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Quick method to generate basic test data for a specific avatar
   */
  async generateQuickTestData(avatarId: string): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    try {
      console.log(`Generating quick test data for avatar: ${avatarId}`);
      
      const sessionId = await this.generateGameSession(
        avatarId,
        { gameId: 'numbers', difficulty: 'beginner', baseScore: 75, variance: 15, duration: 120, questionsCount: 5 },
        1,
        'steady_improvement'
      );

      return { success: true, sessionId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Clear all analytics data for fresh testing
   */
  async clearAllAnalyticsData(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ Clearing all analytics data...');
      
      // Note: This would require direct database access or admin endpoints
      // For now, just log the intent
      console.log('⚠️ Manual database cleanup required - clear game_sessions, game_events, learning_progress tables');
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const mockDataGenerator = new MockDataGenerator(); 