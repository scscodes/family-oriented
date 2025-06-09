"use client";

import GameBoard from "@/components/GameBoard";
import { useGame } from "@/hooks/useGame";

export default function PatternsGame() {
  const { questions } = useGame("patterns");
  
  return (
    <GameBoard 
      title="Patterns Game" 
      questions={questions}
      gameType="patterns"
    />
  );
} 