# Testing Standards & Best Practices

## Overview

This document establishes testing standards for the family-oriented application to ensure consistent, reliable, and maintainable test suites across all components, hooks, and utilities.

## 🎯 Core Principles

### 1. **Safety First**
- All async operations must have timeout protection
- Tests should never hang indefinitely
- Error conditions must be explicitly tested
- Resource cleanup is mandatory

### 2. **Consistency**
- Standardized mock patterns across all tests
- Uniform timeout configurations
- Consistent test structure and naming
- Shared utilities for common operations

### 3. **Reliability**
- Tests should be deterministic and reproducible
- No flaky tests due to timing issues
- Proper test isolation to prevent interference
- Comprehensive error boundary testing

### 4. **Performance**
- Tests should complete within reasonable timeframes
- Performance regression detection
- Memory leak prevention
- Efficient resource usage

## 📚 Test Categories & Timeouts

```typescript
const TEST_TIMEOUTS = {
  IMMEDIATE: 0,      // Synchronous operations
  FAST: 1000,        // Simple async operations
  MEDIUM: 3000,      // Complex async operations
  SLOW: 6000,        // Database/API operations
  INTEGRATION: 10000, // Integration tests
  CRITICAL: 15000    // Critical path tests
} as const;
```

## 🏗️ Test Structure Standards

### File Organization
```
src/
  component/
    __tests__/
      Component.test.tsx          # Main component tests
      Component.integration.test.tsx  # Integration tests
      Component.performance.test.tsx  # Performance tests
```

### Test Naming Convention
```typescript
describe('ComponentName', () => {
  describe('Core Functionality', () => {
    it('should handle standard use case', () => {});
    it('should validate input parameters', () => {});
  });
  
  describe('Error Handling', () => {
    it('should handle API failures gracefully', () => {});
    it('should recover from network errors', () => {});
  });
  
  describe('Performance & Edge Cases', () => {
    it('should complete operations within time limits', () => {});
    it('should handle rapid successive calls', () => {});
  });
});
```

## 🔧 Mock Standards

### Service Mocks
```typescript
// ✅ Good: Comprehensive service mock
const mockAnalyticsService = {
  startGameSession: jest.fn().mockResolvedValue('session-id'),
  trackEvent: jest.fn().mockResolvedValue(undefined),
  completeGameSession: jest.fn().mockResolvedValue(undefined),
  // Include all service methods for completeness
};

// ❌ Bad: Incomplete mock
const mockAnalytics = {
  startSession: jest.fn() // Missing other methods
};
```

### React Component Mocks
```typescript
// ✅ Good: Explicit mock with testid
jest.mock('@/components/Chart', () => {
  return function MockChart(props: any) {
    return <div data-testid="mock-chart" {...props} />;
  };
});

// ❌ Bad: Generic mock without identification
jest.mock('@/components/Chart', () => () => <div />);
```

## ⚡ Async/Await Best Practices

### Timeout Protection
```typescript
// ✅ Good: Protected async operation
it('should handle async operation safely', async () => {
  const result = await Promise.race([
    asyncOperation(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Operation timeout')), TEST_TIMEOUTS.MEDIUM)
    )
  ]);
  
  expect(result).toBeDefined();
}, TEST_TIMEOUTS.SLOW);

// ❌ Bad: Unprotected async operation
it('should handle async operation', async () => {
  const result = await asyncOperation(); // Could hang forever
  expect(result).toBeDefined();
});
```

### Error Handling
```typescript
// ✅ Good: Explicit error testing
it('should handle service failures gracefully', async () => {
  const testError = new Error('Service unavailable');
  mockService.getData.mockRejectedValue(testError);
  
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
  await act(async () => {
    await component.loadData();
  });
  
  expect(component.hasError).toBe(true);
  expect(component.errorMessage).toContain('Service unavailable');
  
  consoleSpy.mockRestore();
});
```

## 🧪 Component Testing Patterns

### React Components
```typescript
import { renderWithProviders, mockFactories, TEST_TIMEOUTS } from '@/utils/__tests__/test-utils';

describe('GameComponent', () => {
  const defaultProps = {
    gameId: 'numbers',
    avatarId: mockFactories.createMockAvatar().id,
    onComplete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render game interface correctly', () => {
    const { getByTestId, getByText } = renderWithProviders(
      <GameComponent {...defaultProps} />
    );
    
    expect(getByText('Start Game')).toBeInTheDocument();
    expect(getByTestId('game-board')).toBeVisible();
  });
});
```

### Custom Hooks
```typescript
import { renderHook, act, waitFor } from '@testing-library/react';

describe('useCustomHook', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestProvider>{children}</TestProvider>
  );

  it('should manage state correctly', async () => {
    const { result } = renderHook(() => useCustomHook(), { wrapper });
    
    await act(async () => {
      await result.current.performAction();
    });
    
    await waitFor(() => {
      expect(result.current.isComplete).toBe(true);
    }, { timeout: TEST_TIMEOUTS.FAST });
  });
});
```

## 🛡️ Safety Measures

### Memory Leak Prevention
```typescript
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset localStorage
  localStorage.clear();
  
  // Clear pending timers
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  
  // Clear fetch mocks
  if (global.fetch && jest.isMockFunction(global.fetch)) {
    (global.fetch as jest.Mock).mockClear();
  }
});
```

### Resource Cleanup
```typescript
afterAll(() => {
  // Cleanup any persistent resources
  server.close();
  cleanup();
});
```

## 📊 Performance Testing

### Execution Time Validation
```typescript
it('should complete operation within performance budget', async () => {
  const startTime = performance.now();
  
  await act(async () => {
    await component.performHeavyOperation();
  });
  
  const executionTime = performance.now() - startTime;
  expect(executionTime).toBeLessThan(1000); // Max 1 second
});
```

### Stress Testing
```typescript
it('should handle multiple concurrent operations', async () => {
  const operations = Array.from({ length: 10 }, () => 
    component.performOperation()
  );
  
  await act(async () => {
    await Promise.all(operations);
  });
  
  expect(component.errorCount).toBe(0);
});
```

## 🔍 Error Simulation

### Controlled Failures
```typescript
const createFailingMock = (successfulCalls: number, error: Error) => {
  let callCount = 0;
  return jest.fn(() => {
    callCount++;
    if (callCount > successfulCalls) {
      throw error;
    }
    return 'success';
  });
};
```

### Network Simulation
```typescript
beforeEach(() => {
  global.fetch = jest.fn(() => {
    if (shouldSimulateNetworkError) {
      return Promise.reject(new Error('Network error'));
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockData)
    });
  });
});
```

## 📋 Test Checklist

### Before Writing Tests
- [ ] Identify all async operations
- [ ] Determine appropriate timeout categories
- [ ] Plan error scenarios to test
- [ ] Design mock data structures
- [ ] Consider performance requirements

### During Test Development
- [ ] Use consistent naming conventions
- [ ] Include timeout protection for async operations
- [ ] Test both success and failure paths
- [ ] Validate input parameters
- [ ] Mock external dependencies properly

### Before Committing
- [ ] All tests pass consistently
- [ ] No flaky or intermittent failures
- [ ] Performance requirements met
- [ ] Error handling tested
- [ ] Resource cleanup verified
- [ ] Code coverage meets thresholds

## 🚀 Integration Testing

### API Integration
```typescript
describe('API Integration', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('should handle full user workflow', async () => {
    // Test complete user journey
    await createUser();
    await loginUser();
    await performGameSession();
    await logoutUser();
  }, TEST_TIMEOUTS.INTEGRATION);
});
```

## 📈 Coverage Requirements

- **Minimum Coverage**: 80% across all metrics
- **Critical Paths**: 95% coverage required
- **Error Handling**: 100% of error paths tested
- **Performance**: All async operations have timeout tests

## 🔧 Tools & Utilities

### Custom Matchers
```typescript
expect.extend({
  toCompleteWithin(received: Promise<any>, timeMs: number) {
    // Custom matcher for performance testing
  }
});
```

### Test Data Builders
```typescript
const buildMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  ...overrides
});
```

## 📝 Common Patterns

### Loading States
```typescript
it('should show loading state during async operations', async () => {
  let resolvePromise: () => void;
  const loadingPromise = new Promise<void>(resolve => {
    resolvePromise = resolve;
  });
  
  mockService.getData.mockReturnValue(loadingPromise);
  
  const { getByTestId } = render(<Component />);
  
  expect(getByTestId('loading-spinner')).toBeInTheDocument();
  
  act(() => {
    resolvePromise();
  });
  
  await waitFor(() => {
    expect(queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });
});
```

### Form Validation
```typescript
it('should validate form inputs correctly', async () => {
  const { getByLabelText, getByText, getByRole } = render(<LoginForm />);
  
  const emailInput = getByLabelText('Email');
  const submitButton = getByRole('button', { name: 'Submit' });
  
  // Test invalid email
  await user.type(emailInput, 'invalid-email');
  await user.click(submitButton);
  
  expect(getByText('Please enter a valid email')).toBeInTheDocument();
});
```

---

*This document should be reviewed and updated regularly as testing practices evolve.* 