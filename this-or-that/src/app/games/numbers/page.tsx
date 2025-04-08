"use client";

import { useEffect, useState } from "react";
import GameBoard from "@/components/GameBoard";
import { GameQuestion, generateNumberQuestions } from "@/utils/gameUtils";
import { GameSettings, getSettings } from "@/utils/settingsUtils";

export default function NumbersGame() {
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [settings, setSettings] = useState<GameSettings>(getSettings("numbers"));
  
  useEffect(() => {
    // Generate questions when component mounts or settings change
    setQuestions(generateNumberQuestions(
      settings.questionCount, 
      settings.numberRange.min, 
      settings.numberRange.max,
      settings.optionsCount
    ));
  }, [settings]);
  
  const handleSettingsChange = (newSettings: GameSettings) => {
    setSettings(newSettings);
  };
  
  return (
    <GameBoard 
      title="Numbers Game" 
      questions={questions}
      gameType="numbers"
      onSettingsChange={handleSettingsChange}
    />
  );
} 