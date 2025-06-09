"use client";

import React, { useState, useEffect } from "react";
import GameContainer from "./GameContainer";
import ChoiceCard from "./ChoiceCard";
import { GameQuestion, GameType } from "@/utils/gameUtils";
import { Box, Typography, Button } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import QuestionDisplay from "./QuestionDisplay";
import ResponsiveAttemptDisplay from "./ResponsiveAttemptDisplay";
import ResponsiveOptionGrid from "./ResponsiveOptionGrid";

// Define a generic attempt structure
interface GenericAttempt {
  selectedOption: string;
  isCorrect: boolean;
  key: string | number; // Unique key for React list rendering
}

interface GameBoardProps {
  title: string;
  questions: GameQuestion[];
  gameType: GameType;
  optionStyles?: Record<string, SxProps<Theme>>;
  renderQuestion?: (question: GameQuestion) => React.ReactNode;
}

/**
 * Reusable game board component for displaying questions and options
 */
export default function GameBoard({ 
  title, 
  questions, 
  gameType, 
  optionStyles,
  renderQuestion
}: GameBoardProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [incorrectOptions, setIncorrectOptions] = useState<string[]>([]);
  const [attempts, setAttempts] = useState<GenericAttempt[]>([]); 
  
  // Reset attempts when question changes
  useEffect(() => {
    if (questions.length > 0) {
      setDisabledOptions([]);
      setIncorrectOptions([]);
      // Clear attempts for the new question
      setAttempts([]); 
    }
  }, [questions, currentQuestion]);
  
  const handleOptionClick = (option: string) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(option);
    const correct = option === questions[currentQuestion].correctAnswer;
    
    // Add generic attempt to history with a unique key
    setAttempts(prev => [...prev, {
      selectedOption: option,
      isCorrect: correct,
      key: `q${currentQuestion}-a${prev.length}` // Unique key based on question and attempt index
    }]);
    
    if (correct) {
      setScore(score + 1);
      
      if (currentQuestion < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedOption(null);
          // Disabled/incorrect options are reset by the useEffect hook
        }, 1500); // Reduced from 3000ms to 1500ms
      } else {
        setIsGameComplete(true);
      }
    } else {
      setIncorrectOptions([...incorrectOptions, option]);
      setDisabledOptions([...disabledOptions, option]);
      
      // Check if all incorrect options were tried for the current question
      const currentQuestionOptions = questions[currentQuestion].options;
      const correctAnswer = questions[currentQuestion].correctAnswer;
      const totalIncorrectOptions = currentQuestionOptions.filter(opt => opt !== correctAnswer).length;

      if (incorrectOptions.length + 1 >= totalIncorrectOptions) {
        const allIncorrect = currentQuestionOptions.filter(opt => opt !== correctAnswer);
        setDisabledOptions(allIncorrect);
        setSelectedOption(correctAnswer); // Highlight the correct answer
        
        // Move to next question after showing the correct answer
        setTimeout(() => {
          if (currentQuestion < questions.length - 1) {
             setCurrentQuestion(currentQuestion + 1);
             setSelectedOption(null);
             // Disabled/incorrect options are reset by the useEffect hook
          } else {
             setIsGameComplete(true); 
          }
        }, 1500); // Reduced from 3000ms to 1500ms
      } else {
        // Just reset the selected state after incorrect animation
        setTimeout(() => {
          setSelectedOption(null);
        }, 500); // Reduced from 1000ms to 500ms
      }
    }
  };
  
  const handleRestart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedOption(null);
    setDisabledOptions([]);
    setIncorrectOptions([]);
    setIsGameComplete(false);
    setAttempts([]); // Clear attempts on restart
  };

  // Define how to render the content for a generic attempt
  const renderGenericAttemptContent = (attempt: GenericAttempt) => (
    <Box sx={{ 
      flex: 1, // Allow content to take remaining space
      minWidth: 0, // Prevent overflow in flex container
      display: 'flex', 
      alignItems: 'center' 
    }}>
      <Typography 
        variant="body1" 
        sx={{ 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          opacity: 0.9 
        }}
        title={attempt.selectedOption} // Show full text on hover if truncated
      >
        Selected: {attempt.selectedOption}
      </Typography>
    </Box>
  );
  
  // Loading state
  if (questions.length === 0) {
    return (
      <GameContainer 
        title={title}
      >
        <Box textAlign="center" py={4}>
          <Typography variant="h6">Loading questions...</Typography>
        </Box>
      </GameContainer>
    );
  }
  
  // Completion state
  if (isGameComplete) {
    return (
      <GameContainer 
        title={title} 
        score={score} 
        totalQuestions={questions.length}
      >
        <Box textAlign="center" py={4}>
          <Typography variant="h4" gutterBottom>Game Complete!</Typography>
          <Typography variant="h6" gutterBottom>You scored {score} out of {questions.length}</Typography>
          <Button variant="contained" color="primary" onClick={handleRestart} size="large">Play Again</Button>
        </Box>
      </GameContainer>
    );
  }
  
  // Active game state
  const question = questions[currentQuestion];
  
  return (
    <GameContainer 
      title={title} 
      score={score} 
      totalQuestions={questions.length}
    >
      <Box py={4} sx={{ maxWidth: { xs: 340, sm: 600, md: 800 }, mx: 'auto' }}>
        {renderQuestion ? (
          renderQuestion(question)
        ) : (
          <QuestionDisplay question={question} />
        )}
        {/* Options Display */}
        <ResponsiveOptionGrid count={question.options.length}>
          {question.options.map((option) => (
            <ChoiceCard
              key={option}
              selected={selectedOption === option}
              disabled={disabledOptions.includes(option)}
              incorrect={incorrectOptions.includes(option)}
              onClick={() => handleOptionClick(option)}
              sx={optionStyles?.[option]}
              gameType={gameType}
            >
              {option}
            </ChoiceCard>
          ))}
        </ResponsiveOptionGrid>
        
        {/* Responsive Attempt Display */}
        <ResponsiveAttemptDisplay
          items={attempts}
          renderItemContent={renderGenericAttemptContent}
        />
      </Box>
    </GameContainer>
  );
} 