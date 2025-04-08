/**
 * Game types supported by the application
 */
export type GameType = 'numbers' | 'letters' | 'shapes' | 'colors' | 'patterns' | 'math' | 'geography';

/**
 * Basic structure for all game questions
 */
export interface GameQuestion {
  question: string;
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
  
  // Number questions
  for (let i = 0; i < count; i++) {
    const num = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    const options = generateUniqueOptions(
      num.toString(), 
      optionsCount - 1, 
      () => (Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber).toString()
    );
    
    questions.push({
      question: `Which number is ${numberToWord(num)}?`,
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
  
  // Mix of uppercase and lowercase letter questions
  for (let i = 0; i < count; i++) {
    const isUppercase = Math.random() > 0.5;
    const letter = alphabet[Math.floor(Math.random() * alphabet.length)];
    const displayLetter = isUppercase ? letter : letter.toLowerCase();
    const askForCase = isUppercase ? 'uppercase' : 'lowercase';
    
    // Generate options that maintain the same case as the question
    const options = generateUniqueOptions(
      displayLetter, 
      optionsCount - 1, 
      () => {
        const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
        return isUppercase ? randomLetter : randomLetter.toLowerCase();
      }
    );
    
    questions.push({
      question: `Which is the ${askForCase} letter ${isUppercase ? letter : letter.toUpperCase()}?`,
      options,
      correctAnswer: displayLetter,
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
  
  for (let i = 0; i < count; i++) {
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const options = generateUniqueOptions(
      shape, 
      optionsCount - 1, 
      () => shapes[Math.floor(Math.random() * shapes.length)]
    );
    
    questions.push({
      question: `Which one is a ${shape}?`,
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
  
  for (let i = 0; i < count; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const options = generateUniqueOptions(
      color, 
      optionsCount - 1, 
      () => colors[Math.floor(Math.random() * colors.length)]
    );
    
    questions.push({
      question: `Which one is ${color}?`,
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
      question: `What comes next? ${pattern.sequence}`,
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
      question,
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