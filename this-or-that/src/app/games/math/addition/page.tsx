'use client';

import { useState, useEffect } from 'react';
import GameBoard from '@/components/GameBoard';
import { useSettings } from '@/context/SettingsContext';
import { GameQuestion } from '@/utils/gameUtils';
import MathVisualAid from '@/components/MathVisualAid';
import { Box } from '@mui/material';

export default function AdditionGame() {
  const { settings } = useSettings();
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  
  // Generate addition questions based on settings
  useEffect(() => {
    const generateAdditionQuestions = () => {
      const generatedQuestions: GameQuestion[] = [];
      const { mathRange, questionsPerSession, showVisualAids } = settings;
      
      for (let i = 0; i < questionsPerSession; i++) {
        // Generate random numbers within the range
        const firstNumber = Math.floor(Math.random() * (mathRange.max - mathRange.min + 1)) + mathRange.min;
        const secondNumber = Math.floor(Math.random() * (mathRange.max - mathRange.min + 1)) + mathRange.min;
        const sum = firstNumber + secondNumber;
        
        // Generate options (including the correct answer)
        const correctAnswer = `${sum}`;
        const options = [correctAnswer];
        
        // Generate 3 more unique wrong options
        while (options.length < 4) {
          // Generate a random wrong answer within a reasonable range
          const wrongAnswer = Math.floor(Math.random() * (mathRange.max * 2)) + 1;
          
          // Ensure it's not the correct answer and not already in options
          if (wrongAnswer !== sum && !options.includes(`${wrongAnswer}`)) {
            options.push(`${wrongAnswer}`);
          }
        }
        
        // Shuffle options
        options.sort(() => Math.random() - 0.5);
        
        // Create question object
        generatedQuestions.push({
          id: `addition-${i}`,
          prompt: "Ask the child to solve the addition problem.",
          focus: `${firstNumber} + ${secondNumber} = ?`,
          options,
          correctAnswer,
          meta: {
            firstNumber,
            secondNumber,
            operation: 'addition',
            showVisualAid: showVisualAids
          }
        });
      }
      
      return generatedQuestions;
    };
    
    setQuestions(generateAdditionQuestions());
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