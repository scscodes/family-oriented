"use client";

import React, { useState, useEffect } from "react";
import GameContainer from "./GameContainer";
import ChoiceCard from "./ChoiceCard";
import SettingsPanel from "./SettingsPanel";
// import Toast from "./Toast";
import { GameQuestion, GameType } from "@/utils/gameUtils";
import { GameSettings } from "@/utils/settingsUtils";
import { Box, Typography, Button } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import QuestionDisplay from "./QuestionDisplay";
import AttemptHistoryFooter from "@/components/AttemptHistoryFooter";

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
  const [incorrectOptions, setIncorrectOptions] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  // Use the generic attempt structure for state
  const [attempts, setAttempts] = useState<GenericAttempt[]>([]); 
  // const [toast, setToast] = useState<{
  //   show: boolean;
  //   message: string;
  //   severity: 'success' | 'error' | 'info' | 'warning';
  // }>({ show: false, message: '', severity: 'success' });
  
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
      // setToast({
      //   show: true,
      //   message: 'Correct! Well done!',
      //   severity: 'success'
      // });
      
      if (currentQuestion < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedOption(null);
          // Disabled/incorrect options are reset by the useEffect hook
        }, 3000); 
      } else {
        setIsGameComplete(true);
      }
    } else {
      // setToast({
      //   show: true,
      //   message: 'Try again!',
      //   severity: 'error'
      // });
      
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
        // setToast({
        //   show: true,
        //   message: `The correct answer is ${correctAnswer}`,
        //   severity: 'info'
        // });
        
        // Move to next question after showing the correct answer
        setTimeout(() => {
          if (currentQuestion < questions.length - 1) {
             setCurrentQuestion(currentQuestion + 1);
             setSelectedOption(null);
             // Disabled/incorrect options are reset by the useEffect hook
          } else {
             setIsGameComplete(true); 
          }
        }, 3000); // Increased delay slightly to show correct answer longer
      } else {
        // Just reset the selected state after incorrect animation
        setTimeout(() => {
          setSelectedOption(null);
        }, 1000);
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
  
  const handleSettingsChange = (newSettings: GameSettings) => {
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
    // Optionally, reset game state if settings change significantly
    // handleRestart(); 
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
  
  // Completion state
  if (isGameComplete) {
    return (
      <GameContainer 
        title={title} 
        score={score} 
        totalQuestions={questions.length}
        onSettingsClick={() => setShowSettings(true)}
      >
        <Box textAlign="center" py={4}>
          <Typography variant="h4" gutterBottom>Game Complete!</Typography>
          <Typography variant="h6" gutterBottom>You scored {score} out of {questions.length}</Typography>
          <Button variant="contained" color="primary" onClick={handleRestart} size="large">Play Again</Button>
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
  
  // Active game state
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
          <QuestionDisplay question={question} />
        )}
        
        {/* Options Display */}
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mt: 3, // Added margin top for spacing
            maxWidth: 800,
            mx: 'auto',
            alignItems: 'center'
          }}
        >
          {/* Row 1 of options */}
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            justifyContent: 'center',
            width: '100%',
            maxWidth: 600,
            '& > *': { flex: '1 1 200px', maxWidth: 'calc(50% - 8px)', display: 'flex', justifyContent: 'center' }
          }}>
            {question.options.slice(0, 2).map((option) => (
              <Box key={option}>
                <ChoiceCard
                  onClick={() => handleOptionClick(option)}
                  isSelected={selectedOption === option || incorrectOptions.includes(option)}
                  isCorrect={selectedOption === option && option === question.correctAnswer}
                  isDisabled={disabledOptions.includes(option)}
                  gameType={gameType}
                  sx={{ ...(cardStyles || {}), ...(optionStyles?.[option.toLowerCase()] || {}) } as SxProps<Theme>}
                >
                  {option}
                </ChoiceCard>
              </Box>
            ))}
          </Box>
          
          {/* Row 2 of options */}
          {question.options.length > 2 && (
            <Box sx={{ 
              display: 'flex', 
              gap: 1, 
              justifyContent: 'center',
              width: '100%',
              maxWidth: 600,
              '& > *': { flex: '1 1 200px', maxWidth: 'calc(50% - 8px)', display: 'flex', justifyContent: 'center' }
            }}>
              {question.options.slice(2, 4).map((option) => (
                <Box key={option}>
                  <ChoiceCard
                    onClick={() => handleOptionClick(option)}
                    isSelected={selectedOption === option || incorrectOptions.includes(option)}
                    isCorrect={selectedOption === option && option === question.correctAnswer}
                    isDisabled={disabledOptions.includes(option)}
                    gameType={gameType}
                    sx={{ ...(cardStyles || {}), ...(optionStyles?.[option.toLowerCase()] || {}) } as SxProps<Theme>}
                  >
                    {option}
                  </ChoiceCard>
                </Box>
              ))}
            </Box>
          )}
        </Box>
        
        {/* Render Attempt History Unconditionally */}
        <AttemptHistoryFooter
          items={attempts}
          renderItemContent={renderGenericAttemptContent}
          sx={{ mt: 15 }} 
        />
        
        {/* Toast Notifications */}
        {/* <Toast
          show={toast.show}
          message={toast.message}
          severity={toast.severity}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        /> */}
      </Box>
      
      {/* Settings Panel (Modal) */}
      <SettingsPanel 
        gameType={gameType}
        onSettingsChange={handleSettingsChange}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </GameContainer>
  );
} 