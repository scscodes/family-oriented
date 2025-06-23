/**
 * Consolidated Jest Configuration
 * 
 * This single configuration file replaces both the old jest.config.js and tsconfig.jest.json
 * by incorporating TypeScript settings directly and using Next.js built-in optimizations.
 */

const nextJest = require('next/jest');

// Create Jest config with Next.js defaults
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

const config = {
  // Use jsdom test environment for React components
  testEnvironment: 'jsdom',
  
  // Setup files to run after the test framework is installed
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // Module name mapping for path aliases and static assets
  moduleNameMapper: {
    // Path alias from tsconfig.json
    '^@/(.*)$': '<rootDir>/src/$1',
    
    // Mock static assets
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(svg)$': '<rootDir>/__mocks__/svgMock.js',
  },
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx|js|jsx)',
    '**/?(*.)+(spec|test).(ts|tsx|js|jsx)',
  ],
  
  // Files to ignore during transformation
  transformIgnorePatterns: [
    '/node_modules/(?!(jose|@supabase|@testing-library|uuid|nanoid)/)',
  ],
  
  // TypeScript transformation settings (replaces tsconfig.jest.json)
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        // Jest-specific TypeScript configuration
        jsx: 'react-jsx',
        module: 'CommonJS',
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        skipLibCheck: true,
        strict: true,
        target: 'ES2017',
        lib: ['dom', 'dom.iterable', 'esnext'],
      },
    }],
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/test/**/*',
    '!**/*.config.{ts,js}',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // Performance and safety settings
  testTimeout: 10000,
  maxWorkers: process.env.CI ? 1 : '50%',
  maxConcurrency: 5,
  
  // Enhanced error handling
  errorOnDeprecated: true,
  verbose: process.env.CI || process.env.VERBOSE_TESTS === 'true',
  
  // Memory and resource management
  detectOpenHandles: true,
  forceExit: true,
  
  // Enhanced reporting
  reporters: process.env.CI 
    ? [
        'default',
        ['jest-junit', {
          outputDirectory: 'test-results',
          outputName: 'junit.xml',
        }]
      ]
    : ['default'],
  
  // Performance optimizations
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Fail fast in CI environments
  bail: process.env.CI ? 1 : 0,
  
  // Global test configuration
  globals: {
    'ts-jest': {
      useESM: false,
    },
  },
};

// Export the Jest config with Next.js enhancements
module.exports = createJestConfig(config); 