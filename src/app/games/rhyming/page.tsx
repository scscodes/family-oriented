"use client";

import GameBoard from "@/features/games/components/GameBoard";
import { useGame } from "@/hooks/useGame";

export default function RhymingGame() {
  const { questions } = useGame("rhyming");
  
  return (
    <GameBoard 
      title="Rhyming Words" 
      questions={questions}
      gameType="rhyming"
    />
  );
} 