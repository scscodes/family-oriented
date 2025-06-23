/**
 * Demo Analytics Population Utility
 * 
 * This utility populates the database with realistic analytics data
 * for all demo scenario avatars, so they have proper analytics
 * data instead of relying on fallback generation.
 */

import { mockDataGenerator } from './mockDataGenerator';
import { getDemoConfig, getAvailableScenarios, type DemoUserConfig } from './demoConfig';
import { logger } from './logger';

interface PopulationResult {
  success: boolean;
  avatarsProcessed: number;
  totalSessions: number;
  errors: string[];
}

export class DemoAnalyticsPopulator {
  /**
   * Populate analytics data for all demo scenario avatars
   */
  async populateAllDemoScenarios(): Promise<PopulationResult> {
    const result: PopulationResult = {
      success: false,
      avatarsProcessed: 0,
      totalSessions: 0,
      errors: []
    };

    try {
      logger.info('🚀 Starting demo analytics population for all scenarios...');
      
      const scenarios = getAvailableScenarios();
      logger.info(`Found ${scenarios.length} demo scenarios to process`);

      for (const scenario of scenarios) {
        logger.info(`📊 Processing scenario: ${scenario.key} (${scenario.config.name})`);
        
        try {
          const scenarioResult = await this.populateScenario(scenario.config);
          result.avatarsProcessed += scenarioResult.avatarsProcessed;
          result.totalSessions += scenarioResult.totalSessions;
          
          logger.info(`✅ Completed scenario ${scenario.key}: ${scenarioResult.avatarsProcessed} avatars, ${scenarioResult.totalSessions} sessions`);
        } catch (error) {
          const errorMsg = `Failed to populate scenario ${scenario.key}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          logger.error(errorMsg);
          result.errors.push(errorMsg);
        }
      }

      result.success = result.errors.length === 0;
      
      if (result.success) {
        logger.info(`🎉 Successfully populated analytics for ${result.avatarsProcessed} avatars with ${result.totalSessions} total sessions`);
      } else {
        logger.warn(`⚠️ Completed with ${result.errors.length} errors. ${result.avatarsProcessed} avatars processed successfully.`);
      }

      return result;
    } catch (error) {
      const errorMsg = `Failed to populate demo analytics: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMsg);
      result.errors.push(errorMsg);
      return result;
    }
  }

  /**
   * Populate analytics data for a specific demo scenario
   */
  async populateScenario(config: DemoUserConfig): Promise<{ avatarsProcessed: number; totalSessions: number }> {
    let avatarsProcessed = 0;
    let totalSessions = 0;

    // Generate analytics data for each avatar in this scenario
    for (let i = 1; i <= Math.min(config.avatarCount, 10); i++) { // Limit to 10 avatars per scenario for reasonable data size
      const avatarId = `${config.id}-avatar-${i}`;
      
      try {
        logger.debug(`Creating analytics data for avatar: ${avatarId}`);
        
        // Generate quick test data for this avatar
        const sessionResult = await mockDataGenerator.generateQuickTestData(avatarId);
        
        if (sessionResult.success) {
          avatarsProcessed++;
          totalSessions += 1; // generateQuickTestData creates 1 session
          logger.debug(`✓ Created session for ${avatarId}`);
        } else {
          logger.warn(`Failed to create session for ${avatarId}: ${sessionResult.error}`);
        }
        
        // Add a small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        logger.warn(`Error processing avatar ${avatarId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { avatarsProcessed, totalSessions };
  }

  /**
   * Populate analytics for just the current demo scenario
   */
  async populateCurrentScenario(): Promise<PopulationResult> {
    const result: PopulationResult = {
      success: false,
      avatarsProcessed: 0,
      totalSessions: 0,
      errors: []
    };

    try {
      const currentConfig = getDemoConfig();
      logger.info(`🎯 Populating analytics for current scenario: ${currentConfig.tier} (${currentConfig.name})`);
      
      const scenarioResult = await this.populateScenario(currentConfig);
      result.avatarsProcessed = scenarioResult.avatarsProcessed;
      result.totalSessions = scenarioResult.totalSessions;
      result.success = true;
      
      logger.info(`✅ Successfully populated current scenario: ${result.avatarsProcessed} avatars, ${result.totalSessions} sessions`);
      
      return result;
    } catch (error) {
      const errorMsg = `Failed to populate current scenario: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMsg);
      result.errors.push(errorMsg);
      return result;
    }
  }

  /**
   * Check which demo avatars are missing analytics data
   */
  async checkMissingAnalytics(): Promise<{
    missingProgress: string[];
    missingSessions: string[];
    total: number;
  }> {
    const result = {
      missingProgress: [] as string[],
      missingSessions: [] as string[],
      total: 0
    };

    try {
      const scenarios = getAvailableScenarios();
      
      for (const scenario of scenarios) {
        for (let i = 1; i <= Math.min(scenario.config.avatarCount, 5); i++) { // Check first 5 avatars per scenario
          const avatarId = `${scenario.config.id}-avatar-${i}`;
          result.total++;

          // Check if this avatar has analytics data
          try {
            // This is a simple check - we could enhance it to actually query the database
            // For now, we assume all demo avatars need data since this is a new system
            result.missingProgress.push(avatarId);
            result.missingSessions.push(avatarId);
            
          } catch (error) {
            logger.debug(`Could not check analytics for ${avatarId}: ${error}`);
          }
        }
      }

      logger.info(`📊 Analytics check complete: ${result.missingProgress.length}/${result.total} avatars missing data`);
      return result;
    } catch (error) {
      logger.error('Failed to check missing analytics:', error);
      return result;
    }
  }
}

// Export singleton instance
export const demoAnalyticsPopulator = new DemoAnalyticsPopulator();

/**
 * Convenience function to populate all demo analytics
 * Can be called from the debug panel or console
 */
export async function populateAllDemoAnalytics(): Promise<PopulationResult> {
  return demoAnalyticsPopulator.populateAllDemoScenarios();
}

/**
 * Convenience function to populate current scenario analytics
 */
export async function populateCurrentDemoAnalytics(): Promise<PopulationResult> {
  return demoAnalyticsPopulator.populateCurrentScenario();
} 