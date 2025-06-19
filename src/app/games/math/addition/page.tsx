'use client';

import { useState, useEffect } from 'react';
import GameBoard from '@/features/games/components/GameBoard';
import { useSettings } from '@/context/SettingsContext';
import { GameQuestion, generateAdditionQuestions } from '@/utils/gameUtils';
import MathVisualAid from '@/features/games/components/MathVisualAid';
import { Box } from '@mui/material';

export default function AdditionGame() {
  const { settings } = useSettings();
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  
  // Generate addition questions using centralized generator
  useEffect(() => {
    const generatedQuestions = generateAdditionQuestions(
      settings.questionsPerSession,
      settings.mathRange,
      4, // optionsCount
      settings.showVisualAids
    );
    setQuestions(generatedQuestions);
  }, [settings]);

  // Custom renderer for addition questions with visual aids
  const renderAdditionQuestion = (question: GameQuestion) => {
    const meta = question.meta as { 
      firstNumber: number; 
      secondNumber: number; 
      operation: 'addition'; 
      showVisualAid: boolean;
    };
    
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ typography: 'h3', fontWeight: 'bold', mb: meta.showVisualAid ? 0.5 : 2 }}>
          {question.focus}
        </Box>
        
        {meta.showVisualAid && (
          <MathVisualAid 
            firstNumber={meta.firstNumber}
            secondNumber={meta.secondNumber}
            operation="addition"
          />
        )}
      </Box>
    );
  };
  
  return (
    <GameBoard
      title="Addition"
      questions={questions}
      gameType="math"
      renderQuestion={renderAdditionQuestion}
    />
  );
} 