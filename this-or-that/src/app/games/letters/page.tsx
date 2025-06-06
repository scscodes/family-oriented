"use client";

import GameBoard from "@/components/GameBoard";
import { useGame } from "@/hooks/useGame";

export default function LettersGame() {
  const { questions, handleSettingsChange } = useGame("letters");
  
  return (
    <GameBoard 
      title="Letters Game" 
      questions={questions}
      gameType="letters"
      onSettingsChange={handleSettingsChange}
    />
  );
} 