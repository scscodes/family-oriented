"use client";

import GameBoard from "@/components/GameBoard";
import { useGame } from "@/hooks/useGame";
import { mathCardStyles } from "./styles";

export default function MathGame() {
  const { questions, handleSettingsChange } = useGame("math");
  
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