"use client";

import GameBoard from "@/features/games/components/GameBoard";
import { useGame } from "@/hooks/useGame";

export default function FillInTheBlankGame() {
  const { questions } = useGame("fill-in-the-blank");
  
  return (
    <GameBoard 
      title="Fill in the Blank" 
      questions={questions}
      gameType="fill-in-the-blank"
    />
  );
} 