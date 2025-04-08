"use client";

import { useEffect, useState } from "react";
import GameBoard from "@/components/GameBoard";
import { GameQuestion, generatePatternQuestions } from "@/utils/gameUtils";
import { GameSettings, getSettings } from "@/utils/settingsUtils";

export default function PatternsGame() {
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [settings, setSettings] = useState<GameSettings>(getSettings("patterns"));
  
  useEffect(() => {
    // Generate questions when component mounts or settings change
    setQuestions(generatePatternQuestions(
      settings.questionCount,
      settings.optionsCount
    ));
  }, [settings]);
  
  const handleSettingsChange = (newSettings: GameSettings) => {
    setSettings(newSettings);
  };
  
  return (
    <GameBoard 
      title="Patterns Game" 
      questions={questions}
      gameType="patterns"
      onSettingsChange={handleSettingsChange}
    />
  );
} 