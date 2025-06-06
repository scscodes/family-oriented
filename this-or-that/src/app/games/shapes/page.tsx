"use client";

import GameBoard from "@/components/GameBoard";
import { useGame } from "@/hooks/useGame";
import { shapeStyles, shapeCardStyles } from "./styles";

export default function ShapesGame() {
  const { questions } = useGame("shapes");
  
  return (
    <GameBoard 
      title="Shapes Game" 
      questions={questions}
      gameType="shapes"
      cardStyles={shapeCardStyles}
      optionStyles={shapeStyles}
    />
  );
} 