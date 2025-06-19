"use client";

import GameBoard from "@/features/games/components/GameBoard";
import { useGame } from "@/hooks/useGame";

export default function AlphabetSequenceGame() {
  const { questions } = useGame("alphabet-sequence");
  
  return (
    <GameBoard 
      title="Alphabet Sequence Game" 
      questions={questions}
      gameType="alphabet-sequence"
    />
  );
} 