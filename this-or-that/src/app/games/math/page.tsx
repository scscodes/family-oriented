"use client";

import { useEffect, useState } from "react";
import GameBoard from "@/components/GameBoard";
import { GameQuestion, generateMathQuestions } from "@/utils/gameUtils";
import { GameSettings, getSettings } from "@/utils/settingsUtils";
import { mathCardStyles } from "./styles";

export default function MathGame() {
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [settings, setSettings] = useState<GameSettings>(getSettings("math"));
  
  useEffect(() => {
    // Generate questions when component mounts or settings change
    setQuestions(generateMathQuestions(
      settings.questionCount,
      settings.optionsCount
    ));
  }, [settings]);
  
  const handleSettingsChange = (newSettings: GameSettings) => {
    setSettings(newSettings);
  };
  
  return (
    <GameBoard 
      title="Math Game" 
      questions={questions}
      gameType="math"
      onSettingsChange={handleSettingsChange}
      cardStyles={mathCardStyles}
    />
  );
} 