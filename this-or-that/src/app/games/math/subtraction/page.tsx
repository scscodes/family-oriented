'use client';

import { useState, useEffect } from 'react';
import GameBoard from '@/components/GameBoard';
import { useSettings } from '@/context/SettingsContext';
import { GameQuestion } from '@/utils/gameUtils';
import MathVisualAid from '@/components/MathVisualAid';
import { Box } from '@mui/material';

export default function SubtractionGame() {
  const { settings } = useSettings();
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  
  // Generate subtraction questions based on settings
  useEffect(() => {
    const generateSubtractionQuestions = () => {
      const generatedQuestions: GameQuestion[] = [];
      const { mathRange, questionsPerSession, showVisualAids } = settings;
      
      for (let i = 0; i < questionsPerSession; i++) {
        // Generate random numbers ensuring firstNumber >= secondNumber
        // to avoid negative results (which are more difficult for young children)
        const firstNumber = Math.floor(Math.random() * (mathRange.max - mathRange.min + 1)) + mathRange.min;
        const secondNumber = Math.floor(Math.random() * Math.min(firstNumber, mathRange.max)) + mathRange.min;
        const difference = firstNumber - secondNumber;
        
        // Generate options (including the correct answer)
        const correctAnswer = `${difference}`;
        const options = [correctAnswer];
        
        // Generate 3 more unique wrong options
        while (options.length < 4) {
          // Generate a random wrong answer within a reasonable range
          const wrongAnswer = Math.floor(Math.random() * (mathRange.max * 2)) + 0;
          
          // Ensure it's not the correct answer and not already in options
          if (wrongAnswer !== difference && !options.includes(`${wrongAnswer}`)) {
            options.push(`${wrongAnswer}`);
          }
        }
        
        // Shuffle options
        options.sort(() => Math.random() - 0.5);
        
        // Create question object
        generatedQuestions.push({
          id: `subtraction-${i}`,
          prompt: "Ask the child to solve the subtraction problem.",
          focus: `${firstNumber} - ${secondNumber} = ?`,
          options,
          correctAnswer,
          meta: {
            firstNumber,
            secondNumber,
            operation: 'subtraction',
            showVisualAid: showVisualAids
          }
        });
      }
      
      return generatedQuestions;
    };
    
    setQuestions(generateSubtractionQuestions());
  }, [settings]);
  
  // Custom renderer for subtraction questions with visual aids
  const renderSubtractionQuestion = (question: GameQuestion) => {
    const meta = question.meta as { 
      firstNumber: number; 
      secondNumber: number; 
      operation: 'subtraction'; 
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
            operation="subtraction"
          />
        )}
      </Box>
    );
  };
  
  return (
    <GameBoard
      title="Subtraction"
      questions={questions}
      gameType="math"
      renderQuestion={renderSubtractionQuestion}
    />
  );
} 