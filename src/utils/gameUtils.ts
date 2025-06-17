/**
 * Game types supported by the application
 */
export type GameType =
  | 'numbers'
  | 'letters'
  | 'shapes'
  | 'colors'
  | 'patterns'
  | 'math'
  | 'geography'
  | 'fill-in-the-blank'
  | 'rhyming'
  | 'alphabet-sequence'
  | 'number-sequence';

import type { GameSettings } from './settingsUtils';
import { generateUniqueOptions } from './arrayUtils';
import { GAME_TIMINGS, GAME_DEFAULTS } from './constants';
import { logger } from './logger';

/**
 * Basic structure for all game questions
 */
export interface GameQuestion {
  prompt: string;  // Muted text for adult/supervisor
  focus: string;   // Main focus of the question
  visual?: string; // Optional visual element (emoji, image, etc.)
  options: string[];
  correctAnswer: string;
  type: GameType;
  id?: string; // Optional unique identifier for the question
  meta?: Record<string, unknown>; // Optional metadata for custom rendering or logic
}

/**
 * Converts a number to its word representation (for 1-50)
 */
function numberToWord(num: number): string {
  const ones = [
    'zero', 'one', 'two', 'three', 'four', 'five',
    'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
    'sixteen', 'seventeen', 'eighteen', 'nineteen'
  ];
  
  const tens = [
    '', '', 'twenty', 'thirty', 'forty', 'fifty'
  ];
  
  if (num >= 0 && num < 20) {
    return ones[num];
  } else if (num >= 20 && num <= 50) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return one === 0 ? tens[ten] : `${tens[ten]}-${ones[one]}`;
  } else {
    return num.toString();
  }
}

/**
 * Generates number-based questions with options
 */
export function generateNumberQuestions(count: number = 5, minNumber: number = 1, maxNumber: number = 50, optionsCount: number = 3): GameQuestion[] {
  const questions: GameQuestion[] = [];
  const usedNumbers = new Set<string>();
  
  // Number questions
  for (let i = 0; i < count; i++) {
    let num: number;
    let attempts = 0;
    
    // Try to find a unique number
    do {
      num = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
      attempts++;
    } while (usedNumbers.has(num.toString()) && attempts < GAME_TIMINGS.MAX_UNIQUE_ATTEMPTS);
    
    // If we couldn't find a unique number, use any number
    if (attempts >= GAME_TIMINGS.MAX_UNIQUE_ATTEMPTS) {
      num = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    }
    
    usedNumbers.add(num.toString());
    const options = generateUniqueOptions(
      num.toString(), 
      optionsCount - 1, 
      () => (Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber).toString()
    );
    
    questions.push({
      prompt: `Which number is...`,
      focus: `${numberToWord(num)}`,
      options,
      correctAnswer: num.toString(),
      type: 'numbers'
    });
  }
  
  return questions;
}

/**
 * Mapping of game types to their question generators. Centralizing the logic
 * allows hooks and components to easily obtain the appropriate generator
 * without needing to know the specific function names.
 */
export const questionGenerators: Record<
  GameType,
  (settings: GameSettings) => GameQuestion[]
> = {
  numbers: (s) => {
    // Ensure numberRange exists and has required properties
    if (!s.numberRange || typeof s.numberRange.min !== 'number' || typeof s.numberRange.max !== 'number') {
      logger.error('Invalid numberRange in settings:', s);
      return [];
    }
    
    return generateNumberQuestions(
      s.questionCount || GAME_DEFAULTS.QUESTIONS_PER_SESSION,
      s.numberRange.min,
      s.numberRange.max,
      s.optionsCount || GAME_DEFAULTS.OPTIONS_COUNT
    );
  },
  letters: (s) =>
    generateLetterQuestions(s.questionCount || GAME_DEFAULTS.QUESTIONS_PER_SESSION, s.optionsCount || GAME_DEFAULTS.OPTIONS_COUNT),
  shapes: (s) =>
    generateShapeQuestions(s.questionCount || GAME_DEFAULTS.QUESTIONS_PER_SESSION, s.optionsCount || GAME_DEFAULTS.OPTIONS_COUNT),
  colors: (s) =>
    generateColorQuestions(s.questionCount || GAME_DEFAULTS.QUESTIONS_PER_SESSION, s.optionsCount || GAME_DEFAULTS.OPTIONS_COUNT),
  patterns: (s) =>
    generatePatternQuestions(s.questionCount || GAME_DEFAULTS.QUESTIONS_PER_SESSION, s.optionsCount || GAME_DEFAULTS.OPTIONS_COUNT),
  math: (s) => generateMathQuestions(s.questionCount || GAME_DEFAULTS.QUESTIONS_PER_SESSION, s.optionsCount || GAME_DEFAULTS.OPTIONS_COUNT),
  'fill-in-the-blank': (s) =>
    generateFillInTheBlankQuestions(s.questionCount || GAME_DEFAULTS.QUESTIONS_PER_SESSION, s.optionsCount || GAME_DEFAULTS.OPTIONS_COUNT),
  geography: () => [], // Placeholder until geography generators are added
  rhyming: (s) => generateRhymingQuestions(s.questionCount || GAME_DEFAULTS.QUESTIONS_PER_SESSION),
  'alphabet-sequence': (s) => generateAlphabetSequenceQuestions(s.questionCount || GAME_DEFAULTS.QUESTIONS_PER_SESSION, s.optionsCount || GAME_DEFAULTS.OPTIONS_COUNT),
  'number-sequence': (s) => generateNumberSequenceQuestions(s.questionCount || GAME_DEFAULTS.QUESTIONS_PER_SESSION, s.optionsCount || GAME_DEFAULTS.OPTIONS_COUNT),
};

/**
 * Generates letter-based questions with options
 */
export function generateLetterQuestions(count: number = 5, optionsCount: number = 3): GameQuestion[] {
  const questions: GameQuestion[] = [];
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const usedLetters = new Set<string>();
  
  // Mix of uppercase and lowercase letter questions
  for (let i = 0; i < count; i++) {
    let letter: string;
    let attempts = 0;
    
    // Try to find a unique letter
    do {
      const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
      const isUppercase = Math.random() > 0.5;
      letter = isUppercase ? randomLetter : randomLetter.toLowerCase();
      attempts++;
    } while (usedLetters.has(letter) && attempts < GAME_TIMINGS.MAX_UNIQUE_ATTEMPTS);
    
    // If we couldn't find a unique letter, use any letter
    if (attempts >= GAME_TIMINGS.MAX_UNIQUE_ATTEMPTS) {
      const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
      const isUppercase = Math.random() > 0.5;
      letter = isUppercase ? randomLetter : randomLetter.toLowerCase();
    }
    
    usedLetters.add(letter);
    const isUppercase = letter === letter.toUpperCase();
    const askForCase = isUppercase ? 'uppercase' : 'lowercase';
    
    // Generate options that maintain the same case as the question
    const options = generateUniqueOptions(
      letter, 
      optionsCount - 1, 
      () => {
        const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
        return isUppercase ? randomLetter : randomLetter.toLowerCase();
      }
    );
    
    questions.push({
      prompt: `Which is the ${askForCase} letter ${isUppercase ? letter : letter.toUpperCase()}?`,
      focus: ``,
      options,
      correctAnswer: letter,
      type: 'letters'
    });
  }
  
  return questions;
}

/**
 * Generates shape-based questions with options
 */
export function generateShapeQuestions(count: number = 5, optionsCount: number = 3): GameQuestion[] {
  const shapes = [
    'Circle', 
    'Square', 
    'Triangle', 
    'Rectangle', 
    'Star', 
    'Heart', 
    'Diamond',
    'Umbrella',
    'Wrench',
    'Cake',
    'Call',
    'Smile',
    'Sun',
    'Moon',
    'Cloud',
    'Plus',
    'Minus',
    'Up',
    'Down',
    'Left',
    'Right'
  ];
  const questions: GameQuestion[] = [];
  const usedShapes = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    let shape: string;
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loop
    
    // Try to find a unique shape
    do {
      shape = shapes[Math.floor(Math.random() * shapes.length)];
      attempts++;
    } while (usedShapes.has(shape) && attempts < maxAttempts);
    
    // If we couldn't find a unique shape, use any shape
    if (attempts >= maxAttempts) {
      shape = shapes[Math.floor(Math.random() * shapes.length)];
    }
    
    usedShapes.add(shape);
    const options = generateUniqueOptions(
      shape, 
      optionsCount - 1, 
      () => shapes[Math.floor(Math.random() * shapes.length)]
    );
    
    questions.push({
      prompt: `Which one is a...`,
      focus: shape,
      options,
      correctAnswer: shape,
      type: 'shapes'
    });
  }
  
  return questions;
}

/**
 * Generates color-based questions with options
 */
export function generateColorQuestions(count: number = 5, optionsCount: number = 3): GameQuestion[] {
  const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown', 'Black'];
  const questions: GameQuestion[] = [];
  const usedColors = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    let color: string;
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loop
    
    // Try to find a unique color
    do {
      color = colors[Math.floor(Math.random() * colors.length)];
      attempts++;
    } while (usedColors.has(color) && attempts < maxAttempts);
    
    // If we couldn't find a unique color, use any color
    if (attempts >= maxAttempts) {
      color = colors[Math.floor(Math.random() * colors.length)];
    }
    
    usedColors.add(color);
    const options = generateUniqueOptions(
      color, 
      optionsCount - 1, 
      () => colors[Math.floor(Math.random() * colors.length)]
    );
    
    questions.push({
      prompt: `Which one is...`,
      focus: color,
      options,
      correctAnswer: color,
      type: 'colors'
    });
  }
  
  return questions;
}

/**
 * Algorithmic pattern generators for different types of patterns
 */
const PATTERN_GENERATORS = {
  arithmetic: (start: number, step: number, length: number) => {
    const sequence = [];
    for (let i = 0; i < length; i++) {
      sequence.push((start + i * step).toString());
    }
    return sequence;
  },
  
  alphabetic: (startChar: string, step: number, length: number) => {
    const sequence = [];
    const isUppercase = startChar === startChar.toUpperCase();
    const startCode = startChar.toUpperCase().charCodeAt(0);
    
    for (let i = 0; i < length; i++) {
      const charCode = startCode + i * step;
      if (charCode <= 90) { // Z
        const char = String.fromCharCode(charCode);
        sequence.push(isUppercase ? char : char.toLowerCase());
      }
    }
    return sequence;
  },
  
  geometric: (start: number, ratio: number, length: number) => {
    const sequence = [];
    for (let i = 0; i < length; i++) {
      sequence.push((start * Math.pow(ratio, i)).toString());
    }
    return sequence;
  }
};

/**
 * Generates pattern-based questions with algorithmic generation
 */
export function generatePatternQuestions(count: number = 5, optionsCount: number = 3): GameQuestion[] {
  const questions: GameQuestion[] = [];
  
  for (let i = 0; i < count; i++) {
    const patternType = Math.random();
    let sequence: string[];
    let answer: string;
    
    if (patternType < 0.4) {
      // Arithmetic sequences (40% chance)
      const start = Math.floor(Math.random() * 10) + 1;
      const step = Math.floor(Math.random() * 5) + 1;
      sequence = PATTERN_GENERATORS.arithmetic(start, step, 4);
      answer = PATTERN_GENERATORS.arithmetic(start, step, 5)[4];
    } else if (patternType < 0.7) {
      // Alphabetic sequences (30% chance)
      const startChar = String.fromCharCode(65 + Math.floor(Math.random() * 20)); // A-T
      const isUppercase = Math.random() > 0.5;
      const step = Math.floor(Math.random() * 3) + 1;

      const fullSequence = PATTERN_GENERATORS.alphabetic(
        isUppercase ? startChar : startChar.toLowerCase(),
        step,
        5
      );
      sequence = fullSequence.slice(0, 4);

      // Fallback if the generated sequence is shorter than expected
      if (fullSequence.length >= 5) {
        answer = fullSequence[4];
      } else {
        const lastChar = fullSequence[fullSequence.length - 1];
        if (lastChar) {
          const nextCode = lastChar.charCodeAt(0) + step;
          const nextChar = String.fromCharCode(Math.min(nextCode, 90));
          answer = isUppercase ? nextChar : nextChar.toLowerCase();
        } else {
          // Extremely unlikely, but ensure a fallback
          answer = isUppercase ? startChar : startChar.toLowerCase();
        }
      }
    } else {
      // Simple geometric or custom patterns (30% chance)
      const start = Math.floor(Math.random() * 5) + 1;
      const ratio = 2; // Keep it simple for kids
      sequence = PATTERN_GENERATORS.geometric(start, ratio, 4);
      answer = PATTERN_GENERATORS.geometric(start, ratio, 5)[4];
    }
    
    // Generate wrong options
    const wrongOptions: string[] = [];
    const answerNum = parseInt(answer);
    
    if (!isNaN(answerNum)) {
      // Numeric answer - generate nearby numbers
      for (let j = 0; j < optionsCount - 1; j++) {
        const offset = (j + 1) * (Math.random() > 0.5 ? 1 : -1);
        wrongOptions.push((answerNum + offset).toString());
      }
    } else {
      // Non-numeric answer - generate random letters/characters
      for (let j = 0; j < optionsCount - 1; j++) {
        const randomChar = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        const isAnswerUppercase = answer === answer.toUpperCase();
        wrongOptions.push(isAnswerUppercase ? randomChar : randomChar.toLowerCase());
      }
    }
    
    const options = generateUniqueOptions(answer, optionsCount - 1, () => {
      return wrongOptions[Math.floor(Math.random() * wrongOptions.length)] || answer;
    });
    
    questions.push({
      prompt: `What comes next?`,
      focus: `${sequence.join(', ')}, ?`,
      options,
      correctAnswer: answer,
      type: 'patterns'
    });
  }
  
  return questions;
}

/**
 * Generates math questions (addition and subtraction)
 */
export function generateMathQuestions(count: number = 5, optionsCount: number = 4): GameQuestion[] {
  const questions: GameQuestion[] = [];
  
  for (let i = 0; i < count; i++) {
    const isAddition = Math.random() > 0.5;
    const minNum = 1;
    const maxNum = 10;
    
    let firstNumber: number;
    let secondNumber: number;
    let answer: number;
    let operation: string;
    
    if (isAddition) {
      firstNumber = Math.floor(Math.random() * maxNum) + minNum;
      secondNumber = Math.floor(Math.random() * maxNum) + minNum;
      answer = firstNumber + secondNumber;
      operation = '+';
    } else {
      // For subtraction, ensure firstNumber >= secondNumber to avoid negative results
      firstNumber = Math.floor(Math.random() * maxNum) + minNum;
      secondNumber = Math.floor(Math.random() * Math.min(firstNumber, maxNum)) + minNum;
      answer = firstNumber - secondNumber;
      operation = '-';
    }
    
    const correctAnswer = answer.toString();
    const options = generateUniqueOptions(
      correctAnswer,
      optionsCount - 1,
      () => {
        // Generate reasonable wrong answers
        const wrongAnswer = Math.floor(Math.random() * (maxNum * 2)) + 0;
        return wrongAnswer.toString();
      }
    );
    
    questions.push({
      prompt: `Solve the ${isAddition ? 'addition' : 'subtraction'} problem.`,
      focus: `${firstNumber} ${operation} ${secondNumber} = ?`,
      options,
      correctAnswer,
      type: 'math',
      meta: {
        firstNumber,
        secondNumber,
        operation: isAddition ? 'addition' : 'subtraction',
        showVisualAid: true
      }
    });
  }
  
  return questions;
}

/**
 * Generates addition-specific questions
 */
export function generateAdditionQuestions(count: number = 5, mathRange: { min: number; max: number } = { min: 1, max: 10 }, optionsCount: number = 4, showVisualAids: boolean = true): GameQuestion[] {
  const questions: GameQuestion[] = [];
  
  for (let i = 0; i < count; i++) {
    const firstNumber = Math.floor(Math.random() * (mathRange.max - mathRange.min + 1)) + mathRange.min;
    const secondNumber = Math.floor(Math.random() * (mathRange.max - mathRange.min + 1)) + mathRange.min;
    const sum = firstNumber + secondNumber;
    
    const correctAnswer = sum.toString();
    const options = generateUniqueOptions(
      correctAnswer,
      optionsCount - 1,
      () => {
        const wrongAnswer = Math.floor(Math.random() * (mathRange.max * 2)) + mathRange.min;
        return wrongAnswer.toString();
      }
    );
    
    questions.push({
      id: `addition-${i}`,
      prompt: "Ask the child to solve the addition problem.",
      focus: `${firstNumber} + ${secondNumber} = ?`,
      options,
      correctAnswer,
      type: 'math',
      meta: {
        firstNumber,
        secondNumber,
        operation: 'addition',
        showVisualAid: showVisualAids
      }
    });
  }
  
  return questions;
}

/**
 * Generates subtraction-specific questions
 */
export function generateSubtractionQuestions(count: number = 5, mathRange: { min: number; max: number } = { min: 1, max: 10 }, optionsCount: number = 4, showVisualAids: boolean = true): GameQuestion[] {
  const questions: GameQuestion[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate random numbers ensuring firstNumber >= secondNumber to avoid negative results
    const firstNumber = Math.floor(Math.random() * (mathRange.max - mathRange.min + 1)) + mathRange.min;
    const secondNumber = Math.floor(Math.random() * Math.min(firstNumber, mathRange.max)) + mathRange.min;
    const difference = firstNumber - secondNumber;
    
    const correctAnswer = difference.toString();
    const options = generateUniqueOptions(
      correctAnswer,
      optionsCount - 1,
      () => {
        const wrongAnswer = Math.floor(Math.random() * (mathRange.max * 2)) + 0;
        return wrongAnswer.toString();
      }
    );
    
    questions.push({
      id: `subtraction-${i}`,
      prompt: "Ask the child to solve the subtraction problem.",
      focus: `${firstNumber} - ${secondNumber} = ?`,
      options,
      correctAnswer,
      type: 'math',
      meta: {
        firstNumber,
        secondNumber,
        operation: 'subtraction',
        showVisualAid: showVisualAids
      }
    });
  }
  
  return questions;
}

/**
 * Generates a mixed set of questions from all types
 */
export function generateMixedQuestions(count: number = 10, minNumber: number = 1, maxNumber: number = 50, optionsCount: number = 3): GameQuestion[] {
  const questionTypesCount = 6; // number, letter, shape, color, pattern, math
  const questionsPerType = Math.max(1, Math.ceil(count / questionTypesCount));
  
  const allQuestions = [
    ...generateNumberQuestions(questionsPerType, minNumber, maxNumber, optionsCount),
    ...generateLetterQuestions(questionsPerType, optionsCount),
    ...generateShapeQuestions(questionsPerType, optionsCount),
    ...generateColorQuestions(questionsPerType, optionsCount),
    ...generatePatternQuestions(questionsPerType, optionsCount),
    ...generateMathQuestions(questionsPerType, optionsCount)
  ];
  
  return allQuestions
    .sort(() => 0.5 - Math.random())
    .slice(0, count);
}

/**
 * Word list for fill-in-the-blank game with associated emojis
 */
export const fillInTheBlankWords = [
  // Animals
  { word: 'DOG', emoji: '🐕', missingIndex: 1 },
  { word: 'CAT', emoji: '🐈', missingIndex: 1 },
  { word: 'FISH', emoji: '🐟', missingIndex: 1 },
  { word: 'BIRD', emoji: '🐦', missingIndex: 1 },
  { word: 'PIG', emoji: '🐷', missingIndex: 1 },
  { word: 'COW', emoji: '🐮', missingIndex: 1 },
  { word: 'BEE', emoji: '🐝', missingIndex: 1 },
  { word: 'ANT', emoji: '🐜', missingIndex: 1 },
  
  // Vehicles
  { word: 'CAR', emoji: '🚗', missingIndex: 1 },
  { word: 'BUS', emoji: '🚌', missingIndex: 1 },
  { word: 'PLANE', emoji: '✈️', missingIndex: 2 },
  { word: 'BOAT', emoji: '⛵', missingIndex: 1 },
  { word: 'TRAIN', emoji: '🚂', missingIndex: 2 },
  
  // Colors
  { word: 'RED', emoji: '🔴', missingIndex: 1 },
  { word: 'BLUE', emoji: '🔵', missingIndex: 2 },
  { word: 'GREEN', emoji: '🟢', missingIndex: 2 },
  { word: 'PINK', emoji: '💗', missingIndex: 1 },
  { word: 'BLACK', emoji: '⚫', missingIndex: 2 },
  
  // Numbers (1-10)
  { word: 'ONE', emoji: '1️⃣', missingIndex: 1 },
  { word: 'TWO', emoji: '2️⃣', missingIndex: 1 },
  { word: 'THREE', emoji: '3️⃣', missingIndex: 2 },
  { word: 'FOUR', emoji: '4️⃣', missingIndex: 2 },
  { word: 'FIVE', emoji: '5️⃣', missingIndex: 1 },
  { word: 'SIX', emoji: '6️⃣', missingIndex: 1 },
  { word: 'SEVEN', emoji: '7️⃣', missingIndex: 2 },
  { word: 'EIGHT', emoji: '8️⃣', missingIndex: 1 },
  { word: 'NINE', emoji: '9️⃣', missingIndex: 1 },
  { word: 'TEN', emoji: '🔟', missingIndex: 1 },
  
  // Food
  { word: 'CAKE', emoji: '🍰', missingIndex: 1 },
  { word: 'PIE', emoji: '🥧', missingIndex: 1 },
  { word: 'BREAD', emoji: '🍞', missingIndex: 2 },
  { word: 'MILK', emoji: '🥛', missingIndex: 1 },
  { word: 'EGG', emoji: '🥚', missingIndex: 1 },
  
  // Nature
  { word: 'TREE', emoji: '🌳', missingIndex: 2 },
  { word: 'MOON', emoji: '🌙', missingIndex: 2 },
  { word: 'SUN', emoji: '☀️', missingIndex: 1 },
  { word: 'STAR', emoji: '⭐', missingIndex: 2 },
  { word: 'RAIN', emoji: '🌧️', missingIndex: 1 },
  { word: 'SNOW', emoji: '❄️', missingIndex: 2 },
  
  // Objects
  { word: 'BOOK', emoji: '📚', missingIndex: 2 },
  { word: 'HOUSE', emoji: '🏠', missingIndex: 2 },
  { word: 'BALL', emoji: '⚽', missingIndex: 1 },
  { word: 'DOLL', emoji: '🧸', missingIndex: 1 },
  { word: 'CUP', emoji: '🥤', missingIndex: 1 },
  { word: 'HAT', emoji: '🧢', missingIndex: 1 },
  { word: 'SHOE', emoji: '👟', missingIndex: 2 },
  { word: 'BED', emoji: '🛏️', missingIndex: 1 },
  
  // Weather
  { word: 'WIND', emoji: '💨', missingIndex: 1 },
  { word: 'CLOUD', emoji: '☁️', missingIndex: 2 },
  { word: 'STORM', emoji: '⛈️', missingIndex: 2 },
  
  // Time
  { word: 'CLOCK', emoji: '⏰', missingIndex: 2 },
  { word: 'WATCH', emoji: '⌚', missingIndex: 1 },
  { word: 'DAY', emoji: '🌞', missingIndex: 1 },
  { word: 'NIGHT', emoji: '🌙', missingIndex: 1 }
];

/**
 * Generates fill-in-the-blank questions with options
 */
export function generateFillInTheBlankQuestions(count: number = 5, optionsCount: number = 3): GameQuestion[] {
  const questions: GameQuestion[] = [];
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const usedLetters = new Set<string>();
  
  // Select random words from the list
  const selectedWords = [...fillInTheBlankWords]
    .sort(() => 0.5 - Math.random())
    .slice(0, count)
    .map(word => ({ ...word }));
  
  for (const baseWord of selectedWords) {
    let word = { ...baseWord };
    let correctLetter = word.word[word.missingIndex];
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loop
    
    // Try to find a unique letter
    while (usedLetters.has(correctLetter) && attempts < maxAttempts) {
      // Try to find a different word with a unique missing letter
      const newWord = fillInTheBlankWords[Math.floor(Math.random() * fillInTheBlankWords.length)];
      const newLetter = newWord.word[newWord.missingIndex];
      if (!usedLetters.has(newLetter)) {
        word = { ...newWord };
        correctLetter = newLetter;
        break;
      }
      attempts++;
    }
    
    usedLetters.add(correctLetter);
    
    // Create the word with underscore for missing letter
    const wordWithBlank = word.word
      .split('')
      .map((letter, index) => index === word.missingIndex ? '_' : letter)
      .join('');
    
    // Generate options that are different from the correct letter
    const options = generateUniqueOptions(
      word.word[word.missingIndex],
      optionsCount - 1,
      () => {
        let letter;
        do {
          letter = alphabet[Math.floor(Math.random() * alphabet.length)];
        } while (letter === word.word[word.missingIndex]);
        return letter;
      }
    );
    
    questions.push({
      prompt: 'Which letter completes the word?',
      focus: wordWithBlank,
      visual: word.emoji,
      options,
      correctAnswer: word.word[word.missingIndex],
      type: 'fill-in-the-blank'
    });
  }
  
  return questions;
}

/**
 * Rhyming word pairs and distractors for the rhyming game
 */
export const rhymingWordSets = [
  {
    prompt: 'Pick the word that rhymes with "ball"',
    focus: 'ball',
    options: ['cat', 'wall', 'shoe'],
    correctAnswer: 'wall',
  },
  {
    prompt: 'Pick the word that rhymes with "cat"',
    focus: 'cat',
    options: ['bat', 'dog', 'car'],
    correctAnswer: 'bat',
  },
  {
    prompt: 'Pick the word that rhymes with "sun"',
    focus: 'sun',
    options: ['run', 'sit', 'pen'],
    correctAnswer: 'run',
  },
  {
    prompt: 'Pick the word that rhymes with "dog"',
    focus: 'dog',
    options: ['log', 'cat', 'fish'],
    correctAnswer: 'log',
  },
  {
    prompt: 'Pick the word that rhymes with "car"',
    focus: 'car',
    options: ['star', 'bus', 'pen'],
    correctAnswer: 'star',
  },
  {
    prompt: 'Pick the word that rhymes with "tree"',
    focus: 'tree',
    options: ['bee', 'dog', 'cat'],
    correctAnswer: 'bee',
  },
  {
    prompt: 'Pick the word that rhymes with "hat"',
    focus: 'hat',
    options: ['bat', 'dog', 'car'],
    correctAnswer: 'bat',
  },
  {
    prompt: 'Pick the word that rhymes with "book"',
    focus: 'book',
    options: ['look', 'pen', 'cat'],
    correctAnswer: 'look',
  },
  {
    prompt: 'Pick the word that rhymes with "mouse"',
    focus: 'mouse',
    options: ['house', 'dog', 'car'],
    correctAnswer: 'house',
  },
  {
    prompt: 'Pick the word that rhymes with "bed"',
    focus: 'bed',
    options: ['red', 'cat', 'dog'],
    correctAnswer: 'red',
  },
];

/**
 * Generates rhyming word questions
 */
export function generateRhymingQuestions(count: number = 5): GameQuestion[] {
  // Shuffle and select up to count questions
  const shuffled = [...rhymingWordSets].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((q) => ({
    prompt: q.prompt,
    focus: q.focus,
    options: q.options,
    correctAnswer: q.correctAnswer,
    type: 'rhyming',
  }));
}

/**
 * Generates alphabet sequence questions where children identify missing letters
 */
export function generateAlphabetSequenceQuestions(count: number = 5, optionsCount: number = 3): GameQuestion[] {
  const questions: GameQuestion[] = [];
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const usedSequences = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    let sequenceStart: number;
    let sequenceLength: number;
    let missingIndex: number;
    let sequenceKey: string;
    let attempts = 0;
    
    // Generate unique sequences
    do {
      // Generate sequence of 3-6 letters
      sequenceLength = Math.floor(Math.random() * 4) + 3; // 3-6 letters
      sequenceStart = Math.floor(Math.random() * (26 - sequenceLength)); // Ensure we don't go past Z
      missingIndex = Math.floor(Math.random() * sequenceLength);
      sequenceKey = `${sequenceStart}-${sequenceLength}-${missingIndex}`;
      attempts++;
    } while (usedSequences.has(sequenceKey) && attempts < GAME_TIMINGS.MAX_UNIQUE_ATTEMPTS);
    
    usedSequences.add(sequenceKey);
    
    // Create sequence with missing letter
    const sequence: string[] = [];
    const correctLetter = alphabet[sequenceStart + missingIndex];
    
    for (let j = 0; j < sequenceLength; j++) {
      if (j === missingIndex) {
        sequence.push('?');
      } else {
        sequence.push(alphabet[sequenceStart + j]);
      }
    }
    
    // Generate options
    const options = generateUniqueOptions(
      correctLetter,
      optionsCount - 1,
      () => {
        // Generate letters that are not in the sequence and not the correct answer
        let letter;
        do {
          letter = alphabet[Math.floor(Math.random() * alphabet.length)];
        } while (
          letter === correctLetter || 
          sequence.includes(letter)
        );
        return letter;
      }
    );
    
    questions.push({
      prompt: 'What letter comes next in the alphabet sequence?',
      focus: sequence.join(', '),
      options,
      correctAnswer: correctLetter,
      type: 'alphabet-sequence'
    });
  }
  
  return questions;
}

/**
 * Generates number sequence questions where children identify missing numbers
 */
export function generateNumberSequenceQuestions(count: number = 5, optionsCount: number = 3): GameQuestion[] {
  const questions: GameQuestion[] = [];
  const usedSequences = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    let sequenceStart: number;
    let sequenceLength: number;
    let missingIndex: number;
    let sequenceKey: string;
    let attempts = 0;
    
    // Generate unique sequences
    do {
      // Generate sequence of 3-6 numbers
      sequenceLength = Math.floor(Math.random() * 4) + 3; // 3-6 numbers
      sequenceStart = Math.floor(Math.random() * 15) + 1; // Start from 1-15
      missingIndex = Math.floor(Math.random() * sequenceLength);
      sequenceKey = `${sequenceStart}-${sequenceLength}-${missingIndex}`;
      attempts++;
    } while (usedSequences.has(sequenceKey) && attempts < GAME_TIMINGS.MAX_UNIQUE_ATTEMPTS);
    
    usedSequences.add(sequenceKey);
    
    // Create sequence with missing number
    const sequence: string[] = [];
    const correctNumber = sequenceStart + missingIndex;
    
    for (let j = 0; j < sequenceLength; j++) {
      if (j === missingIndex) {
        sequence.push('?');
      } else {
        sequence.push((sequenceStart + j).toString());
      }
    }
    
    // Generate options
    const options = generateUniqueOptions(
      correctNumber.toString(),
      optionsCount - 1,
      () => {
        // Generate numbers that are close but not in the sequence
        let number;
        const maxNumber = sequenceStart + sequenceLength + 5;
        const minNumber = Math.max(1, sequenceStart - 5);
        do {
          number = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
        } while (
          number === correctNumber ||
          sequence.includes(number.toString())
        );
        return number.toString();
      }
    );
    
    questions.push({
      prompt: 'What number comes next in the number sequence?',
      focus: sequence.join(', '),
      options,
      correctAnswer: correctNumber.toString(),
      type: 'number-sequence'
    });
  }
  
  return questions;
} 