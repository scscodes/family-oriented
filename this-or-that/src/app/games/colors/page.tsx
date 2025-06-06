"use client";

import GameBoard from "@/components/GameBoard";
import { generateColorQuestions } from "@/utils/gameUtils";
import { useGame } from "@/hooks/useGame";
import { colorStyles, colorCardStyles } from "./styles";

export default function ColorsGame() {
  const { questions, handleSettingsChange } = useGame("colors", (settings) =>
    generateColorQuestions(settings.questionCount, settings.optionsCount)
  );
  
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