/**
 * Analytics debugging and testing utilities
 * Helps diagnose issues with analytics service and database connectivity
 */

import { createClient } from '@/lib/supabase/client';
import { analyticsService } from './analyticsService';
import { mockDataGenerator } from './mockDataGenerator';
import { User } from '@supabase/supabase-js';
import { LearningProgressData, LearningPathRecommendation, PerformanceMetrics } from './analyticsService';
import { logger } from './logger';

interface Avatar {
  id: string;
  user_id: string;
  name: string;
  [key: string]: unknown;
}

export class AnalyticsDebugger {
  private supabase = createClient();

  /**
   * Test basic Supabase connectivity and permissions
   */
  async testSupabaseConnection(): Promise<{ success: boolean; error?: string; user?: User | null }> {
    try {
      // Test auth status
      const { data: { session }, error: authError } = await this.supabase.auth.getSession();
      if (authError) throw authError;

      logger.info('Supabase Auth Session:', session);

      // Test basic query (should work without auth)
      const { error } = await this.supabase
        .from('subscription_plans')
        .select('id, name')
        .limit(1);

      if (error) throw error;

      return {
        success: true,
        user: session?.user || null
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  }

  /**
   * Test avatar access and RLS policies
   */
  async testAvatarAccess(avatarId: string): Promise<{ success: boolean; error?: string; avatar?: Avatar }> {
    try {
      logger.info('Testing avatar access for:', avatarId);

      const { data, error } = await this.supabase
        .from('avatars')
        .select('*')
        .eq('id', avatarId)
        .single();

      if (error) throw error;

      return {
        success: true,
        avatar: data
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  }

  /**
   * Test analytics table access
   */
  async testAnalyticsTablesAccess(avatarId: string): Promise<{
    gameSessions: { success: boolean; count: number; error?: string };
    gameEvents: { success: boolean; count: number; error?: string };
    learningProgress: { success: boolean; count: number; error?: string };
  }> {
    const results = {
      gameSessions: { success: false, count: 0, error: '' },
      gameEvents: { success: false, count: 0, error: '' },
      learningProgress: { success: false, count: 0, error: '' }
    };

    // Test game_sessions table
    try {
      const { data, error } = await this.supabase
        .from('game_sessions')
        .select('*')
        .eq('avatar_id', avatarId);

      if (error) throw error;
      results.gameSessions = { success: true, count: data?.length || 0, error: '' };
    } catch (err) {
      results.gameSessions = {
        success: false,
        count: 0,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    // Test game_events table
    try {
      const { data, error } = await this.supabase
        .from('game_events')
        .select('*')
        .eq('avatar_id', avatarId)
        .limit(10);

      if (error) throw error;
      results.gameEvents = { success: true, count: data?.length || 0, error: '' };
    } catch (err) {
      results.gameEvents = {
        success: false,
        count: 0,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    // Test learning_progress table
    try {
      const { data, error } = await this.supabase
        .from('learning_progress')
        .select('*')
        .eq('avatar_id', avatarId);

      if (error) throw error;
      results.learningProgress = { success: true, count: data?.length || 0, error: '' };
    } catch (err) {
      results.learningProgress = {
        success: false,
        count: 0,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    return results;
  }

  /**
   * Test analytics service methods
   */
  async testAnalyticsService(avatarId: string): Promise<{
    progress: { success: boolean; data?: LearningProgressData[]; error?: string };
    recommendations: { success: boolean; data?: LearningPathRecommendation[]; error?: string };
    metrics: { success: boolean; data?: PerformanceMetrics; error?: string };
  }> {
    const results: {
      progress: { success: boolean; data?: LearningProgressData[]; error?: string };
      recommendations: { success: boolean; data?: LearningPathRecommendation[]; error?: string };
      metrics: { success: boolean; data?: PerformanceMetrics; error?: string };
    } = {
      progress: { success: false, error: '' },
      recommendations: { success: false, error: '' },
      metrics: { success: false, error: '' }
    };

    // Test getAvatarProgress
    try {
      const data = await analyticsService.getAvatarProgress(avatarId);
      results.progress = { success: true, data, error: '' };
    } catch (err) {
      results.progress = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    // Test getLearningPathRecommendations
    try {
      const data = await analyticsService.getLearningPathRecommendations(avatarId, 3);
      results.recommendations = { success: true, data, error: '' };
    } catch (err) {
      results.recommendations = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    // Test getPerformanceMetrics
    try {
      const data = await analyticsService.getPerformanceMetrics(avatarId);
      results.metrics = { success: true, data, error: '' };
    } catch (err) {
      results.metrics = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    return results;
  }

  /**
   * Create test session data for the demo avatar (simple version)
   */
  async createTestSessionData(avatarId: string): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    try {
      logger.info('Creating simple test session for avatar:', avatarId);
      return await mockDataGenerator.generateQuickTestData(avatarId);
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate comprehensive mock data for testing
   */
  async generateComprehensiveMockData(): Promise<{ 
    success: boolean; 
    summary?: { 
      avatarsProcessed: number; 
      totalSessions: number; 
      abandonedSessions: number; 
    }; 
    error?: string 
  }> {
    try {
      return await mockDataGenerator.generateComprehensiveMockData();
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  }

  /**
   * Clear all analytics data (requires manual database cleanup)
   */
  async clearAllAnalyticsData(): Promise<{ success: boolean; error?: string }> {
    try {
      return await mockDataGenerator.clearAllAnalyticsData();
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  }

  /**
   * Run comprehensive analytics diagnostics
   */
  async runFullDiagnostic(avatarId: string): Promise<void> {
    logger.info('=== Analytics Diagnostic Report ===');
    logger.info('Avatar ID:', avatarId);

    // Test Supabase connection
    logger.info('\n1. Testing Supabase Connection...');
    const connectionTest = await this.testSupabaseConnection();
    logger.info('Connection:', connectionTest);

    // Test avatar access
    logger.info('\n2. Testing Avatar Access...');
    const avatarTest = await this.testAvatarAccess(avatarId);
    logger.info('Avatar Access:', avatarTest);

    // Test analytics tables
    logger.info('\n3. Testing Analytics Tables Access...');
    const tablesTest = await this.testAnalyticsTablesAccess(avatarId);
    logger.info('Tables Access:', tablesTest);

    // Test analytics service methods with detailed logging
    logger.info('\n4. Testing Analytics Service Methods...');
    const serviceTest = await this.testAnalyticsServiceWithDetails(avatarId);
    logger.info('Service Methods:', serviceTest);

    // If no data exists, create test data
    if (tablesTest.gameSessions.success && tablesTest.gameSessions.count === 0) {
      logger.info('\n5. No analytics data found. Creating test data...');
      const testDataResult = await this.createTestSessionData(avatarId);
      logger.info('Test Data Creation:', testDataResult);

      if (testDataResult.success) {
        logger.info('\n6. Re-testing Analytics Service after test data creation...');
        const retestService = await this.testAnalyticsServiceWithDetails(avatarId);
        logger.info('Service Methods (After Test Data):', retestService);
      }
    }

    logger.info('\n=== End Diagnostic Report ===');
  }

  /**
   * Enhanced test of analytics service methods with detailed diagnostics
   */
  private async testAnalyticsServiceWithDetails(avatarId: string): Promise<{
    progress: { success: boolean; data?: LearningProgressData[]; error?: string; details?: string };
    recommendations: { success: boolean; data?: LearningPathRecommendation[]; error?: string; details?: string };
    metrics: { success: boolean; data?: PerformanceMetrics; error?: string; details?: string };
  }> {
    const results: {
      progress: { success: boolean; data?: LearningProgressData[]; error: string; details: string };
      recommendations: { success: boolean; data?: LearningPathRecommendation[]; error: string; details: string };
      metrics: { success: boolean; data?: PerformanceMetrics; error: string; details: string };
    } = {
      progress: { success: false, error: '', details: '' },
      recommendations: { success: false, error: '', details: '' },
      metrics: { success: false, error: '', details: '' }
    };

    // Test getAvatarProgress with details
    try {
      const data = await analyticsService.getAvatarProgress(avatarId);
      results.progress = { 
        success: true, 
        data, 
        error: '',
        details: `Found ${data.length} progress records. Latest: ${data[0]?.gameId || 'none'}`
      };
    } catch (err) {
      results.progress = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        details: 'Failed to fetch progress data'
      };
    }

    // Test getLearningPathRecommendations with details
    try {
      const data = await analyticsService.getLearningPathRecommendations(avatarId, 3);
      results.recommendations = { 
        success: true, 
        data, 
        error: '',
        details: `Generated ${data.length} recommendations. Top: ${data[0]?.gameId || 'none'}`
      };
    } catch (err) {
      results.recommendations = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        details: 'Failed to generate recommendations'
      };
    }

    // Test getPerformanceMetrics with details
    try {
      const data = await analyticsService.getPerformanceMetrics(avatarId);
      results.metrics = { 
        success: true, 
        data, 
        error: '',
        details: `Games played: ${data.totalGamesPlayed}, Engagement: ${data.engagementScore}`
      };
    } catch (err) {
      results.metrics = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        details: 'Failed to calculate metrics'
      };
    }

    return results;
  }
}

// Export singleton instance
export const analyticsDebugger = new AnalyticsDebugger(); 