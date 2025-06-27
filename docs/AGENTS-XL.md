---
title: "Agent Context - Deep Architectural Reference"
description: "Comprehensive architectural reference for AI agents working on complex tasks"
version: "2.0.0"
last_updated: "2024-01-17"
category: "AI Reference"
tags: ["AI", "Agents", "Architecture", "Constraints", "Development", "Deep Reference"]
complexity: "Advanced"
audience: ["AI Models", "Coding Assistants", "Automated Tools"]
---

# 🤖 Agent Context - Deep Architectural Reference

**Comprehensive reference for AI agents working on complex architectural tasks for the family-oriented educational platform.**

## 🚀 Critical System Context (Required Reading)

### Architecture Stack
- **Next.js 15.2.4+** with App Router, TypeScript strict mode
- **React 18+** with context provider hierarchy 
- **Supabase** authentication + database + real-time
- **Material-UI 5+** with **CRITICAL CONSTRAINT**: NO Grid components
- **Enterprise Game Discovery**: Flat registry with metadata engine

### Version Constraints & Breaking Changes
- **Grid Component**: Material-UI Grid causes TypeScript build errors in Next.js 15.2.4+
- **Solution**: Use CSS Grid with Box component exclusively
- **Context Order**: Theme → User → Settings (hydration critical)
- **Testing**: Restructured modular utilities (no monolithic test-utils)

## 📁 Core File Locations

### Critical Files - AI Must Know These
```typescript
// GAME SYSTEM
src/utils/gameData.ts              // Core game registry & discovery engine
src/utils/gameUtils.ts             // Question generation logic  
src/utils/analyticsService.ts      // Learning progress analytics

// USER & SUBSCRIPTION SYSTEM  
src/context/UserContext.tsx        // User state & role management
src/utils/subscriptionService.ts   // Tier management & feature gating
src/hooks/useSubscription.tsx       // Subscription hooks & utilities

// AUTHENTICATION SYSTEM
src/features/account/hooks/useAuth.ts                // Authentication operations
src/features/account/hooks/useRegistration.ts        // Complete registration flow
src/features/account/utils/authErrors.ts             // Centralized error handling
src/features/account/components/auth/                // Authentication UI components

// THEME & UI SYSTEM
src/theme/EnhancedThemeProvider.tsx // Theme + hydration coordination
src/shared/components/index.ts      // UI component exports
src/app/layout.tsx                  // Root layout with provider hierarchy

// TESTING INFRASTRUCTURE
src/utils/__tests__/               // Modular test utilities
jest.config.js                     // Consolidated Jest configuration
jest.setup.ts                      // Test environment setup
```

### Key Game Files
```typescript
src/app/games/page.tsx             // Game discovery browser
src/features/games/GameContainer.tsx // Game wrapper component
src/features/games/discovery/      // Game discovery components
src/app/dashboard/page.tsx         // Analytics dashboard
```

### Key Authentication Files
```typescript
src/app/(auth)/login/page.tsx      // Login page
src/app/(auth)/signup/page.tsx     // Registration page  
src/app/(auth)/verify-email/page.tsx // Email verification
src/components/auth/LoginForm.tsx  // Login form component
src/components/auth/RegistrationForm.tsx // Registration form
src/components/auth/TierSelectionStep.tsx // Subscription tier selection
```

## 🏗️ Context Provider Pattern (CRITICAL)

### Required Provider Order
```tsx
// REQUIRED ORDER - Do Not Change (prevents hydration issues)
<EnhancedThemeProvider>      // 1. Theme first - no dependencies
  <UserProvider>             // 2. User context  
    <SettingsProvider>       // 3. Settings last
      {children}
    </SettingsProvider>
  </UserProvider>
</EnhancedThemeProvider>
```

### Hydration Protection Pattern
```tsx
// Use this pattern for components with context dependencies
function useIsFullyHydrated() {
  const { isHydrated: themeHydrated } = useEnhancedTheme();
  const { loadingState } = useUser();
  return themeHydrated && loadingState.isReady;
}

// Apply to components
function ComponentWithContext() {
  const isFullyHydrated = useIsFullyHydrated();
  
  if (!isFullyHydrated) {
    return <LoadingSkeleton />; // Consistent skeleton
  }
  
  return <ActualComponent />; // Render when stable
}
```

## 🚫 Grid Migration Patterns (CRITICAL)

### Forbidden vs Required Patterns
```tsx
// ❌ FORBIDDEN: Material-UI Grid (causes TypeScript build errors)
<Grid container spacing={3}>
  <Grid item xs={12} md={6}>
    <Card>Content</Card>
  </Grid>
</Grid>

// ✅ REQUIRED: CSS Grid with Box
<Box sx={{ 
  display: 'grid', 
  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
  gap: 3 
}}>
  <Card>Content</Card>
  <Card>Content</Card>  
</Box>
```

### Common Grid Migration Patterns
```tsx
// Dashboard/Cards Layout
<Box sx={{
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, 1fr)',
    md: 'repeat(3, 1fr)'
  },
  gap: 3
}}>

// Two-Column Layout  
<Box sx={{
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
  gap: 2
}}>

// Form Layout
<Box sx={{
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: 2,
  maxWidth: 600
}}>
```

## 🧪 Testing Infrastructure

### Test Configuration
- **Jest Config**: `jest.config.js` (consolidated, no separate tsconfig.jest.json)
- **Setup**: `jest.setup.ts` with enhanced safety measures
- **Coverage**: 80% minimum, 95% for critical paths

### Modular Test Utilities
```typescript
// Core imports
import { TEST_TIMEOUTS, MOCK_IDS, mockFactories } from '@/utils/__tests__';
import { asyncUtils } from '@/utils/__tests__/test-helpers';
import { renderWithProviders } from '@/utils/__tests__/react-test-utils';
import { mockServices } from '@/utils/__tests__/mock-services';

// Available modules:
// test-constants.ts - Timeouts and constants
// test-factories.ts - Mock data creation
// test-helpers.ts - Async utilities (TypeScript only)
// react-test-utils.tsx - React testing utilities with JSX
// mock-services.ts - Pre-configured service mocks
// index.ts - Barrel exports
```

### Test Patterns
```typescript
// Component Testing
describe('Component', () => {
  it('should render correctly', () => {
    const { getByTestId } = renderWithProviders(
      <Component />,
      { userContextValue: { user: mockFactories.createMockUser() } }
    );
    expect(getByTestId('component')).toBeInTheDocument();
  });
});

// Async Testing with Timeout Protection
it('should complete operation safely', async () => {
  await asyncUtils.withTimeout(
    riskyOperation(),
    TEST_TIMEOUTS.MEDIUM
  );
}, TEST_TIMEOUTS.SLOW);
```

## 🎮 Game System Architecture

### Game Registry Structure
```typescript
// Core game array - flat structure (not nested)
interface Game {
  id: string;
  title: string;
  href: string;
  subject: 'Mathematics' | 'Language Arts' | 'Visual Arts' | 'Social Studies';
  tags: string[];
  ageRange: [number, number];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  learningObjectives: string[];
  prerequisites?: string[];
  hasAudio: boolean;
  isInteractive: boolean;
  status: 'active' | 'coming_soon' | 'deprecated';
}
```

### Discovery Engine Usage
```typescript
// Search and filtering
const games = gameDiscovery.search('math counting', {
  subjects: ['Mathematics'],
  ageRange: [3, 6],
  skillLevels: ['beginner']
});

// Get by subject
const mathGames = gameDiscovery.getGamesBySubject('Mathematics');

// Featured games  
const featured = gameDiscovery.getFeaturedGames();
```

## 💳 Subscription System

### Tier Structure
```typescript
type SubscriptionTier = 'personal' | 'professional' | 'enterprise';

// Feature gating pattern
const canAccess = useSubscription((state) => state.canAccessFeature('analytics'));
const avatarLimit = useSubscription((state) => state.getTierLimit('avatar_limit'));

// Tier checking
const { hasRole, canAccess, getTierLimit } = useUser();
```

### Demo Mode Configuration
```bash
# Environment variables for demo modes
NEXT_PUBLIC_DEMO_SCENARIO=personal      # 5 avatars, basic features
NEXT_PUBLIC_DEMO_SCENARIO=professional  # 30 avatars, advanced features  
NEXT_PUBLIC_DEMO_SCENARIO=enterprise    # Unlimited, all features
```

## 🚀 Quick Development Patterns

### Adding New Game (Complete Pattern)
```typescript
// 1. Add to GAMES array in gameData.ts
{
  id: 'new-game',
  title: 'New Game',
  href: '/games/new-game',
  subject: 'Mathematics',
  tags: ['counting', 'beginner'],
  ageRange: [4, 7],
  skillLevel: 'beginner',
  learningObjectives: ['Count 1-10', 'Number recognition'],
  hasAudio: true,
  isInteractive: true,
  status: 'active'
}

// 2. Create generator in gameUtils.ts
export function generateNewGameQuestions(count: number, settings: GameSettings): Question[] {
  // Implementation using Fisher-Yates shuffle
}

// 3. Add page in src/app/games/new-game/page.tsx
export default function NewGamePage() {
  return <GameContainer gameId="new-game" />;
}
```

### Environment Setup
```bash
# Required variables
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here

# Optional development
NEXT_PUBLIC_DEMO_SCENARIO=professional
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_LOG_LEVEL=info
```

### Component Development Standards
```tsx
// Use design tokens and accessibility
import { styled } from '@mui/material/styles';
import { useTheme } from '@/theme/EnhancedThemeProvider';

const StyledComponent = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  // Always include ARIA attributes
  '&:focus': {
    outline: `2px solid ${theme.palette.primary.main}`,
  }
}));

// Component with proper TypeScript and accessibility
interface ComponentProps {
  gameId: string;
  onComplete: (score: number) => void;
}

export function Component({ gameId, onComplete }: ComponentProps) {
  return (
    <StyledComponent 
      role="main"
      aria-label={`Game: ${gameId}`}
      tabIndex={0}
    >
      {/* Content */}
    </StyledComponent>
  );
}
```

## ⚠️ Critical Constraints & Gotchas

### Build-Breaking Issues
1. **Material-UI Grid**: Causes TypeScript errors - use CSS Grid with Box
2. **Context Order**: Wrong provider order causes hydration mismatches
3. **Test Imports**: Old monolithic test-utils imports will fail
4. **Type Safety**: No `any` types allowed - use proper interfaces

### Performance Requirements
- **Hydration**: All context-dependent components must use hydration guards
- **Algorithms**: Use Fisher-Yates shuffle, efficient data structures
- **Testing**: All async operations need timeout protection
- **Accessibility**: WCAG 2.1 AA compliance required

### Database Constraints
- **RLS**: Row Level Security enabled - queries filtered by user/org
- **Real-time**: Supabase subscriptions for live updates
- **Migrations**: Use Supabase migration system for schema changes

## 📋 Quick Action Checklists

### Adding Features Checklist
- [ ] Use CSS Grid with Box (never Material-UI Grid)
- [ ] Follow context provider hierarchy (Theme→User→Settings)
- [ ] Use proper TypeScript types (no `any`)
- [ ] Add to subscription service if tier-gated
- [ ] Update game registry if game-related
- [ ] Use restructured test utilities (`@/utils/__tests__/`)
- [ ] Ensure accessibility compliance (ARIA, keyboard navigation)
- [ ] Add hydration guards for context-dependent components

### Debugging Issues Checklist
- [ ] Check context provider order (Theme→User→Settings)
- [ ] Verify hydration coordination with `useIsFullyHydrated()`
- [ ] Confirm no Material-UI Grid usage causing build errors
- [ ] Check test imports use modular structure (not old test-utils)
- [ ] Verify proper environment variables are set
- [ ] Validate RLS policies for database access issues
- [ ] Check subscription tier permissions for feature access

### Code Review Checklist
- [ ] TypeScript strict mode compliance (no `any`)
- [ ] Accessibility attributes and keyboard navigation
- [ ] Proper error handling and loading states
- [ ] Subscription service integration for tier-gated features
- [ ] Game discovery metadata completeness
- [ ] Test coverage using restructured utilities
- [ ] Build success (Grid migration complete)

## 🔧 Common Patterns & Solutions

### Error Handling Pattern
```typescript
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  logger.error('Operation failed:', error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'Unknown error' 
  };
}
```

### Loading State Pattern
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleOperation = async () => {
  setLoading(true);
  setError(null);
  
  try {
    await operation();
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Operation failed');
  } finally {
    setLoading(false);
  }
};
```

### Subscription-Gated Component Pattern
```typescript
function PremiumFeature() {
  const { canAccess } = useUser();
  
  if (!canAccess('premium_feature')) {
    return <FeatureGate feature="premium_feature" />;
  }
  
  return <PremiumContent />;
}
```

## 📚 Related Documentation

- **Complete Setup**: [`../docs/setup.md`](../docs/setup.md) - Environment configuration and troubleshooting
- **Project Tracking**: [`../docs/tasks.md`](../docs/tasks.md) - Development roadmap and progress
- **Business Logic**: [`../docs/subscription-tier-analysis.md`](../docs/subscription-tier-analysis.md) - Subscription feature analysis
- **Navigation Hub**: [`../docs/README.md`](../docs/README.md) - Documentation overview and quick start

---

**🤖 For AI/Agent Use**: This document contains deep architectural knowledge for complex development tasks. For quick context, start with `docs/AGENTS.md` first. 