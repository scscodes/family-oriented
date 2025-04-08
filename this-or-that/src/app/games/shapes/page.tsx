"use client";

import { useEffect, useState } from "react";
import GameBoard from "@/components/GameBoard";
import { GameQuestion, generateShapeQuestions } from "@/utils/gameUtils";
import { GameSettings, getSettings } from "@/utils/settingsUtils";
import { shapeStyles, shapeCardStyles } from "./styles";

export default function ShapesGame() {
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [settings, setSettings] = useState<GameSettings>(getSettings("shapes"));
  
  useEffect(() => {
    // Generate questions when component mounts or settings change
    setQuestions(generateShapeQuestions(
      settings.questionCount,
      settings.optionsCount
    ));
  }, [settings]);
  
  const handleSettingsChange = (newSettings: GameSettings) => {
    setSettings(newSettings);
  };
  
  return (
    <GameBoard 
      title="Shapes Game" 
      questions={questions}
      gameType="shapes"
      onSettingsChange={handleSettingsChange}
      cardStyles={shapeCardStyles}
      optionStyles={shapeStyles}
    />
  );
} 