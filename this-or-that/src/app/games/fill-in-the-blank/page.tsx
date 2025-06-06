"use client";

import GameBoard from "@/components/GameBoard";
import { generateFillInTheBlankQuestions } from "@/utils/gameUtils";
import { useGame } from "@/hooks/useGame";
import { fillInTheBlankCardStyles } from "./styles";

export default function FillInTheBlankGame() {
  const { questions, handleSettingsChange } = useGame(
    "fill-in-the-blank",
    (settings) =>
      generateFillInTheBlankQuestions(settings.questionCount, settings.optionsCount)
  );
  
  return (
    <GameBoard 
      title="Fill in the Blank" 
      questions={questions}
      gameType="fill-in-the-blank"
      onSettingsChange={handleSettingsChange}
      cardStyles={fillInTheBlankCardStyles}
    />
  );
} 