import { useState, useEffect } from "react";
import { GameType, GameQuestion, questionGenerators } from "@/utils/gameUtils";
import { useSettings } from "@/context/SettingsContext";
import { DEFAULT_SETTINGS } from "@/utils/settingsUtils";

/**
 * Shared hook to generate questions and handle settings for different games.
 * Uses the global settings context for consistent game configuration.
 */
export function useGame(gameType: GameType) {
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const { settings: globalSettings } = useSettings();
  
  useEffect(() => {
    const generator = questionGenerators[gameType];
    if (!generator) {
      setQuestions([]);
      return;
    }
    
    // Map global settings to game-specific settings
    const gameSettings = {
      questionCount: globalSettings.questionsPerSession || 10,
      optionsCount: 4, // Default to 4 options
      
      // For number games - ensure we have defaults if numberRange is missing
      numberRange: {
        min: globalSettings.numberRange?.min || DEFAULT_SETTINGS.numbers.numberRange.min,
        max: globalSettings.numberRange?.max || DEFAULT_SETTINGS.numbers.numberRange.max
      },
      
      // For math games
      mathRange: {
        min: (globalSettings.mathRange?.min !== undefined) ? globalSettings.mathRange.min : 1,
        max: (globalSettings.mathRange?.max !== undefined) ? globalSettings.mathRange.max : 10
      },
      mathOperations: globalSettings.mathOperations || { addition: true, subtraction: true },
      showVisualAids: globalSettings.showVisualAids !== undefined ? globalSettings.showVisualAids : true,
      
      // For word games
      wordComplexity: globalSettings.wordComplexity || 'easy',
    };
    
    try {
      // Generate questions based on current settings
      const generatedQuestions = generator(gameSettings);
      setQuestions(generatedQuestions);
    } catch (error) {
      console.error(`Error generating questions for ${gameType}:`, error);
      setQuestions([]);
    }
  }, [globalSettings, gameType]);

  const handleSettingsChange = (newSettings: Record<string, unknown>) => {
    // This function could be expanded to update specific settings
    console.log("Settings change requested:", newSettings);
    // Implementation would depend on how you want to handle game-specific settings
  };

  return {
    questions,
    handleSettingsChange
  };
}
