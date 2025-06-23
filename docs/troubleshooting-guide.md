---
title: "Troubleshooting Guide - Context & Build Issues"
description: "Comprehensive troubleshooting guide for common context management and build issues"
version: "1.0.0"
last_updated: "2024-01-16"
category: "Troubleshooting"
tags: ["Troubleshooting", "Context", "Hydration", "Build Errors", "Material-UI", "Grid"]
complexity: "Intermediate"
audience: ["Developers", "DevOps", "QA Engineers"]
---

# Troubleshooting Guide - Context & Build Issues

## 🚨 Critical Issues & Solutions

This guide documents real issues encountered during development and their proven solutions.

---

## 🔄 Hydration Issues

### **Issue: Hydration Mismatch Errors**

**Symptoms**:
```
Error: Hydration failed because the initial UI does not match what was rendered on the server
finishRenderingHooks@http://localhost:3000/_next/static/chunks/...
```

**Root Cause**: Multiple contexts initializing at different times, causing server/client render mismatches.

**Solution**: Consolidated hydration coordination

```tsx
// ✅ SOLUTION: Wait for all contexts before rendering
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

**Files Modified**:
- `src/app/page.tsx` - Added consolidated hydration check
- `src/context/UserContext.tsx` - Added `isInitialized` flag
- `src/app/dashboard/page.tsx` - Added hydration guards

---

## 🏗️ Build Errors

### **Issue: Grid Component TypeScript Errors**

**Symptoms**:
```typescript
Property 'item' does not exist on type 'IntrinsicAttributes & GridBaseProps'
```

**Root Cause**: Material-UI Grid component compatibility issues with Next.js 15.2.4+ and TypeScript strict mode.

**Solution**: Replace Grid with CSS Grid using Box

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

**Files Fixed**:
- `src/app/collections/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/settings/page.tsx`
- `src/features/subscription/components/PlanComparison.tsx`

### **Issue: Missing Component Exports**

**Symptoms**:
```typescript
Export 'UsageOverview' doesn't exist in target module
```

**Root Cause**: Components exported from files but not re-exported through index files.

**Solution**: Add missing exports to index files

```tsx
// ✅ SOLUTION: Add to src/shared/components/index.ts
export { default as UsageMeter, UsageOverview } from './gates/UsageMeter';
export { default as FeatureGate, FeatureAvailabilityChip } from './gates/FeatureGate';
```

**Files Fixed**:
- `src/shared/components/index.ts` - Added missing exports

### **Issue: Component Prop Interface Mismatches**

**Symptoms**:
```typescript
Property 'startIcon' does not exist on type 'TierTransitionButtonProps'
```

**Root Cause**: Components using props not defined in their interfaces.

**Solution**: Remove invalid props or update component interfaces

```tsx
// ❌ PROBLEMATIC: Invalid prop
<TierTransitionButton 
  targetTier="professional"
  startIcon={<Upgrade />}  // Not in interface
/>

// ✅ SOLUTION: Remove invalid prop
<TierTransitionButton 
  targetTier="professional"
/>
```

**Files Fixed**:
- `src/shared/components/gates/FeatureGate.tsx`
- `src/shared/components/gates/SubscriptionBadge.tsx`
- `src/shared/components/gates/UsageMeter.tsx`

### **Issue: Context Type Inconsistencies**

**Symptoms**:
```typescript
Type 'UserContextType' is missing properties from type 'ExtendedUserContextType'
```

**Root Cause**: Context interface mismatch between definition and usage.

**Solution**: Update context type definitions

```tsx
// ✅ SOLUTION: Use extended type for context
const UserContext = createContext<ExtendedUserContextType | undefined>(undefined);
```

**Files Fixed**:
- `src/context/UserContext.tsx` - Updated context type definition

---

## 🔧 Development Issues

### **Issue: Infinite Re-render Loops**

**Symptoms**:
```
Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside useEffect
```

**Root Cause**: Context values creating new objects on every render.

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

### **Issue: Missing Hook Dependencies**

**Symptoms**: Stale closures, unexpected behavior in effects

**Solution**: Add missing dependencies and use proper cleanup

```tsx
// ✅ SOLUTION: Complete dependency arrays
const canCreateAvatar = useCallback((): FeatureGateResult => {
  // ... logic
}, [subscriptionPlan, currentUsage, isLoaded, tier]); // All dependencies included
```

---

## 🐛 Debugging Tools

### **Hydration Debug Panel**

Use the development debug panel to monitor hydration status:

```tsx
// Located in src/app/page.tsx (development only)
function HydrationStatusDebug() {
  // Shows real-time hydration status
  // Position: bottom-left corner
  // Only visible in development mode
}
```

**How to Use**:
1. Open application in development mode
2. Look for debug panel in bottom-left corner
3. Verify all contexts show ✅ before testing
4. If any show ⏳, investigate that context's loading logic

### **Context Loading States**

Monitor context loading in browser DevTools:

```tsx
// Add to components for debugging
console.log('Context states:', {
  themeHydrated,
  userReady: loadingState.isReady,
  userLoading: loadingState.user,
  rolesLoading: loadingState.roles
});
```

---

## 📋 Prevention Checklist

### **Before Adding New Context Providers**:
- [ ] Define clear loading states
- [ ] Implement proper memoization
- [ ] Add to hydration coordination
- [ ] Test SSR compatibility
- [ ] Document provider order requirements

### **Before Using Material-UI Grid**:
- [ ] Consider CSS Grid alternative first
- [ ] Test build compilation
- [ ] Verify responsive behavior
- [ ] Check TypeScript strict mode compatibility

### **Before Creating New Components**:
- [ ] Define complete prop interfaces
- [ ] Add to appropriate index exports
- [ ] Test with context dependencies
- [ ] Verify TypeScript compilation

### **Before Production Deployment**:
- [ ] Run full TypeScript build
- [ ] Test hydration across all pages
- [ ] Verify responsive layouts
- [ ] Check context provider order
- [ ] Test loading states and error boundaries

---

## 🚀 Quick Fixes Reference

### **Common Command Fixes**:

```bash
# Build test (should complete without errors)
npm run build

# Type checking only
npx tsc --noEmit

# Clear Next.js cache if hydration issues persist
rm -rf .next
npm run dev
```

### **Quick Grid Migration**:

Find and replace pattern:
```bash
# Search for: <Grid container spacing={3}>
# Replace with: <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>

# Search for: <Grid item xs={12} md={6}>
# Replace with: (remove - use direct children)

# Search for: </Grid>
# Replace with: </Box>
```

---

## 📞 When to Escalate

**Escalate to Senior Developer if**:
- Multiple hydration errors after following this guide
- Context provider order changes affect other features
- Performance impacts from context re-renders
- Grid migration affects responsive design significantly

**Escalate to DevOps if**:
- Build pipeline fails after Grid migrations
- TypeScript compilation errors in CI/CD
- Deployment hydration issues not reproducible locally 