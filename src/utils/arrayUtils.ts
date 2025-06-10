/**
 * Utility functions for array operations
 */

/**
 * Fisher-Yates shuffle algorithm for proper randomization
 * @param array - Array to shuffle (will be modified in place)
 * @returns The shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]; // Create a copy to avoid mutating original
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Generate unique random options for questions
 * @param correctAnswer - The correct answer to include
 * @param count - Number of additional wrong options to generate
 * @param generator - Function to generate a random option
 * @param maxAttempts - Maximum attempts to find unique options
 * @returns Array of unique options including the correct answer
 */
export function generateUniqueOptions(
  correctAnswer: string,
  count: number,
  generator: () => string,
  maxAttempts: number = 100
): string[] {
  const options = new Set([correctAnswer]);
  let attempts = 0;
  
  while (options.size < count + 1 && attempts < maxAttempts) {
    const option = generator();
    if (option !== correctAnswer) {
      options.add(option);
    }
    attempts++;
  }
  
  // If we couldn't generate enough unique options, fill with generated ones
  while (options.size < count + 1) {
    options.add(generator());
  }
  
  return shuffleArray(Array.from(options));
} 