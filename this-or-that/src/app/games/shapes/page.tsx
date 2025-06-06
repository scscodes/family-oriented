"use client";

import GameBoard from "@/components/GameBoard";
import { generateShapeQuestions } from "@/utils/gameUtils";
import { useGame } from "@/hooks/useGame";
import { shapeStyles, shapeCardStyles } from "./styles";

export default function ShapesGame() {
  const { questions, handleSettingsChange } = useGame("shapes", (settings) =>
    generateShapeQuestions(settings.questionCount, settings.optionsCount)
  );
  
  return (
    <GameBoard 
      title="Shapes Game" 
      questions={questions}
      gameType="shapes"
      onSettingsChange={handleSettingsChange}
      cardStyles={shapeCardStyles}
      optionStyles={shapeStyles}
    />
  );
} 