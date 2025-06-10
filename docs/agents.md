# Agent-Centric Project Guide

This document is designed to help AI/LLM-powered agents quickly understand and interact with the core logic and extensibility points of the project. The platform now features an accessible accordion-based navigation system with centralized utilities and improved code quality patterns.

## 1. Context & State

### **Settings Management**
- **SettingsContext**: The global source of truth for all game configuration (number of questions, ranges, difficulty, etc.)
  - Located in `src/context/SettingsContext.tsx`
  - Exposes settings, update functions, and reset logic
  - Settings are persisted in localStorage for continuity
- **Usage**: Agents can read and update settings via the context, or directly manipulate localStorage for batch operations

### **Navigation & UI State**
- **Landing Page**: Accordion-based navigation with search and filtering capabilities
  - Located in `src/app/page.tsx`
  - Features academic subject categorization and accessibility-first design
  - Search state is managed locally with debouncing for performance

## 2. Question Generation & Utilities

### **Centralized Generation Logic**
- **Location**: `src/utils/gameUtils.ts`
  - Each game type (numbers, math, colors, etc.) has a dedicated generator function
  - All generators return a list of `GameQuestion` objects, which are strongly typed
  - The `questionGenerators` map allows dynamic selection of the appropriate generator based on game type and settings
- **Extending**: To add new question types, implement a new generator and register it in `questionGenerators`

### **Utility Functions**
- **Array Operations**: `src/utils/arrayUtils.ts`
  - `fisherYatesShuffle()`: Proper randomization algorithm (not biased sorting)
  - `generateUniqueOptions()`: Creates unique arrays without duplicates
  - **Agent Note**: Always use these utilities instead of `Math.random() - 0.5` sorting
  
- **Constants Management**: `src/utils/constants.ts`
  - `GAME_TIMINGS`: Feedback delays, transition timings
  - `GAME_DEFAULTS`: Default question counts, difficulty levels
  - `UI_CONSTANTS`: Icon sizes, spacing, visual constants
  - **Agent Note**: Use these constants instead of magic numbers in code

### **Algorithmic Content Generation**
- **Pattern Generators**: Dynamic pattern creation instead of hard-coded data
  - Arithmetic sequences (e.g., 2, 4, 6, 8)
  - Alphabetic sequences (e.g., A, B, C, D)
  - Geometric sequences (e.g., 1, 2, 4, 8)
- **Math Generators**: Centralized addition/subtraction question creation
  - Configurable difficulty ranges
  - Proper randomization of operands and distractors

## 3. Game Flow & Architecture

### **Game Navigation Flow**
1. **Landing Page** displays games in accessible accordions organized by academic subject
2. **Search/Filter** allows discovery by game name or educational category
3. **Game Selection** navigates to individual game pages with proper routing
4. **Settings Integration** ensures consistent configuration across all games

### **Game Execution Flow**
- **useGame Hook**: The main orchestrator for question generation and settings integration
  - Located in `src/hooks/useGame.ts`
  - Consumes global settings and produces a list of questions for the current game
- **GameBoard Component**: The UI engine for presenting questions, options, and feedback
  - Located in `src/components/GameBoard.tsx`
  - Handles user interaction, scoring, and state transitions with accessibility support

## 4. Accessibility & Code Quality Patterns

### **Accessibility Standards**
- **ARIA Compliance**: All interactive elements have proper ARIA attributes
  - Accordion navigation uses `aria-expanded`, `aria-controls`
  - Game options have `aria-label` for screen readers
  - Keyboard navigation support throughout
- **Best Practices**: Always include accessibility when extending components
  - Use semantic HTML elements
  - Provide alternative text for visual content
  - Ensure high contrast ratios and large touch targets

### **Code Quality Standards**
- **Type Safety**: Strict TypeScript with explicit interfaces
  - `GameQuestion`, `GameData`, `CategoryData` interfaces
  - No `any` or `unknown` types in production code
- **Algorithm Quality**: Use proper computer science algorithms
  - Fisher-Yates shuffle for randomization
  - Efficient array operations from `arrayUtils.ts`
  - Algorithmic content generation over hard-coded data
- **Constants Usage**: Centralized configuration values
  - Import from `constants.ts` for all timing and UI values
  - Avoid magic numbers scattered throughout code

## 5. Extensibility Points

### **Landing Page & Navigation**
- **Adding Game Categories**: Extend the `GAME_CATEGORIES` array in `src/app/page.tsx`
- **Search Enhancement**: Modify search logic to include new metadata fields
- **Filter Options**: Add new subject categories or difficulty filters

### **Game Types & Content**
- **Settings**: Add new fields to the `GlobalSettings` interface and update the context/provider logic
- **Question Types**: Add new generator functions and update the `questionGenerators` map
- **UI/UX**: Extend or customize the `GameBoard` or per-game pages for new interaction patterns
- **Content Generation**: Create new algorithmic generators for scalable content

### **Utility Extensions**
- **Array Operations**: Add new mathematical or randomization functions to `arrayUtils.ts`
- **Constants**: Extend `constants.ts` with new timing, sizing, or configuration values
- **Algorithms**: Implement new pattern generators or mathematical operations

## 6. Agent Integration Patterns

### **Direct Context Manipulation**
- Use the SettingsContext to read/update configuration in real time
- Monitor game performance through GameBoard state and user interactions
- Adapt settings based on user success rates or preferences

### **Batch Operations**
- Read/write settings or question data in localStorage for rapid prototyping or testing
- Bulk generate questions for testing or pre-caching
- Analyze user patterns across multiple sessions

### **Code Generation & Enhancement**
- **Question Generator Extension**: Wrap or extend the `questionGenerators` map to inject new logic
  - Example: Add logging, difficulty adaptation, or content personalization
  - Example: Create hybrid generators that combine multiple question types
- **Settings Interception**: Patch the provider to observe and react to changes
  - Example: Enforce accessibility standards or age-appropriate content
  - Example: Add intelligent defaults based on user behavior
- **Dynamic Game Creation**: Register new question generators or inject new game types at runtime
- **Accessibility Enhancement**: Automatically add ARIA attributes or keyboard support

### **Advanced Integration Examples**
```typescript
// Example: Adaptive difficulty based on performance
const adaptiveMathGenerator = (settings: GlobalSettings, userStats: UserStats) => {
  const difficulty = calculateOptimalDifficulty(userStats);
  return generateMathQuestions({...settings, difficulty});
};

// Example: Enhanced search with ML-based recommendations
const enhancedSearch = (query: string, userHistory: GameHistory[]) => {
  const baseResults = searchGames(query);
  const recommendations = getMLRecommendations(userHistory);
  return combineResults(baseResults, recommendations);
};
```

### **Feedback Loops & Analytics**
- Monitor user answers and adapt question generation or settings for personalized learning
- Track accessibility usage patterns to improve inclusive design
- Analyze game completion rates and difficulty curves for optimization
- Use performance data to suggest content enhancements or new game types

## 7. Key Types & Interfaces

### **Core Data Structures**
- **GameQuestion**: The core data structure for all questions. Includes prompt, options, correct answer, type, and optional metadata
- **GlobalSettings**: The shape of all configurable options for the platform
- **GameData**: Individual game information with title, description, and navigation data
- **CategoryData**: Academic subject categories with icons and game collections

### **Utility Types**
- **Timing Constants**: Structured timing configuration for consistent UX
- **Array Utilities**: Type-safe array manipulation and randomization functions
- **Pattern Types**: Algorithmic sequence generation with configurable parameters

## 8. Best Practices for Agents

### **Code Quality**
- Always validate settings before applying them to avoid breaking the UI
- Use the centralized utility functions (`arrayUtils.ts`, `constants.ts`) for consistency
- Prefer algorithmic content generation over hard-coded data for scalability
- Follow TypeScript strict typing - avoid `any` or `unknown` types

### **Accessibility**
- Include proper ARIA attributes when creating or modifying components
- Test keyboard navigation and screen reader compatibility
- Ensure color contrast ratios meet WCAG standards
- Use semantic HTML elements and proper heading hierarchies

### **Architecture**
- Use the centralized question generation logic for consistency
- Prefer context/provider APIs over direct DOM manipulation for state changes
- When adding new features, update both the context and the UI for a seamless experience
- Follow the established patterns for component reuse and extensibility

### **Performance**
- Use proper algorithms (Fisher-Yates shuffle, efficient array operations)
- Leverage React optimization patterns (memoization, proper dependency arrays)
- Centralize constants and avoid repeated calculations
- Consider accessibility performance impact (screen reader efficiency)

## 9. Development Workflow

### **Testing & Validation**
- Run TypeScript compilation to ensure type safety
- Test accessibility with screen readers and keyboard navigation
- Validate game logic with proper randomization and edge cases
- Ensure all builds pass before deployment

### **Documentation Updates**
- Update architecture docs when adding new utilities or patterns
- Document new accessibility features and testing procedures
- Keep agent integration examples current with latest patterns
- Maintain task tracking for complex implementations 