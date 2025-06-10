# Agent Integration Guide

## Quick Start
Educational game platform with centralized utilities, design tokens, and accessible navigation. All games use shared `GameBoard` component with question generators.

## Core Architecture

### Settings & State
- **SettingsContext** (`src/context/SettingsContext.tsx`): Global game configuration persisted in localStorage
- **EnhancedThemeProvider** (`src/theme/EnhancedThemeProvider.tsx`): Unified theme system with dynamic switching
- **Navigation**: Accordion-based with search/filter capabilities

### Question Generation
- **Location**: `src/utils/gameUtils.ts`
- **Pattern**: Each game type has generator function returning `GameQuestion[]`
- **Extension**: Add generator to `questionGenerators` map
- **Utilities**: 
  - `arrayUtils.ts`: Fisher-Yates shuffle, unique generation
  - `constants.ts`: Timing, defaults, UI constants

### Game Flow
1. Landing page → Game selection → `useGame` hook → `GameBoard` component
2. Settings from context → Question generation → UI rendering

## Design System

### Design Tokens (`src/theme/tokens.ts`)
```typescript
spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }
shadows: { card, cardHover, focus, button, modal }
accessibility: { focusRing, touchTarget, contrast }
transitions: { duration, easing }
```

### Styled Components (`src/components/styled/`)
- Use design tokens, not hard-coded values
- Prefer styled components over inline `sx` props
- Structure: `buttons/`, `cards/`, `layout/`

## Key Integration Points

### Direct Manipulation
```typescript
// Settings
const { settings, updateSettings } = useSettings();
updateSettings({ questionCount: 15 });

// Theme
const { themeConfig, setTheme } = useEnhancedTheme();
setTheme('ocean');

// Question Generation
const questions = questionGenerators['math'](settings);
```

### Extensibility
```typescript
// New game type
const newGenerator = (settings) => [...questions];
questionGenerators['newGame'] = newGenerator;

// New styled component
const NewComponent = styled(Button)(({ theme }) => ({
  padding: spacing.md,
  boxShadow: shadows.card,
}));
```

### Accessibility Standards
- All components need ARIA attributes
- Use accessibility tokens for focus/contrast
- Keyboard navigation required
- Screen reader compatibility

## Key Types
```typescript
interface GameQuestion {
  prompt: string;
  focus: string;
  options: string[];
  correctAnswer: string;
  type: GameType;
}

interface GlobalSettings {
  questionCount: number;
  optionsCount: number;
  numberRange: { min: number; max: number };
}
```

## Best Practices
- Use centralized utilities (`arrayUtils`, `constants`)
- Follow design token system
- Maintain type safety (no `any`/`unknown`)
- Test accessibility with screen readers
- Use proper algorithms (Fisher-Yates shuffle)

## Files to Know
- `src/utils/gameUtils.ts` - Question generation
- `src/hooks/useGame.ts` - Game orchestration
- `src/components/GameBoard.tsx` - UI engine
- `src/theme/tokens.ts` - Design system
- `src/components/styled/` - Styled components 