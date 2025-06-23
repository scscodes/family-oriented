import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for jose/Supabase in Jest
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as typeof global.TextDecoder;
}

// Set dummy Supabase env vars for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

// Enhanced localStorage mock with better error handling
interface LocalStorageMock {
  getItem: jest.Mock;
  setItem: jest.Mock;
  removeItem: jest.Mock;
  clear: jest.Mock;
  _storage: Record<string, string>;
}

const localStorageMock: LocalStorageMock = {
  getItem: jest.fn((key: string) => {
    const item = localStorageMock._storage[key];
    return item || null;
  }),
  setItem: jest.fn((key: string, value: string) => {
    localStorageMock._storage[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete localStorageMock._storage[key];
  }),
  clear: jest.fn(() => {
    localStorageMock._storage = {};
  }),
  _storage: {} as Record<string, string>
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Enhanced window.matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver (needed for Chart.js)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
) as jest.Mock;

// Enhanced console error handling for tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    // Suppress known React testing warnings
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is deprecated') ||
       args[0].includes('Warning: An invalid form control') ||
       args[0].includes('Warning: Cannot update a component'))
    ) {
      return;
    }
    originalError.apply(console, args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Global test timeout helpers
export const TEST_TIMEOUTS = {
  FAST: 2000,      // For sync operations
  MEDIUM: 5000,    // For simple async operations  
  SLOW: 10000,     // For complex async operations
  INTEGRATION: 15000 // For integration tests
} as const;

// Global test utilities
global.testUtils = {
  waitForStableState: async (callback: () => boolean, timeout = TEST_TIMEOUTS.MEDIUM) => {
    const startTime = Date.now();
    while (!callback() && Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (!callback()) {
      throw new Error(`Condition not met within ${timeout}ms`);
    }
  },
  
  createMockPromise: <T>(value: T, delay = 0): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(value), delay));
  },
  
  createMockRejection: (error: Error, delay = 0): Promise<never> => {
    return new Promise((_, reject) => setTimeout(() => reject(error), delay));
  }
};

// Enhanced global error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Cleanup after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset localStorage
  localStorageMock.clear();
  
  // Clear any pending timers safely
  try {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  } catch {
    // Ignore errors if timers aren't mocked
  }
});
