"use client";

import GameBoard from "@/features/games/components/GameBoard";
import { useGame } from "@/hooks/useGame";

export default function NumberSequenceGame() {
  const { questions } = useGame("number-sequence");
  
  return (
    <GameBoard 
      title="Number Sequence Game" 
      questions={questions}
      gameType="number-sequence"
    />
  );
} 