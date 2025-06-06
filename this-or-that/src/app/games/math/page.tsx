"use client";

import GameBoard from "@/components/GameBoard";
import { generateMathQuestions } from "@/utils/gameUtils";
import { useGame } from "@/hooks/useGame";
import { mathCardStyles } from "./styles";

export default function MathGame() {
  const { questions, handleSettingsChange } = useGame("math", (settings) =>
    generateMathQuestions(settings.questionCount, settings.optionsCount)
  );
  
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