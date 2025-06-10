# Architecture Overview

## Core Concepts
Educational game platform with modular game types, centralized settings management, and accessible design. Built with Next.js, React, and Material UI using design tokens.

**Key Features**: Accordion navigation, unified theme system, question generators, accessibility-first design

## Architecture

### Theme System
- **EnhancedThemeProvider** (`src/theme/EnhancedThemeProvider.tsx`): Unified theme with dynamic switching
- **Design Tokens** (`src/theme/tokens.ts`): Spacing, colors, shadows, accessibility tokens
- **Styled Components** (`src/components/styled/`): Centralized components using MUI's styled API

### Game Logic
- **Settings Context** (`src/context/SettingsContext.tsx`): Global settings with localStorage persistence
- **Question Generators** (`src/utils/gameUtils.ts`): Centralized logic per game type
- **Game Hook** (`src/hooks/useGame.ts`): Settings integration and question generation
- **Game Board** (`src/components/GameBoard.tsx`): Reusable UI for all games

### Navigation
- **Landing Page** (`src/app/page.tsx`): Accordion-based navigation with search
- **Game Categories**: Organized by academic subjects with accessibility support

## Data Flow

### Theme System
1. EnhancedThemeProvider → Design tokens → Styled components
2. Theme switching updates both MUI and custom variants

### Game Execution
1. SettingsProvider → Game pages use `useGame` → Question generators → GameBoard
2. Settings changes propagate through context

## Key Decisions

### Design System
- **Design Tokens**: WCAG-compliant spacing, colors, shadows
- **Styled Components**: Better performance than inline `sx` props
- **Accessibility Tokens**: Built-in focus rings, touch targets, contrast ratios

### Code Quality
- **Centralized Utilities**: Question generation, array operations, constants
- **Type Safety**: Strict TypeScript, explicit interfaces, no `any` types
- **Proper Algorithms**: Fisher-Yates shuffle, efficient operations
- **Accessibility**: ARIA compliance, keyboard navigation, screen reader support

## File Structure
```
src/
├── app/                       # Next.js pages
├── components/                # UI components
│   └── styled/                # Styled components
├── context/                   # React contexts
├── hooks/                     # Custom hooks
├── theme/                     # Theme system
├── types/                     # TypeScript definitions
└── utils/                     # Utilities (gameUtils, arrayUtils, constants)
```

## Extensibility

### Adding Games
1. Create generator in `gameUtils.ts`
2. Register in `questionGenerators` map
3. Add to landing page categories
4. Create UI page in `src/app/games/[name]/`

### Styling
- Extend design tokens in `tokens.ts`
- Add styled components to appropriate category
- Use `styled()` API with design tokens

### Settings
- Extend `GlobalSettings` interface
- Update settings context and UI
- Use centralized constants

## Recent Improvements
- Enhanced theme provider consolidation
- Design tokens system implementation
- Styled components architecture
- Code quality fixes (TypeScript, ESLint)
- Accessibility compliance built-in
- Build system optimization

## Testing & Quality
- TypeScript: Zero compilation errors
- ESLint: Zero warnings
- Jest: 100% test pass rate
- Accessibility: WCAG compliant
- Performance: Optimized with styled components 