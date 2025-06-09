"use client";

import GameBoard from "@/components/GameBoard";
import { useGame } from "@/hooks/useGame";
import { fillInTheBlankCardStyles } from "./styles";

export default function FillInTheBlankGame() {
  const { questions } = useGame("fill-in-the-blank");
  
  return (
    <GameBoard 
      title="Fill in the Blank" 
      questions={questions}
      gameType="fill-in-the-blank"
      cardStyles={fillInTheBlankCardStyles}
    />
  );
} 