"use client";

import GameBoard from "@/components/GameBoard";
import { generatePatternQuestions } from "@/utils/gameUtils";
import { useGame } from "@/hooks/useGame";

export default function PatternsGame() {
  const { questions, handleSettingsChange } = useGame("patterns", (settings) =>
    generatePatternQuestions(settings.questionCount, settings.optionsCount)
  );
  
  return (
    <GameBoard 
      title="Patterns Game" 
      questions={questions}
      gameType="patterns"
      onSettingsChange={handleSettingsChange}
    />
  );
} 