"use client";

import { useEffect, useState } from "react";
import GameBoard from "@/components/GameBoard";
import { GameQuestion, generateFillInTheBlankQuestions } from "@/utils/gameUtils";
import { GameSettings, getSettings } from "@/utils/settingsUtils";
import { fillInTheBlankCardStyles } from "./styles";

export default function FillInTheBlankGame() {
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [settings, setSettings] = useState<GameSettings>(getSettings("fill-in-the-blank"));
  
  useEffect(() => {
    // Generate questions when component mounts or settings change
    setQuestions(generateFillInTheBlankQuestions(
      settings.questionCount,
      settings.optionsCount
    ));
  }, [settings]);
  
  const handleSettingsChange = (newSettings: GameSettings) => {
    setSettings(newSettings);
  };
  
  return (
    <GameBoard 
      title="Fill in the Blank" 
      questions={questions}
      gameType="fill-in-the-blank"
      onSettingsChange={handleSettingsChange}
      cardStyles={fillInTheBlankCardStyles}
    />
  );
} 