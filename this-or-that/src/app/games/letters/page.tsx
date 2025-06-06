"use client";

import GameBoard from "@/components/GameBoard";
import { generateLetterQuestions } from "@/utils/gameUtils";
import { useGame } from "@/hooks/useGame";

export default function LettersGame() {
  const { questions, handleSettingsChange } = useGame("letters", (settings) =>
    generateLetterQuestions(settings.questionCount, settings.optionsCount)
  );
  
  return (
    <GameBoard 
      title="Letters Game" 
      questions={questions}
      gameType="letters"
      onSettingsChange={handleSettingsChange}
    />
  );
} 