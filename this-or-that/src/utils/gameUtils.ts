/**
 * Game types supported by the application
 */
export type GameType = 'numbers' | 'letters' | 'shapes' | 'colors' | 'patterns' | 'math' | 'geography' | 'fill-in-the-blank';

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
    const maxAttempts = 100; // Prevent infinite loop
    
    // Try to find a unique number
    do {
      num = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
      attempts++;
    } while (usedNumbers.has(num.toString()) && attempts < maxAttempts);
    
    // If we couldn't find a unique number, use any number
    if (attempts >= maxAttempts) {
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
    const maxAttempts = 100; // Prevent infinite loop
    
    // Try to find a unique letter
    do {
      const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
      const isUppercase = Math.random() > 0.5;
      letter = isUppercase ? randomLetter : randomLetter.toLowerCase();
      attempts++;
    } while (usedLetters.has(letter) && attempts < maxAttempts);
    
    // If we couldn't find a unique letter, use any letter
    if (attempts >= maxAttempts) {
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
 * Generates pattern-based questions with options
 */
export function generatePatternQuestions(count: number = 5, optionsCount: number = 3): GameQuestion[] {
  const questions: GameQuestion[] = [];
  
  // Simple pattern completion
  const patterns = [
    { sequence: '1, 2, 3, ?', answer: '4', options: ['4', '5', '6'] },
    { sequence: 'A, B, C, ?', answer: 'D', options: ['D', 'E', 'F'] },
    { sequence: '2, 4, 6, ?', answer: '8', options: ['8', '10', '12'] },
    { sequence: 'Square, Triangle, Circle, ?', answer: 'Star', options: ['Star', 'Heart', 'Diamond'] },
    { sequence: 'Red, Blue, Green, ?', answer: 'Yellow', options: ['Yellow', 'Purple', 'Orange'] },
    { sequence: '1, 3, 5, ?', answer: '7', options: ['7', '9', '11'] },
    { sequence: 'Circle, Circle, Square, ?', answer: 'Square', options: ['Square', 'Triangle', 'Circle'] },
    { sequence: 'Cat, Dog, Fish, ?', answer: 'Bird', options: ['Bird', 'Elephant', 'Monkey'] },
    { sequence: '10, 20, 30, ?', answer: '40', options: ['40', '50', '60'] },
    { sequence: 'a, b, c, ?', answer: 'd', options: ['d', 'e', 'f'] }
  ];
  
  // Select random patterns from the list
  const selectedPatterns = [...patterns]
    .sort(() => 0.5 - Math.random())
    .slice(0, count);
  
  for (const pattern of selectedPatterns) {
    // Take only the required number of options
    const limitedOptions = [
      pattern.answer,
      ...pattern.options.filter(opt => opt !== pattern.answer)
    ].slice(0, optionsCount);
    
    questions.push({
      prompt: `What comes next?`,
      focus: pattern.sequence,
      options: limitedOptions.sort(() => 0.5 - Math.random()),
      correctAnswer: pattern.answer,
      type: 'patterns'
    });
  }
  
  return questions;
}

/**
 * Generates math-based questions with options
 */
export function generateMathQuestions(count: number = 5, optionsCount: number = 3): GameQuestion[] {
  const questions: GameQuestion[] = [];
  
  for (let i = 0; i < count; i++) {
    // Randomly choose between addition and subtraction
    const isAddition = Math.random() > 0.5;
    
    // Generate numbers between 1 and 5
    const num1 = Math.floor(Math.random() * 5) + 1;
    const num2 = Math.floor(Math.random() * 5) + 1;
    
    // Ensure subtraction results are positive
    const [a, b] = isAddition ? [num1, num2] : [Math.max(num1, num2), Math.min(num1, num2)];
    const result = isAddition ? a + b : a - b;
    
    const question = `${a} ${isAddition ? '+' : '-'} ${b} = ?`;
    const options = generateUniqueOptions(
      result.toString(),
      optionsCount - 1,
      () => {
        // Generate random options that are different from the correct answer
        let option;
        do {
          option = Math.floor(Math.random() * 10).toString();
        } while (option === result.toString());
        return option;
      }
    );
    
    questions.push({
      prompt: `What is the answer?`,
      focus: question,
      options,
      correctAnswer: result.toString(),
      type: 'math'
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
 * Generates unique options for a question including the correct answer
 */
function generateUniqueOptions(correctAnswer: string, numOptions: number, optionGenerator: () => string): string[] {
  const options = [correctAnswer];
  
  while (options.length < numOptions + 1) {
    const option = optionGenerator();
    if (!options.includes(option)) {
      options.push(option);
    }
  }
  
  // Shuffle the options
  return options.sort(() => 0.5 - Math.random());
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