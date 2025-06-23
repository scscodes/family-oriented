/**
 * Test Helper Utilities
 * Async utilities and common test operations
 */

import { TEST_TIMEOUTS } from './test-constants';

export const asyncUtils = {
  /**
   * Waits for a condition to be true with timeout protection
   */
  waitForCondition: async (
    condition: () => boolean,
    timeout: number = TEST_TIMEOUTS.MEDIUM,
    interval: number = 100
  ): Promise<void> => {
    const startTime = Date.now();
    
    while (!condition() && Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    if (!condition()) {
      throw new Error(`Condition not met within ${timeout}ms`);
    }
  },

  /**
   * Creates a controlled promise for testing async operations
   */
  createControlledPromise: function<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    
    return { promise, resolve, reject };
  },

  /**
   * Creates a promise that resolves after a delay
   */
  delay: (ms: number): Promise<void> => 
    new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Wraps an async function with timeout protection
   */
  withTimeout: async <T>(
    promise: Promise<T>,
    timeout: number = TEST_TIMEOUTS.MEDIUM,
    errorMessage?: string
  ): Promise<T> => {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage || `Operation timed out after ${timeout}ms`)), timeout)
    );
    
    return Promise.race([promise, timeoutPromise]);
  }
}; 