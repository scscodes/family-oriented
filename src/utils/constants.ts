/**
 * Application-wide constants
 */

// Game timing constants (in milliseconds)
export const GAME_TIMINGS = {
  /** Time to show correct answer before moving to next question */
  CORRECT_ANSWER_DELAY: 1500,
  /** Time to show incorrect feedback before allowing next attempt */
  INCORRECT_ANSWER_DELAY: 500,
  /** Maximum attempts to find unique values before giving up */
  MAX_UNIQUE_ATTEMPTS: 100,
} as const;

// Default game settings
export const GAME_DEFAULTS = {
  /** Default number of questions per game session */
  QUESTIONS_PER_SESSION: 10,
  /** Default number of answer options */
  OPTIONS_COUNT: 4,
  /** Default minimum number for number games */
  MIN_NUMBER: 1,
  /** Default maximum number for number games */
  MAX_NUMBER: 50,
} as const;

// UI constants
export const UI_CONSTANTS = {
  /** Standard icon size for shape games */
  SHAPE_ICON_SIZE: 80,
  /** Maximum width for game containers */
  MAX_CONTAINER_WIDTH: 'lg',
} as const; 