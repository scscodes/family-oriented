"use client";

import { useEffect, useState } from "react";
import GameBoard from "@/components/GameBoard";
import { GameQuestion, generateLetterQuestions } from "@/utils/gameUtils";
import { GameSettings, getSettings } from "@/utils/settingsUtils";

export default function LettersGame() {
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [settings, setSettings] = useState<GameSettings>(getSettings("letters"));
  
  useEffect(() => {
    // Generate questions when component mounts or settings change
    setQuestions(generateLetterQuestions(
      settings.questionCount,
      settings.optionsCount
    ));
  }, [settings]);
  
  const handleSettingsChange = (newSettings: GameSettings) => {
    setSettings(newSettings);
  };
  
  return (
    <GameBoard 
      title="Letters Game" 
      questions={questions}
      gameType="letters"
      onSettingsChange={handleSettingsChange}
    />
  );
} 