---
title: "Setup & Troubleshooting Guide"
description: "Complete environment setup and issue resolution guide"
version: "2.0.0"
last_updated: "2024-01-16"
category: "Setup Guide"
tags: ["Setup", "Environment", "Troubleshooting", "Configuration", "Issues"]
complexity: "All Levels"
audience: ["Developers", "DevOps", "QA Engineers"]
---

# 🚀 Setup & Troubleshooting Guide

Complete environment configuration and issue resolution for the family-oriented educational platform.

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd family-oriented
npm install
```

### 2. Environment Configuration
Create `.env.local` file in project root:

```bash
# Core Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Development Features
NEXT_PUBLIC_LOG_LEVEL=info
NEXT_PUBLIC_DEMO_SCENARIO=professional
NEXT_PUBLIC_DEBUG_MODE=true

# Optional: Deployment Configuration
BASE_PATH=""
```

### 3. Start Development
```bash
npm run dev           # Start Next.js development server
npm run lint          # Check code style
npm run build         # Validate production build
npm test              # Run test suite
```

---

## 📋 Environment Variables Reference

### 🔑 Required Variables

#### **Supabase Configuration**
```bash
# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Your Supabase anon/public key (safe for client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find these values:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy **Project URL** and **anon public** key

### 🛠️ Optional Development Variables

#### **Logging Configuration**
```bash
# Controls console logging level in development
# Options: error, warn, info, debug
NEXT_PUBLIC_LOG_LEVEL=info
```

#### **Demo Mode Configuration**
```bash
# Enables demo data for development without authentication
# Options: personal, professional, enterprise
NEXT_PUBLIC_DEMO_SCENARIO=professional
```

#### **Debug Features**
```bash
# Enables debug panels and additional logging
# Options: true, false
NEXT_PUBLIC_DEBUG_MODE=true
```

#### **Deployment Configuration**
```bash
# Base path for deployment (GitHub Pages, subdirectories)
BASE_PATH=""

# Automatically set in CI/CD environments
GITHUB_REPOSITORY=username/repository-name
```

---

## 🗂️ Environment Configuration Examples

### Development Setup (.env.local)
```bash
# Basic development configuration
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_LOG_LEVEL=debug
NEXT_PUBLIC_DEMO_SCENARIO=professional
NEXT_PUBLIC_DEBUG_MODE=true
```

### Production Setup
```bash
# Minimal production configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
NEXT_PUBLIC_LOG_LEVEL=error
```

### Demo/Preview Setup
```bash
# Demo environment without database
NEXT_PUBLIC_DEMO_SCENARIO=enterprise
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_LOG_LEVEL=info
```

---

## 🏗️ Local Development with Supabase

### Option 1: Cloud Supabase (Recommended)
1. Create free account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy environment variables from Settings → API
4. Run database migrations: `npm run db:migrate` (if available)

### Option 2: Local Supabase Stack
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase stack
supabase start

# Your local environment variables:
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Apply migrations
supabase db reset
```

**Local Supabase Services:**
- **API Gateway**: http://127.0.0.1:54321
- **Studio (Dashboard)**: http://127.0.0.1:54323
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Email Testing**: http://127.0.0.1:54324

---

## 🎯 Demo Mode Configuration

The app includes comprehensive demo modes for development and testing without requiring user authentication.

### Demo Scenarios

#### **Personal Tier Demo**
```bash
NEXT_PUBLIC_DEMO_SCENARIO=personal
```
- 5 avatars limit
- Basic analytics
- Personal plan features

#### **Professional Tier Demo**
```bash
NEXT_PUBLIC_DEMO_SCENARIO=professional
```
- 30 avatars limit
- Advanced analytics
- User management features
- Premium themes

#### **Enterprise Tier Demo**
```bash
NEXT_PUBLIC_DEMO_SCENARIO=enterprise
```
- Unlimited avatars
- All premium features
- Advanced reporting
- API access simulation

### Demo Features
- **Realistic Data**: Pre-populated games, analytics, user profiles
- **Role Simulation**: Account owner, admin, educator roles
- **Feature Testing**: All subscription tiers and feature gates
- **No Authentication**: Works without Supabase connection

---

## 🧪 Testing Setup

### Running Tests
```bash
npm test                               # Run Jest test suite
npm run test:watch                     # Watch mode for development
npm run test:coverage                  # Generate coverage report
npm run test:ci                        # CI/CD optimized run
```

### Test Environment
The testing environment is automatically configured with:
- **Mocked Supabase**: Local test environment
- **Mocked localStorage**: Consistent test storage
- **Enhanced Safety**: Timeout protection and cleanup
- **Modular Utilities**: Restructured test helper functions

### Test Utilities Structure
```bash
src/utils/__tests__/
├── index.ts                 # Barrel exports
├── test-constants.ts        # Timeouts and constants
├── test-factories.ts        # Mock data creation
├── test-helpers.ts          # Async utilities
├── react-test-utils.tsx     # React testing utilities
└── mock-services.ts         # Service mocks
```

---

## 🚨 Troubleshooting Guide

### Common Issues & Solutions

#### **Issue: Hydration Mismatch Errors**

**Symptoms**:
```
Error: Hydration failed because the initial UI does not match what was rendered on the server
```

**Root Cause**: Context providers initializing at different times causing server/client render mismatches.

**Solution**: Use hydration coordination pattern
```tsx
// Check if all contexts are ready before rendering
function useIsFullyHydrated() {
  const { isHydrated: themeHydrated } = useEnhancedTheme();
  const { loadingState } = useUser();
  
  return themeHydrated && loadingState.isReady;
}

// Apply to components with context dependencies
function NavigationBar() {
  const isFullyHydrated = useIsFullyHydrated();
  
  if (!isFullyHydrated) {
    return <LoadingSkeleton />; // Consistent skeleton
  }
  
  return <ActualNavigation />; // Render when stable
}
```

#### **Issue: Grid Component TypeScript Errors**

**Symptoms**:
```typescript
Property 'item' does not exist on type 'IntrinsicAttributes & GridBaseProps'
```

**Root Cause**: Material-UI Grid component compatibility issues with Next.js 15.2.4+ and TypeScript strict mode.

**Solution**: Replace all Grid usage with CSS Grid
```tsx
// ❌ PROBLEMATIC: Material-UI Grid
<Grid container spacing={3}>
  <Grid item xs={12} md={6}>
    <Card>Content</Card>
  </Grid>
</Grid>

// ✅ SOLUTION: CSS Grid with Box
<Box sx={{ 
  display: 'grid', 
  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
  gap: 3 
}}>
  <Card>Content</Card>
  <Card>Content</Card>
</Box>
```

#### **Issue: Test Import Errors**

**Symptoms**:
```typescript
Module not found: Can't resolve '@/utils/__tests__/test-utils'
```

**Root Cause**: Test utilities have been restructured from monolithic to modular structure.

**Solution**: Update imports to use new modular structure
```typescript
// ❌ OLD: Monolithic imports
import { renderWithProviders, TEST_TIMEOUTS } from '@/utils/__tests__/test-utils';

// ✅ NEW: Modular imports
import { TEST_TIMEOUTS, mockFactories } from '@/utils/__tests__';
import { renderWithProviders } from '@/utils/__tests__/react-test-utils';
```

#### **Issue: Context Type Errors**

**Symptoms**:
```typescript
Type 'UserContextType' is missing properties from type 'ExtendedUserContextType'
```

**Solution**: Use proper context types and provider hierarchy
```tsx
// Ensure correct context type usage
const { hasRole, canAccess, loadingState } = useUser(); // ExtendedUserContextType

// Verify provider order
<EnhancedThemeProvider>      // 1. Theme first
  <UserProvider>             // 2. User context
    <SettingsProvider>       // 3. Settings last
      {children}
    </SettingsProvider>
  </UserProvider>
</EnhancedThemeProvider>
```

#### **Issue: Environment Variables Not Loading**

**Symptoms**: Demo mode not working, Supabase connection failed

**Solution**: Verify environment variable setup
```bash
# Check file exists and has correct name
ls -la .env.local

# Verify variables are properly formatted (no spaces around =)
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here

# Restart development server after changes
npm run dev
```

#### **Issue: Build Failures in Production**

**Symptoms**: TypeScript compilation errors, missing dependencies

**Solution**: Run local build validation
```bash
# Test production build locally
npm run build

# Check for TypeScript errors
npm run type-check

# Verify no Grid component usage
grep -r "Grid container\|Grid item" src/
```

### Development Issues

#### **Issue: Infinite Re-render Loops**

**Symptoms**: Maximum update depth exceeded errors

**Solution**: Proper memoization of context values
```tsx
// ❌ PROBLEMATIC: New object every render
const contextValue = {
  user,
  settings: { theme: currentTheme, gameSettings }
};

// ✅ SOLUTION: Memoized context value
const contextValue = useMemo(() => ({
  user,
  settings,
  loadingState: {
    user: userLoading,
    roles: rolesLoading,
    avatars: avatarsLoading,
    isReady: !userLoading && !rolesLoading && !avatarsLoading
  }
}), [user, settings, userLoading, rolesLoading, avatarsLoading]);
```

#### **Issue: Missing Component Exports**

**Symptoms**: Export doesn't exist in target module

**Solution**: Add missing exports to index files
```tsx
// Add to src/shared/components/index.ts
export { default as UsageMeter, UsageOverview } from './gates/UsageMeter';
export { default as FeatureGate } from './gates/FeatureGate';
```

---

## 🔧 Development Tools & Scripts

### Available Scripts
```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server

# Code Quality
npm run lint                   # Run ESLint
npm run type-check             # TypeScript checking
npm run format                 # Format code with Prettier

# Testing
npm test                       # Run tests
npm run test:watch             # Run tests in watch mode
npm run test:coverage          # Generate coverage report

# Database (if using local Supabase)
npm run db:start               # Start local Supabase
npm run db:stop                # Stop local Supabase
npm run db:reset               # Reset local database
```

### VS Code Configuration

Recommended VS Code settings (`.vscode/settings.json`):
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### Browser Extensions
- **React Developer Tools**: Component debugging
- **Redux DevTools**: State management debugging (if used)
- **Accessibility Insights**: WCAG compliance testing

---

## 📊 Validation & Testing

### Environment Validation Checklist
- [ ] `.env.local` file exists and has correct variables
- [ ] Supabase connection working (check network tab)
- [ ] Demo mode functional (if using demo scenario)
- [ ] All games loading correctly
- [ ] Analytics dashboard operational
- [ ] User context loading properly without errors
- [ ] Theme system working (no hydration mismatches)
- [ ] Test suite passing completely

### Debug Mode Features
When `NEXT_PUBLIC_DEBUG_MODE=true`:
- Dashboard debug panel shows environment status
- Enhanced console logging for troubleshooting
- User context debugging information
- Theme hydration status indicators

### Performance Validation
```bash
# Check bundle size
npm run build
npm run analyze  # If bundle analyzer is configured

# Lighthouse testing
npx lighthouse http://localhost:3000 --view

# Load testing (development)
npx autocannon http://localhost:3000
```

---

## 🚀 Deployment

### Vercel Deployment
1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy automatically on push to main

### Other Platform Deployment
1. Build the application: `npm run build`
2. Set environment variables in platform settings
3. Deploy the `.next` directory and `public` folder
4. Configure runtime environment for Node.js

### Environment Variables for Production
```bash
# Required for production
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key

# Optional for production
NEXT_PUBLIC_LOG_LEVEL=error
BASE_PATH=""  # If deploying to subdirectory
```

---

## 📚 Additional Resources

### Framework Documentation
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 18 Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### Supabase Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Integration Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Database Migrations](https://supabase.com/docs/guides/database/migrations)

### Testing Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**🔧 Need Help?** Check [`AGENTS.md`](./AGENTS.md) for development patterns or [`tasks.md`](./tasks.md) for project status and roadmap. 