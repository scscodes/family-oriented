/**
 * React hook for integrating analytics tracking with game sessions
 * Automatically tracks game start, progress, and completion
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { GameType } from '@/utils/gameUtils';
import { analyticsService, GameSessionData, LearningPathRecommendation, PerformanceMetrics } from '@/utils/analyticsService';
import { useSettings } from '@/stores/hooks';
import { logger } from '@/utils/logger';

interface UseGameAnalyticsOptions {
  gameType: GameType;
  avatarId: string;
  orgId?: string;
  autoTrack?: boolean; // Whether to automatically track events
}

interface GameAnalyticsState {
  sessionId: string | null;
  isTracking: boolean;
  sessionData: GameSessionData | null;
  recommendations: LearningPathRecommendation[];
  performanceMetrics: PerformanceMetrics | null;
}

/**
 * Hook for tracking game analytics and learning progression
 */
export function useGameAnalytics(options: UseGameAnalyticsOptions) {
  const { gameType, avatarId, orgId, autoTrack = true } = options;
  const { settings } = useSettings();
  const [state, setState] = useState<GameAnalyticsState>({
    sessionId: null,
    isTracking: false,
    sessionData: null,
    recommendations: [],
    performanceMetrics: null
  });

  const sessionStartTime = useRef<Date | null>(null);
  const questionsAttempted = useRef(0);
  const questionsCorrect = useRef(0);

  /**
   * Start a new game session
   */
  const startSession = useCallback(async () => {
    if (state.isTracking) {
      logger.warn('Session already in progress');
      return state.sessionId;
    }

    try {
      const sessionId = await analyticsService.startGameSession(avatarId, gameType, settings as unknown as Record<string, unknown>, orgId);
      sessionStartTime.current = new Date();
      questionsAttempted.current = 0;
      questionsCorrect.current = 0;

      setState(prev => ({
        ...prev,
        sessionId,
        isTracking: true,
        sessionData: null // Will be populated when session completes
      }));

      return sessionId;
    } catch (error) {
      logger.error('Failed to start analytics session:', error);
      return null;
    }
  }, [avatarId, gameType, settings, orgId, state.isTracking, state.sessionId]);

  /**
   * Track a question attempt
   */
  const trackQuestionAttempt = useCallback(async (isCorrect: boolean, questionData?: Record<string, unknown>) => {
    if (!state.sessionId || !state.isTracking) {
      logger.warn('No active session for question tracking');
      return;
    }

    questionsAttempted.current++;
    if (isCorrect) {
      questionsCorrect.current++;
    }

    try {
      await analyticsService.trackEvent(
        state.sessionId,
        avatarId,
        'question_answer',
        {
          correct: isCorrect,
          questionNumber: questionsAttempted.current,
          ...questionData
        }
      );
    } catch (error) {
      logger.error('Failed to track question attempt:', error);
    }
  }, [state.sessionId, state.isTracking, avatarId]);

  /**
   * Track other game events
   */
  const trackEvent = useCallback(async (eventType: 'game_start' | 'game_complete' | 'question_start' | 'hint_used' | 'game_pause' | 'game_resume' | 'difficulty_change' | 'game_abandon', eventData?: Record<string, unknown>) => {
    if (!state.sessionId || !state.isTracking) {
      logger.warn('No active session for event tracking');
      return;
    }

    try {
      await analyticsService.trackEvent(state.sessionId, avatarId, eventType, eventData || {});
    } catch (error) {
      logger.error(`Failed to track ${eventType} event:`, error);
    }
  }, [state.sessionId, state.isTracking, avatarId]);

  /**
   * Complete the current session
   */
  const completeSession = useCallback(async (finalScore?: number) => {
    if (!state.sessionId || !state.isTracking) {
      logger.warn('No active session to complete');
      return;
    }

    const calculatedScore = finalScore ?? (questionsAttempted.current > 0 
      ? (questionsCorrect.current / questionsAttempted.current) * 100 
      : 0);

    try {
      await analyticsService.completeGameSession(
        state.sessionId,
        calculatedScore,
        questionsAttempted.current,
        questionsCorrect.current
      );

      setState(prev => ({
        ...prev,
        isTracking: false,
        sessionData: null
      }));

      // Refresh recommendations and performance metrics after session completion
      setTimeout(async () => {
        try {
          const [recommendations, metrics] = await Promise.all([
            analyticsService.getLearningPathRecommendations(avatarId, 5),
            analyticsService.getPerformanceMetrics(avatarId)
          ]);
          setState(prev => ({
            ...prev,
            recommendations,
            performanceMetrics: metrics
          }));
        } catch (error) {
          logger.error('Failed to load post-session data:', error);
        }
      }, 0);
    } catch (error) {
      logger.error('Failed to complete session:', error);
    }
  }, [state.sessionId, state.isTracking, avatarId]);

  /**
   * Abandon the current session (user quit without completing)
   */
  const abandonSession = useCallback(async () => {
    if (!state.sessionId || !state.isTracking) {
      return;
    }

    try {
      await analyticsService.trackEvent(state.sessionId, avatarId, 'game_abandon', {
        questionsAttempted: questionsAttempted.current,
        questionsCorrect: questionsCorrect.current,
        timeSpent: sessionStartTime.current 
          ? Math.floor((Date.now() - sessionStartTime.current.getTime()) / 1000)
          : 0
      });
    } catch (error) {
      logger.error('Failed to track session abandonment:', error);
    }

    setState(prev => ({
      ...prev,
      isTracking: false,
      sessionData: null,
      sessionId: null
    }));
  }, [state.sessionId, state.isTracking, avatarId, sessionStartTime]);

  /**
   * Load learning path recommendations
   */
  const loadRecommendations = useCallback(async () => {
    try {
      const recommendations = await analyticsService.getLearningPathRecommendations(avatarId, 5);
      setState(prev => ({
        ...prev,
        recommendations
      }));
    } catch (error) {
      logger.error('Failed to load recommendations:', error);
    }
  }, [avatarId]);

  /**
   * Load performance metrics
   */
  const loadPerformanceMetrics = useCallback(async () => {
    try {
      const metrics = await analyticsService.getPerformanceMetrics(avatarId);
      setState(prev => ({
        ...prev,
        performanceMetrics: metrics
      }));
    } catch (error) {
      logger.error('Failed to load performance metrics:', error);
    }
  }, [avatarId]);

  /**
   * Get current session statistics
   */
  const getSessionStats = () => {
    return {
      questionsAttempted: questionsAttempted.current,
      questionsCorrect: questionsCorrect.current,
      accuracy: questionsAttempted.current > 0 
        ? (questionsCorrect.current / questionsAttempted.current) * 100 
        : 0,
      timeElapsed: sessionStartTime.current 
        ? Math.floor((Date.now() - sessionStartTime.current.getTime()) / 1000)
        : 0
    };
  };

  // Auto-start session when component mounts if autoTrack is enabled
  useEffect(() => {
    if (autoTrack && !state.isTracking) {
      startSession();
    }

    // Load initial data
    loadRecommendations();
    loadPerformanceMetrics();

    // Cleanup function to abandon session if component unmounts while tracking
    return () => {
      if (state.isTracking) {
        abandonSession();
      }
    };
  }, [gameType, avatarId, autoTrack, state.isTracking, startSession, loadRecommendations, loadPerformanceMetrics, abandonSession]);

  // Auto-complete session when questions are finished (if autoTrack enabled)
  useEffect(() => {
    if (autoTrack && state.isTracking && questionsAttempted.current >= (settings.questionsPerSession || 10)) {
      completeSession();
    }
  }, [autoTrack, state.isTracking, settings.questionsPerSession, completeSession]);

  return {
    // Session management
    startSession,
    completeSession,
    abandonSession,
    
    // Event tracking
    trackQuestionAttempt,
    trackEvent,
    
    // Data access
    getSessionStats,
    loadRecommendations,
    loadPerformanceMetrics,
    
    // State
    sessionId: state.sessionId,
    isTracking: state.isTracking,
    recommendations: state.recommendations,
    performanceMetrics: state.performanceMetrics,
    
    // Current session stats
    ...getSessionStats()
  };
}

/**
 * Hook for accessing aggregate analytics (for admin/teacher dashboards)
 */
export function useAggregateAnalytics(orgId?: string) {
  const [analytics, setAnalytics] = useState<ReturnType<typeof analyticsService.getAggregateAnalytics> | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const data = analyticsService.getAggregateAnalytics(orgId);
      setAnalytics(data);
    } catch (error) {
      logger.error('Failed to load aggregate analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    loadAnalytics();
  }, [orgId, loadAnalytics]);

  return {
    analytics,
    loading,
    refresh: loadAnalytics
  };
} 