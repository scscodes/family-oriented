"use client";

import GameBoard from "@/features/games/components/GameBoard";
import { useGame } from "@/hooks/useGame";

export default function LettersGame() {
  const { questions } = useGame("letters");
  
  return (
    <GameBoard 
      title="Letters Game" 
      questions={questions}
      gameType="letters"
    />
  );
} 