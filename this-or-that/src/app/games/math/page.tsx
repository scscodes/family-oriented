"use client";

import GameBoard from "@/components/GameBoard";
import { useGame } from "@/hooks/useGame";

export default function MathGame() {
  const { questions } = useGame("math");
  
  return (
    <GameBoard 
      title="Math Game" 
      questions={questions}
      gameType="math"
    />
  );
} 