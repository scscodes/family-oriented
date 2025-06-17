/// <reference types="jest" />
/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import { gameWizard } from '../gameWizardService';
import { analyticsService } from '../analyticsService';
import { gameDiscovery } from '../gameData';

// Mock dependencies
jest.mock('../analyticsService');
jest.mock('../gameData');

describe('GameWizardService', () => {
  const mockAvatarId = '00000000-0000-0000-0000-000000000001';
  const mockGameId = '00000000-0000-0000-0000-000000000003';

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock analytics service
    (analyticsService.trackEvent as any).mockResolvedValue(undefined);

    // Mock game discovery
    (gameDiscovery.getRecommendedGames as any).mockReturnValue([
      {
        game: { id: mockGameId },
        score: 0.8,
        reason: 'Matches preferences'
      }
    ]);
  });

  describe('startSession', () => {
    it('should create a new wizard session', async () => {
      const session = await gameWizard.startSession(mockAvatarId);
      
      expect(session).toBeDefined();
      expect(session.id).toMatch(/^wizard_\d+_[a-z0-9]+$/); // Check format instead of exact value
      expect(session.avatarId).toBe(mockAvatarId);
      expect(session.createdAt).toBeInstanceOf(Date);
      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        session.id, // Use actual session ID
        mockAvatarId,
        'wizard_start',
        expect.any(Object)
      );
    });

    it('should handle analytics errors gracefully', async () => {
      // Mock analytics error
      (analyticsService.trackEvent as any).mockRejectedValueOnce(new Error('Analytics error'));

      // Should still create session even if analytics fails
      const session = await gameWizard.startSession(mockAvatarId);
      expect(session).toBeDefined();
      expect(session.avatarId).toBe(mockAvatarId);
    });
  });

  describe('getRecommendations', () => {
    const mockSelections = {
      age: [4, 5],
      interests: ['Mathematics'],
      time: 'short',
      goals: 'beginner'
    };

    it('should get recommendations based on selections', async () => {
      // First create a session
      const initialSession = await gameWizard.startSession(mockAvatarId);
      
      // Then get recommendations for that session
      const session = await gameWizard.getRecommendations(initialSession.id, mockSelections);
      
      expect(session).toBeDefined();
      expect(session.id).toBe(initialSession.id);
      expect(session.selectedGames).toContain(mockGameId);
      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        initialSession.id,
        initialSession.id.split('_')[1] || 'temp', // Uses timestamp from sessionId
        'wizard_complete',
        expect.objectContaining({
          filters: expect.any(Object),
          recommendations: expect.any(Array)
        })
      );
    });

    it('should handle invalid session ID gracefully', async () => {
      const invalidSessionId = 'invalid-session-id';
      
      // Should not throw but return a valid session with fallback data
      const session = await gameWizard.getRecommendations(invalidSessionId, mockSelections);
      expect(session).toBeDefined();
      expect(session.id).toBe(invalidSessionId);
      expect(session.avatarId).toBe('temp'); // Falls back to 'temp' for invalid format
    });
  });

  describe('trackCompletion', () => {
    it('should track game completion', async () => {
      // First create a session
      const session = await gameWizard.startSession(mockAvatarId);
      
      await gameWizard.trackCompletion(session.id, mockGameId, 85, 300);
      
      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        session.id,
        'temp', // trackCompletion method uses 'temp' as avatarId
        'wizard_game_complete',
        expect.objectContaining({
          gameId: mockGameId,
          score: 85,
          timeSpent: 300
        })
      );
    });

    it('should handle analytics errors gracefully', async () => {
      // Mock analytics error
      (analyticsService.trackEvent as any).mockRejectedValueOnce(new Error('Analytics error'));
      
      const session = await gameWizard.startSession(mockAvatarId);
      
      // Should not throw error even if analytics fails
      await expect(gameWizard.trackCompletion(session.id, mockGameId, 85, 300))
        .resolves.not.toThrow();
    });
  });

  describe('getSteps', () => {
    it('should return all wizard steps', () => {
      const steps = gameWizard.getSteps();
      
      expect(Array.isArray(steps)).toBe(true);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0]).toHaveProperty('id');
      expect(steps[0]).toHaveProperty('title');
      expect(steps[0]).toHaveProperty('description');
      expect(steps[0]).toHaveProperty('options');
    });
  });
}); 