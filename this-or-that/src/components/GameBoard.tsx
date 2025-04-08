"use client";

import React, { useState, useEffect } from "react";
import GameContainer from "./GameContainer";
import ChoiceCard from "./ChoiceCard";
import SettingsPanel from "./SettingsPanel";
import { GameQuestion, GameType } from "@/utils/gameUtils";
import { GameSettings } from "@/utils/settingsUtils";
import { Box, Typography, Button } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

interface GameBoardProps {
  title: string;
  questions: GameQuestion[];
  gameType: GameType;
  onSettingsChange?: (settings: GameSettings) => void;
  cardStyles?: SxProps<Theme>;
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
  onSettingsChange,
  cardStyles,
  optionStyles,
  renderQuestion
}: GameBoardProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  
  // Initialize disabled options when question changes
  useEffect(() => {
    if (questions.length > 0) {
      setDisabledOptions([]);
    }
  }, [questions, currentQuestion]);
  
  const handleOptionClick = (option: string) => {
    // Ignore clicks if another option is already selected and being evaluated
    if (selectedOption !== null) return;
    
    setSelectedOption(option);
    const correct = option === questions[currentQuestion].correctAnswer;
    
    if (correct) {
      // For correct answer
      setScore(score + 1);
      
      // Move to next question
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      } else {
        setIsGameComplete(true);
      }
    } else {
      // For wrong answer
      // Add the incorrect option to disabled options
      setDisabledOptions([...disabledOptions, option]);
      
      // If all incorrect options are disabled, show the correct answer
      if (disabledOptions.length + 1 === questions[currentQuestion].options.length - 1) {
        setSelectedOption(questions[currentQuestion].correctAnswer);
        
        // Move to next question after showing the correct answer
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedOption(null);
        } else {
          setIsGameComplete(true);
        }
      } else {
        // Allow retry with disabled options
        setSelectedOption(null);
      }
    }
  };
  
  const handleRestart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedOption(null);
    setDisabledOptions([]);
    setIsGameComplete(false);
  };
  
  const handleSettingsChange = (newSettings: GameSettings) => {
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };
  
  // If no questions, show loading
  if (questions.length === 0) {
    return (
      <GameContainer 
        title={title}
        onSettingsClick={() => setShowSettings(true)}
      >
        <Box textAlign="center" py={4}>
          <Typography variant="h6">Loading questions...</Typography>
        </Box>
        
        <SettingsPanel 
          gameType={gameType}
          onSettingsChange={handleSettingsChange}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </GameContainer>
    );
  }
  
  // Show completion screen if game is complete
  if (isGameComplete) {
    return (
      <GameContainer 
        title={title} 
        score={score} 
        totalQuestions={questions.length}
        onSettingsClick={() => setShowSettings(true)}
      >
        <Box textAlign="center" py={4}>
          <Typography variant="h4" gutterBottom>
            Game Complete!
          </Typography>
          <Typography variant="h6" gutterBottom>
            You scored {score} out of {questions.length}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleRestart}
            size="large"
          >
            Play Again
          </Button>
        </Box>
        
        <SettingsPanel 
          gameType={gameType}
          onSettingsChange={handleSettingsChange}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </GameContainer>
    );
  }
  
  const question = questions[currentQuestion];
  
  return (
    <GameContainer 
      title={title} 
      score={score} 
      totalQuestions={questions.length}
      onSettingsClick={() => setShowSettings(true)}
    >
      <Box py={4}>
        {renderQuestion ? (
          renderQuestion(question)
        ) : (
          <Typography 
            variant="h4" 
            component="div" 
            align="center" 
            gutterBottom
            sx={{ mb: 4 }}
          >
            {question.question}
          </Typography>
        )}
        
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            maxWidth: 800,
            mx: 'auto',
            alignItems: 'center'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            justifyContent: 'center',
            width: '100%',
            maxWidth: 600,
            '& > *': {
              flex: '1 1 200px',
              maxWidth: 'calc(50% - 8px)',
              display: 'flex',
              justifyContent: 'center'
            }
          }}>
            {question.options.slice(0, 2).map((option) => (
              <Box key={option}>
                <ChoiceCard
                  onClick={() => handleOptionClick(option)}
                  isSelected={selectedOption === option}
                  isCorrect={selectedOption === option && option === question.correctAnswer}
                  isDisabled={disabledOptions.includes(option)}
                  gameType={gameType}
                  sx={{
                    ...(cardStyles || {}),
                    ...(optionStyles?.[option.toLowerCase()] || {})
                  } as SxProps<Theme>}
                >
                  {option}
                </ChoiceCard>
              </Box>
            ))}
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            justifyContent: 'center',
            width: '100%',
            maxWidth: 600,
            '& > *': {
              flex: '1 1 200px',
              maxWidth: 'calc(50% - 8px)',
              display: 'flex',
              justifyContent: 'center'
            }
          }}>
            {question.options.slice(2, 4).map((option) => (
              <Box key={option}>
                <ChoiceCard
                  onClick={() => handleOptionClick(option)}
                  isSelected={selectedOption === option}
                  isCorrect={selectedOption === option && option === question.correctAnswer}
                  isDisabled={disabledOptions.includes(option)}
                  gameType={gameType}
                  sx={{
                    ...(cardStyles || {}),
                    ...(optionStyles?.[option.toLowerCase()] || {})
                  } as SxProps<Theme>}
                >
                  {option}
                </ChoiceCard>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      
      <SettingsPanel 
        gameType={gameType}
        onSettingsChange={handleSettingsChange}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </GameContainer>
  );
} 