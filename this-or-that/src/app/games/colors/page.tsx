"use client";

import { useEffect, useState } from "react";
import GameBoard from "@/components/GameBoard";
import { GameQuestion, generateColorQuestions } from "@/utils/gameUtils";
import { GameSettings, getSettings } from "@/utils/settingsUtils";
import { colorStyles, colorCardStyles } from "./styles";

export default function ColorsGame() {
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [settings, setSettings] = useState<GameSettings>(getSettings("colors"));
  
  useEffect(() => {
    // Generate questions when component mounts or settings change
    setQuestions(generateColorQuestions(
      settings.questionCount,
      settings.optionsCount
    ));
  }, [settings]);
  
  const handleSettingsChange = (newSettings: GameSettings) => {
    setSettings(newSettings);
  };
  
  return (
    <GameBoard 
      title="Colors Game" 
      questions={questions}
      gameType="colors"
      onSettingsChange={handleSettingsChange}
      cardStyles={colorCardStyles}
      optionStyles={colorStyles}
    />
  );
} 