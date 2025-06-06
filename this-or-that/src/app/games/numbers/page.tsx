"use client";

import GameBoard from "@/components/GameBoard";
import { useGame } from "@/hooks/useGame";

export default function NumbersGame() {
  const { questions, handleSettingsChange } = useGame("numbers");
  
  return (
    <GameBoard 
      title="Numbers Game" 
      questions={questions}
      gameType="numbers"
      onSettingsChange={handleSettingsChange}
    />
  );
} 