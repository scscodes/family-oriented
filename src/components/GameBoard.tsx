"use client";

import React, { useState, useEffect } from "react";
import GameContainer from "./GameContainer";
import ChoiceCard from "./ChoiceCard";
import { GameQuestion, GameType } from "@/utils/gameUtils";
import { Box, Typography, Button } from '@mui/material';
import QuestionDisplay from "./QuestionDisplay";
import ResponsiveAttemptDisplay from "./ResponsiveAttemptDisplay";
import ResponsiveOptionGrid from "./ResponsiveOptionGrid";
import { GAME_TIMINGS } from "@/utils/constants";
import { useGameAnalytics } from '@/hooks/useGameAnalytics';
import { useAvatar } from '@/context/UserContext';
import { logger } from '@/utils/logger';

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
  renderQuestion?: (question: GameQuestion) => React.ReactNode;
}

/**
 * Reusable game board component for displaying questions and options
 * Integrates analytics tracking for session, question, and completion events.
 * @param {GameBoardProps} props
 */
export default function GameBoard({ 
  title, 
  questions, 
  gameType, 
  renderQuestion
}: GameBoardProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [incorrectOptions, setIncorrectOptions] = useState<string[]>([]);
  const [attempts, setAttempts] = useState<GenericAttempt[]>([]); 
  
  // Avatar context for analytics
  const { currentAvatar } = useAvatar();
  const avatarId = currentAvatar?.id || '00000000-0000-0000-0000-000000000002';

  // Analytics hook
  const analytics = useGameAnalytics({
    gameType,
    avatarId,
    autoTrack: true
  });
  
  // Reset attempts when question changes
  useEffect(() => {
    if (questions.length > 0) {
      setDisabledOptions([]);
      setIncorrectOptions([]);
      // Clear attempts for the new question
      setAttempts([]); 
    }
  }, [questions, currentQuestion]);
  
  // Track question attempt
  const handleOptionClick = async (option: string) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(option);
    const correct = option === questions[currentQuestion].correctAnswer;
    
    // Add generic attempt to history with a unique key
    setAttempts(prev => [...prev, {
      selectedOption: option,
      isCorrect: correct,
      key: `q${currentQuestion}-a${prev.length}` // Unique key based on question and attempt index
    }]);
    
    await analytics.trackQuestionAttempt(correct, {
      questionIndex: currentQuestion,
      selectedOption: option,
      correctAnswer: questions[currentQuestion].correctAnswer
    });
    
    if (correct) {
      setScore(score + 1);
      
      if (currentQuestion < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedOption(null);
          // Disabled/incorrect options are reset by the useEffect hook
        }, GAME_TIMINGS.CORRECT_ANSWER_DELAY);
      } else {
        setIsGameComplete(true);
        await analytics.completeSession();
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
        setTimeout(async () => {
          if (currentQuestion < questions.length - 1) {
             setCurrentQuestion(currentQuestion + 1);
             setSelectedOption(null);
             // Disabled/incorrect options are reset by the useEffect hook
          } else {
             setIsGameComplete(true); 
             await analytics.completeSession();
          }
        }, GAME_TIMINGS.CORRECT_ANSWER_DELAY);
      } else {
        // Just reset the selected state after incorrect animation
        setTimeout(() => {
          setSelectedOption(null);
        }, GAME_TIMINGS.INCORRECT_ANSWER_DELAY);
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
    // Start a new analytics session when restarting the game
    analytics.startSession().catch(err => logger.error('Failed to restart session:', err));
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
          {/* Analytics: Show recommendations and performance metrics */}
          {analytics.recommendations && analytics.recommendations.length > 0 && (
            <Box mt={4}>
              <Typography variant="h6">Recommended Next Games:</Typography>
              <ul>
                {analytics.recommendations.map(rec => (
                  <li key={rec.gameId}>{rec.reason} ({rec.gameId})</li>
                ))}
              </ul>
            </Box>
          )}
          {analytics.performanceMetrics && (
            <Box mt={2}>
              <Typography variant="subtitle1">Performance Metrics:</Typography>
              <pre style={{ textAlign: 'left', background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                {JSON.stringify(analytics.performanceMetrics, null, 2)}
              </pre>
            </Box>
          )}
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