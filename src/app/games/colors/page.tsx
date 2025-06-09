"use client";

import GameBoard from "@/components/GameBoard";
import { useGame } from "@/hooks/useGame";
import { colorStyles } from "./styles";

export default function ColorsGame() {
  const { questions } = useGame("colors");
  
  return (
    <GameBoard 
      title="Colors Game" 
      questions={questions}
      gameType="colors"
      optionStyles={colorStyles}
    />
  );
} 