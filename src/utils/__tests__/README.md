# Test Utilities

## Overview

This directory contains restructured testing utilities organized into focused, single-purpose modules. This architecture solves JSX/TypeScript syntax conflicts and provides better maintainability.

## Structure

```
src/utils/__tests__/
├── index.ts                 # Barrel exports for easy importing
├── test-constants.ts        # Shared constants and timeouts
├── test-factories.ts        # Mock data creation functions
├── test-helpers.ts          # Async utilities (TypeScript only)
├── react-test-utils.tsx     # React-specific utilities with JSX
├── mock-services.ts         # Pre-configured service mocks
└── README.md               # This documentation
```

## Usage Examples

### Basic Imports

```typescript
// Import core utilities (most common)
import { TEST_TIMEOUTS, MOCK_IDS, mockFactories } from '@/utils/__tests__';

// Import specialized utilities as needed
import { asyncUtils } from '@/utils/__tests__/test-helpers';
import { renderWithProviders } from '@/utils/__tests__/react-test-utils';
import { mockServices } from '@/utils/__tests__/mock-services';
```

### Constants & Timeouts

```typescript
import { TEST_TIMEOUTS, MOCK_IDS } from '@/utils/__tests__';

describe('Component Tests', () => {
  it('should complete operation within timeout', async () => {
    // Use standardized timeouts for consistency
    await operation();
  }, TEST_TIMEOUTS.MEDIUM);

  it('should use consistent mock IDs', () => {
    const mockData = { userId: MOCK_IDS.USER, avatarId: MOCK_IDS.AVATAR };
    expect(mockData.userId).toBe('test-user-id');
  });
});
```

### Mock Data Creation

```typescript
import { mockFactories } from '@/utils/__tests__';

describe('User Tests', () => {
  it('should create consistent mock users', () => {
    // Create standard mock user
    const user = mockFactories.createMockUser();
    expect(user.id).toBe('test-user-id');
    expect(user.email).toBe('test@example.com');

    // Create with overrides
    const customUser = mockFactories.createMockUser({ 
      email: 'custom@test.com',
      name: 'Custom User'
    });
    expect(customUser.email).toBe('custom@test.com');
  });

  it('should create mock avatars', () => {
    const avatar = mockFactories.createMockAvatar({
      name: 'Test Avatar'
    });
    expect(avatar.name).toBe('Test Avatar');
    expect(avatar.id).toBe('00000000-0000-0000-0000-000000000001');
  });
});
```

### Async Utilities

```typescript
import { asyncUtils, TEST_TIMEOUTS } from '@/utils/__tests__';

describe('Async Operations', () => {
  it('should protect against hanging promises', async () => {
    const riskyOperation = () => new Promise(resolve => {
      // This could hang indefinitely
      setTimeout(resolve, 10000);
    });

    // Wrap with timeout protection
    await expect(
      asyncUtils.withTimeout(riskyOperation(), TEST_TIMEOUTS.FAST)
    ).rejects.toThrow('Operation timed out');
  });

  it('should wait for conditions safely', async () => {
    let conditionMet = false;
    setTimeout(() => { conditionMet = true; }, 500);

    await asyncUtils.waitForCondition(
      () => conditionMet,
      TEST_TIMEOUTS.MEDIUM
    );

    expect(conditionMet).toBe(true);
  });

  it('should handle controlled promises', async () => {
    const { promise, resolve, reject } = asyncUtils.createControlledPromise<string>();

    // Resolve after test setup
    setTimeout(() => resolve('test-value'), 100);

    const result = await promise;
    expect(result).toBe('test-value');
  });
});
```

### React Component Testing

```typescript
import { renderWithProviders } from '@/utils/__tests__/react-test-utils';
import { mockFactories } from '@/utils/__tests__';

describe('Component with Context', () => {
  it('should render with providers', () => {
    const mockUser = mockFactories.createMockUser();
    
    const { getByTestId } = renderWithProviders(
      <MyComponent />,
      {
        userContextValue: { user: mockUser },
        settingsContextValue: { theme: 'dark' }
      }
    );

    expect(getByTestId('my-component')).toBeInTheDocument();
  });

  it('should render without providers when needed', () => {
    const { getByTestId } = renderWithProviders(
      <SimpleComponent />,
      { includeProviders: false }
    );

    expect(getByTestId('simple-component')).toBeInTheDocument();
  });
});
```

### Service Mocking

```typescript
import { mockServices } from '@/utils/__tests__/mock-services';

describe('Service Integration', () => {
  it('should use pre-configured service mocks', () => {
    const analyticsMock = mockServices.createAnalyticsServiceMock();
    
    expect(analyticsMock.startGameSession).toBeDefined();
    expect(analyticsMock.trackEvent).toBeDefined();
    expect(analyticsMock.completeGameSession).toBeDefined();
  });

  it('should use Supabase mocks', () => {
    const supabaseMock = mockServices.createSupabaseMock();
    
    expect(supabaseMock.from).toBeDefined();
    expect(supabaseMock.auth).toBeDefined();
  });
});
```

## Available Exports

### `test-constants.ts`
- `TEST_TIMEOUTS` - Standardized timeout values for different operation types
- `MOCK_IDS` - Consistent mock IDs used across tests

### `test-factories.ts`
- `mockFactories.createMockUser(overrides?)` - Creates mock user data
- `mockFactories.createMockAvatar(overrides?)` - Creates mock avatar data
- `mockFactories.createMockProgress(overrides?)` - Creates mock progress data
- `mockFactories.createMockMetrics(overrides?)` - Creates mock analytics metrics

### `test-helpers.ts`
- `asyncUtils.withTimeout(promise, timeout, errorMessage?)` - Timeout protection for promises
- `asyncUtils.waitForCondition(condition, timeout, interval?)` - Wait for condition with timeout
- `asyncUtils.createControlledPromise<T>()` - Create controllable promise for testing
- `asyncUtils.delay(ms)` - Simple delay utility

### `react-test-utils.tsx`
- `renderWithProviders(ui, options?)` - Render React components with context providers

### `mock-services.ts`
- `mockServices.createAnalyticsServiceMock()` - Pre-configured analytics service mock
- `mockServices.createSupabaseMock()` - Pre-configured Supabase client mock

## Migration from Old Test Utils

### Before (Problematic)
```typescript
// This caused JSX/TypeScript conflicts
import { renderWithProviders, TEST_TIMEOUTS } from '@/utils/__tests__/test-utils';
```

### After (Current)
```typescript
// Import from focused modules
import { TEST_TIMEOUTS, mockFactories } from '@/utils/__tests__';
import { renderWithProviders } from '@/utils/__tests__/react-test-utils';
```

## Benefits

1. **Type Safety** - No more JSX/TypeScript syntax conflicts
2. **Build Success** - All linting and compilation passes  
3. **Single Responsibility** - Each file has one clear purpose
4. **Import Flexibility** - Use only what you need
5. **Maintainability** - Easy to find and update specific utilities
6. **Performance** - Smaller bundles when importing specific utilities

## Contributing

When adding new test utilities:

1. **Determine the correct module** based on purpose:
   - Constants/IDs → `test-constants.ts`
   - Mock data creation → `test-factories.ts`
   - Async operations → `test-helpers.ts`
   - React/JSX utilities → `react-test-utils.tsx`
   - Service mocks → `mock-services.ts`

2. **Export from the appropriate module** and add to `index.ts` if it's a core utility

3. **Update this README** with usage examples

4. **Add TypeScript types** for better developer experience

## Testing Standards

All utilities in this directory follow the established testing standards:

- **Timeout Protection** - All async operations have timeout safety
- **Consistent Mocking** - Standardized mock data structures
- **Type Safety** - Proper TypeScript types throughout
- **Error Handling** - Graceful failure and cleanup patterns

For complete testing guidelines, see [`docs/testing-standards.md`](../../../docs/testing-standards.md). 