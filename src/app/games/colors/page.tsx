"use client";

import GameBoard from "@/components/GameBoard";
import { useGame } from "@/hooks/useGame";

export default function ColorsGame() {
  const { questions } = useGame("colors");
  
  return (
    <GameBoard 
      title="Colors Game" 
      questions={questions}
      gameType="colors"
    />
  );
} 