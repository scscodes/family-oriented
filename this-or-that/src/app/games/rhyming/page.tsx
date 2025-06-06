"use client";

import GameBoard from "@/components/GameBoard";
import { useGame } from "@/hooks/useGame";

export default function RhymingGame() {
  const { questions, handleSettingsChange } = useGame("rhyming");
  
  return (
    <GameBoard 
      title="Rhyming Words" 
      questions={questions}
      gameType="rhyming"
      onSettingsChange={handleSettingsChange}
    />
  );
} 