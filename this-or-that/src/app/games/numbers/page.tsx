"use client";

import GameBoard from "@/components/GameBoard";
import { generateNumberQuestions } from "@/utils/gameUtils";
import { useGame } from "@/hooks/useGame";

export default function NumbersGame() {
  const { questions, handleSettingsChange } = useGame("numbers", (settings) =>
    generateNumberQuestions(
      settings.questionCount,
      settings.numberRange.min,
      settings.numberRange.max,
      settings.optionsCount
    )
  );
  
  return (
    <GameBoard 
      title="Numbers Game" 
      questions={questions}
      gameType="numbers"
      onSettingsChange={handleSettingsChange}
    />
  );
} 