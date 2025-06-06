import { useState, useEffect } from "react";
import { GameType, GameQuestion, questionGenerators } from "@/utils/gameUtils";
import { GameSettings, getSettings } from "@/utils/settingsUtils";

/**
 * Shared hook to generate questions and handle settings for different games.
 * Provides a consistent state management pattern across game pages.
 */
export function useGame(gameType: GameType) {
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [settings, setSettings] = useState<GameSettings>(getSettings(gameType));

  useEffect(() => {
    const generate = questionGenerators[gameType];
    setQuestions(generate ? generate(settings) : []);
  }, [settings, gameType]);

  const handleSettingsChange = (newSettings: GameSettings) => {
    setSettings(newSettings);
  };

  return {
    questions,
    settings,
    handleSettingsChange,
  };
}
