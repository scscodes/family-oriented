import { useState, useEffect } from "react";
import { GameType, GameQuestion } from "@/utils/gameUtils";
import { GameSettings, getSettings } from "@/utils/settingsUtils";

export type QuestionGenerator = (settings: GameSettings) => GameQuestion[];

/**
 * Shared hook to generate questions and handle settings for different games.
 * Provides a consistent state management pattern across game pages.
 */
export function useGame(gameType: GameType, generate: QuestionGenerator) {
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [settings, setSettings] = useState<GameSettings>(getSettings(gameType));

  useEffect(() => {
    setQuestions(generate(settings));
  }, [settings, generate]);

  const handleSettingsChange = (newSettings: GameSettings) => {
    setSettings(newSettings);
  };

  return {
    questions,
    settings,
    handleSettingsChange,
  };
}
