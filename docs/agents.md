# Agent-Centric Project Guide

This document is designed to help AI/LLM-powered agents quickly understand and interact with the core logic and extensibility points of the project. The platform features an accessible accordion-based navigation system with centralized utilities, a modern design tokens system, styled components architecture, and comprehensive code quality improvements.

## 1. Context & State

### **Settings Management**
- **SettingsContext**: The global source of truth for all game configuration (number of questions, ranges, difficulty, etc.)
  - Located in `src/context/SettingsContext.tsx`
  - Exposes settings, update functions, and reset logic
  - Settings are persisted in localStorage for continuity
- **Usage**: Agents can read and update settings via the context, or directly manipulate localStorage for batch operations

### **Theme & Styling System**
- **EnhancedThemeProvider**: Unified theme system consolidating MUI theme with dynamic switching
  - Located in `src/theme/EnhancedThemeProvider.tsx`
  - Provides `useEnhancedTheme()` hook for theme access
  - Supports theme variants: Purple Dreams, Ocean Breeze, Forest Green, Sunset Glow
- **Design Tokens**: Comprehensive token system in `src/theme/tokens.ts`
  - Spacing, typography, colors, shadows, transitions, accessibility tokens
  - Type-safe with TypeScript and WCAG compliance built-in
- **Styled Components**: Centralized components in `src/components/styled/`
  - Buttons, cards, layout components using MUI's styled API
  - Proper theme integration and performance optimization

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

## 4. Styling & Design System

### **Design Tokens System**
- **Location**: `src/theme/tokens.ts`
- **Comprehensive Tokens**:
  ```typescript
  export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64 };
  export const shadows = { card, cardHover, focus, focusError, button, buttonHover, modal };
  export const accessibility = { focusRing, touchTarget, contrast };
  export const transitions = { duration: { fast, normal, slow }, easing: { ... } };
  ```
- **Agent Usage**: Always use design tokens instead of hard-coded style values

### **Styled Components Architecture**
- **Location**: `src/components/styled/`
- **Structure**:
  ```
  src/components/styled/
  ├── index.ts                 # Centralized exports
  ├── buttons/StyledButton.tsx # Button variants with design tokens
  ├── cards/StyledCard.tsx     # Card variants for different use cases
  ├── cards/ChoiceCard.tsx     # Game-specific interactive cards
  └── layout/                  # Layout components with responsive design
  ```
- **Agent Best Practice**: Use styled components over inline `sx` props for better performance

### **Theme Integration**
- **Enhanced Theme Provider**: Unified system replacing parallel theme contexts
- **Theme Switching**: Dynamic theme changes through `useEnhancedTheme()` hook
- **Component Integration**: All components properly integrated with theme tokens

## 5. Accessibility & Code Quality Patterns

### **Accessibility Standards**
- **ARIA Compliance**: All interactive elements have proper ARIA attributes
  - Accordion navigation uses `aria-expanded`, `aria-controls`
  - Game options have `aria-label` for screen readers
  - Keyboard navigation support throughout
- **Accessibility Tokens**: Built-in compliance through design tokens
  ```typescript
  export const accessibility = {
    focusRing: { width: '2px', style: 'solid', color: 'rgba(46, 196, 182, 0.6)' },
    touchTarget: { minSize: '44px' }, // WCAG minimum
    contrast: { normal: 4.5, large: 3 }, // WCAG AA compliance
  };
  ```
- **Best Practices**: Always include accessibility when extending components

### **Code Quality Standards**
- **Type Safety**: Strict TypeScript with explicit interfaces
  - `GameQuestion`, `GameData`, `CategoryData` interfaces
  - No `any` or `unknown` types in production code
  - **Status**: 100% TypeScript compilation success
- **Algorithm Quality**: Use proper computer science algorithms
  - Fisher-Yates shuffle for randomization
  - Efficient array operations from `arrayUtils.ts`
  - Algorithmic content generation over hard-coded data
- **ESLint Compliance**: Zero warnings/errors throughout codebase
- **Testing**: Jest test suite with 100% pass rate (16/16 tests)

## 6. Extensibility Points

### **Styling Extensions**
- **New Styled Components**: Add to appropriate category in `src/components/styled/`
  ```typescript
  // Example: Adding a new button variant
  export const StyledGameButton = styled(Button)(({ theme }) => ({
    borderRadius: borderRadius.xl,
    padding: `${spacing.sm}px ${spacing.lg}px`,
    // Use design tokens throughout
  }));
  ```
- **Design Token Extensions**: Extend `tokens.ts` for new design values
- **Theme Variants**: Add new color schemes to `themeVariants`
- **Component Variants**: Use `styled()` API for new component variations

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

## 7. Agent Integration Patterns

### **Modern Styling Integration**
- **Design Token Usage**: Always reference design tokens instead of hard-coded values
  ```typescript
  // Good: Using design tokens
  import { spacing, shadows } from '@/theme/tokens';
  const styles = { padding: spacing.md, boxShadow: shadows.card };
  
  // Avoid: Hard-coded values
  const styles = { padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' };
  ```
- **Styled Components**: Prefer styled components over inline styling
- **Theme Integration**: Use `useEnhancedTheme()` for dynamic theme access

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
- **Accessibility Enhancement**: Automatically add ARIA attributes or keyboard support using accessibility tokens

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

// Example: Styled component with theme integration
const AdaptiveGameCard = styled(Card)(({ theme }) => ({
  borderRadius: borderRadius.lg,
  padding: spacing.md,
  boxShadow: shadows.card,
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  transition: transitions.duration.normal,
}));
```

### **Feedback Loops & Analytics**
- Monitor user answers and adapt question generation or settings for personalized learning
- Track accessibility usage patterns to improve inclusive design
- Analyze game completion rates and difficulty curves for optimization
- Use performance data to suggest content enhancements or new game types

## 8. Key Types & Interfaces

### **Core Data Structures**
- **GameQuestion**: The core data structure for all questions. Includes prompt, options, correct answer, type, and optional metadata
- **GlobalSettings**: The shape of all configurable options for the platform
- **GameData**: Individual game information with title, description, and navigation data
- **CategoryData**: Academic subject categories with icons and game collections

### **Styling Types**
- **ThemeVariant**: Type-safe theme variant keys ('purple' | 'ocean' | 'forest' | 'sunset')
- **Design Token Types**: Exported from `tokens.ts` for type safety in styled components
- **Theme Extensions**: Custom MUI theme interface extensions for games and accessibility

### **Utility Types**
- **Timing Constants**: Structured timing configuration for consistent UX
- **Array Utilities**: Type-safe array manipulation and randomization functions
- **Pattern Types**: Algorithmic sequence generation with configurable parameters

## 9. Best Practices for Agents

### **Styling & Design**
- **Always Use Design Tokens**: Reference tokens from `src/theme/tokens.ts` instead of hard-coded values
- **Styled Components Over Inline**: Prefer styled components for better performance and reusability
- **Theme Integration**: Use `useEnhancedTheme()` hook for dynamic theme access
- **Accessibility Tokens**: Leverage built-in accessibility tokens for WCAG compliance

### **Code Quality**
- Always validate settings before applying them to avoid breaking the UI
- Use the centralized utility functions (`arrayUtils.ts`, `constants.ts`) for consistency
- Prefer algorithmic content generation over hard-coded data for scalability
- Follow TypeScript strict typing - avoid `any` or `unknown` types

### **Accessibility**
- Include proper ARIA attributes when creating or modifying components
- Test keyboard navigation and screen reader compatibility
- Ensure color contrast ratios meet WCAG standards using accessibility tokens
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

## 10. Development Workflow

### **Quality Assurance Status**
- ✅ **TypeScript Compilation**: 100% clean (zero errors)
- ✅ **ESLint Compliance**: 100% clean (zero warnings) 
- ✅ **Test Suite**: All tests passing (16/16)
- ✅ **Production Build**: Successful static generation (21 pages)
- ✅ **Accessibility**: WCAG compliant with proper ARIA attributes
- ✅ **Performance**: Optimized with styled components and design tokens

### **Testing & Validation**
- Run TypeScript compilation to ensure type safety
- Test accessibility with screen readers and keyboard navigation
- Validate game logic with proper randomization and edge cases
- Ensure all builds pass before deployment

### **Documentation Updates**
- Update architecture docs when adding new utilities or patterns
- Document new styled components and design token extensions
- Keep accessibility guidelines current with implementation

## 11. Project Health Status

### **Recently Completed Improvements**
- ✅ **Styling System Modernization**: Complete design tokens and styled components implementation
- ✅ **Theme System Unification**: Replaced parallel theme systems with EnhancedThemeProvider
- ✅ **Code Quality**: Eliminated all TypeScript errors and ESLint warnings
- ✅ **Build System**: Fixed all build issues and enabled static generation
- ✅ **Component Architecture**: Centralized styled components with proper theme integration
- ✅ **Accessibility**: Built-in WCAG compliance through design tokens

### **Current Stability**
The project is in an excellent state with:
- **Zero compilation errors** across all TypeScript files
- **Zero linting warnings** throughout the codebase
- **100% test pass rate** with comprehensive coverage
- **Successful production builds** with optimized output
- **Modern architecture** with proper separation of concerns
- **Accessibility compliance** built into the design system

This provides a solid foundation for agent integration and future development with predictable, maintainable patterns throughout the codebase. 