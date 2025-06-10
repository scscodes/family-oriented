# Project Architecture Overview

## 1. Overview
This project is a family-oriented educational game platform built with Next.js and React, using Material UI for design with a comprehensive design tokens system and styled components architecture. It features a modular architecture for different game types (math, colors, shapes, patterns, etc.), centralized settings management, extensible question generation logic, an accessible accordion-based navigation system, and a unified theme system with proper design tokens.

## 2. Main Concepts
- **Game Categories**: Games are organized by academic subjects (Language Arts, Mathematics, Social Studies, Visual Arts) with accordion-based navigation
- **Accessibility-First Design**: WCAG-compliant interface with proper ARIA attributes, keyboard navigation, and screen reader support
- **Design Token System**: Comprehensive design tokens for spacing, typography, colors, shadows, and animations
- **Styled Components Architecture**: Centralized styled components using MUI's styled API with proper theme integration
- **Enhanced Theme System**: Unified theme provider that consolidates MUI theme with dynamic theme switching
- **Game Types**: Each game (e.g., numbers, letters, math, fill-in-the-blank, rhyming) is a module with its own question generation logic and UI
- **Settings Context**: Global settings (e.g., number of questions, difficulty, ranges) are managed via React context and persisted in localStorage
- **Question Generators**: Centralized logic for generating questions for each game type, supporting extensibility and consistency
- **Game Board**: A reusable component that handles question display, user interaction, scoring, and feedback
- **Hooks**: Custom hooks (e.g., `useGame`) abstract game logic and settings integration

## 3. Core Modules

### **Theme & Styling System**
- **src/theme/EnhancedThemeProvider.tsx**: Unified theme provider consolidating MUI theme with dynamic switching
- **src/theme/theme.ts**: Enhanced MUI theme creation with design tokens integration
- **src/theme/tokens.ts**: Comprehensive design tokens system (spacing, typography, colors, shadows, accessibility)
- **src/components/styled/**: Centralized styled components directory with reusable components
  - **buttons/**: StyledButton variants (Primary, Secondary, Floating, Nav)
  - **cards/**: StyledCard variants (Game, Feature, Choice)
  - **layout/**: Layout components (PageContainer, ResponsiveGrid, GameLayout)

### **Landing Page & Navigation**
- **src/app/page.tsx**: Modern accordion-based landing page with search and filtering
- **src/components/SearchBar.tsx**: Search functionality for game discovery
- **src/components/AccordionCategory.tsx**: Accessible category expansion with ARIA support
- **src/components/ThemeSelector.tsx**: Theme switching component with enhanced provider integration

### **Game Logic & Data**
- **src/context/SettingsContext.tsx**: Provides global settings state and update logic
- **src/utils/gameUtils.ts**: Contains all question generation logic and type definitions for games
- **src/utils/arrayUtils.ts**: Proper randomization algorithms (Fisher-Yates shuffle) and array utilities
- **src/utils/constants.ts**: Centralized timing constants, UI defaults, and magic number elimination
- **src/hooks/useGame.ts**: Shared hook for generating questions and integrating with settings
- **src/utils/settingsUtils.ts**: Handles default settings and localStorage persistence

### **UI Components**
- **src/components/GameBoard.tsx**: Main UI for presenting questions, options, and feedback
- **src/components/ChoiceCard.tsx**: Accessible game option cards with styled components integration
- **src/app/games/**: Contains per-game UI and logic, each in its own directory

### **Type Safety & Interfaces**
- **src/types/**: TypeScript interfaces for `GameQuestion`, `GameData`, `CategoryData`, and settings
- Strong typing throughout for questions, settings, and game logic to prevent errors

## 4. Data Flow

### **Theme System Flow**
1. **EnhancedThemeProvider** wraps the application providing unified theme context
2. **Theme Switching** updates both MUI theme and custom theme variants dynamically
3. **Design Tokens** are consumed by styled components for consistent styling
4. **Component Styling** uses centralized styled components instead of inline sx props

### **Landing Page Navigation**
1. **Landing Page** displays categorized games in accessible accordions
2. **Search/Filter System** allows users to find games by name or academic subject
3. **Category Accordions** expand to show relevant games with proper ARIA attributes
4. **Game Cards** provide visual navigation to individual games

### **Game Execution**
1. **SettingsProvider** wraps the app, providing settings context
2. **Game pages** use `useGame` to generate questions based on current settings
3. **Question Generators** use centralized algorithms and constants for consistency
4. **GameBoard** receives questions and manages user interaction, scoring, and feedback
5. **Settings changes** propagate through context, updating all dependent components

## 5. Key Architectural Decisions

### **Design System & Styling**
- **Design Tokens**: Centralized design values following WCAG standards
- **Styled Components**: MUI's styled API for component creation with theme integration
- **Theme Consolidation**: Single unified theme system replacing parallel theme contexts
- **Accessibility Tokens**: Built-in focus rings, touch targets, and contrast ratios
- **Performance**: Styled components over inline sx props for better performance

### **Accessibility & UX**
- **Accordion Navigation**: Reduces cognitive load while maintaining discoverability
- **ARIA Compliance**: Proper labels, roles, and states for screen reader compatibility
- **Keyboard Navigation**: Full functionality accessible via keyboard
- **Academic Categorization**: Intuitive organization by educational subjects
- **Focus Management**: Consistent focus indicators and keyboard navigation patterns

### **Code Quality & Performance**
- **Centralized Question Generation**: All question logic in one place for maintainability and extensibility
- **Proper Algorithms**: Fisher-Yates shuffle instead of biased sorting methods
- **Constants Management**: Centralized timing and UI constants eliminate magic numbers
- **Type Safety**: Strong TypeScript typing prevents runtime errors
- **Algorithmic Content**: Dynamic pattern and question generation for scalability
- **Component Reuse**: Styled components designed for reuse across different contexts

### **Component Architecture**
- **Component Reuse**: GameBoard and UI components designed for reuse across game types
- **Style Consistency**: Unified styling system with design tokens and styled components
- **Context for Settings**: Ensures consistent settings across all games with easy persistence
- **Theme Integration**: All components properly integrated with enhanced theme provider

## 6. Recent Improvements

### **Styling System Modernization**
- **Enhanced Theme Provider**: Consolidated MUI theme with dynamic theme switching
- **Design Tokens System**: Comprehensive tokens for spacing, typography, colors, shadows, transitions
- **Styled Components Architecture**: Centralized styled components replacing inline styling
- **Accessibility Integration**: Built-in accessibility tokens and focus management
- **Performance Optimization**: Styled components over sx props for better performance

### **Landing Page Redesign**
- Migrated from grid layout to accessible accordion system
- Added search functionality with debouncing for performance
- Implemented subject-based filtering with visual chips
- Added proper ARIA attributes for screen reader support

### **Code Quality Enhancements**
- Fixed problematic shuffle algorithm with proper Fisher-Yates implementation
- Centralized magic numbers in `constants.ts` for maintainability
- Consolidated duplicate math question generation logic
- Replaced hard-coded patterns with algorithmic generators
- Resolved styling conflicts and removed unused code
- Eliminated all TypeScript and linting errors

### **Theme System Improvements**
- **Unified Theme Provider**: Replaced parallel theme systems with single source of truth
- **Theme Variants**: Simplified theme switching with proper MUI integration
- **Component Migration**: Updated all components to use enhanced theme provider
- **Build System**: Fixed all build issues and enabled static generation

### **Utility Architecture**
- **src/utils/arrayUtils.ts**: Proper shuffle, unique generation, and array manipulation
- **src/utils/constants.ts**: Centralized constants for timing, defaults, and UI values
- **Pattern Generators**: Algorithmic generation of arithmetic, alphabetic, and geometric sequences

## 7. Extensibility

### **Adding New Games**
1. Implement a new question generator in `gameUtils.ts`
2. Register it in the `questionGenerators` map
3. Add the game to the appropriate category in the landing page
4. Create a UI page in `src/app/games/[game-name]/`
5. Use existing styled components for consistent styling

### **Custom Settings**
- Extend the `GlobalSettings` interface and settings context
- Update the settings UI to support new configuration options
- Use centralized constants for consistent defaults

### **Styling Extensions**
- **New Styled Components**: Add to appropriate category in `src/components/styled/`
- **Design Tokens**: Extend tokens.ts for new design values
- **Theme Variants**: Add new color schemes to themeVariants
- **Component Variants**: Use styled() API for new component variations

### **Accessibility Enhancements**
- All new components must include proper ARIA attributes
- Use the established patterns for keyboard navigation
- Test with screen readers and ensure high contrast ratios
- Leverage accessibility tokens for consistent implementation

### **AI/Agent Integration**
The architecture supports future integration with AI agents for:
- Adaptive learning based on user performance
- Dynamic difficulty adjustment
- Content generation and personalization
- Analytics and progress tracking

## 8. Performance Considerations

### **Current Optimizations**
- Styled components instead of inline sx props for better performance
- Debounced search to prevent excessive filtering
- Memoized expensive calculations in question generators
- Efficient array operations using proper algorithms
- Minimal re-renders through proper React patterns
- Design token caching through theme provider

### **Future Optimization Opportunities**
- Component memoization for large game lists
- Lazy loading of game content
- Service worker for offline functionality
- Bundle splitting for faster initial loads

## 9. Testing & Quality Assurance

### **Current Testing**
- TypeScript compilation ensures type safety (all errors resolved)
- ESLint compliance ensures code quality (all warnings resolved)
- Jest test suite with 100% pass rate
- Manual accessibility testing with screen readers
- Cross-browser compatibility testing
- Performance monitoring during development
- Production build validation

### **Testing Infrastructure**
- Jest configuration for unit testing
- Test utilities for component testing
- Accessibility testing helpers
- Build validation in CI/CD pipeline
- TypeScript strict mode compliance

## 10. File Organization

### **Theme & Styling**
```
src/theme/
├── EnhancedThemeProvider.tsx  # Unified theme provider
├── theme.ts                   # Enhanced MUI theme creation
├── tokens.ts                  # Design tokens system
└── ThemeProvider.tsx          # Legacy provider (deprecated)

src/components/styled/
├── index.ts                   # Centralized exports
├── buttons/                   # Button styled components
├── cards/                     # Card styled components
└── layout/                    # Layout styled components
```

### **Core Architecture**
```
src/
├── app/                       # Next.js app router
├── components/                # Reusable UI components
├── context/                   # React contexts
├── hooks/                     # Custom hooks
├── theme/                     # Theme system
├── types/                     # TypeScript definitions
└── utils/                     # Utility functions
```

This architecture provides a solid foundation for scalable, accessible, and maintainable educational games with a modern design system and proper development practices. 