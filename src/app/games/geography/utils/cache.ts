/**
 * Simple in-memory cache for SVG outlines
 */
class SvgCache {
  private static instance: SvgCache;
  private cache: Map<string, string>;
  private maxSize: number;

  private constructor(maxSize: number = 50) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * Get the singleton instance of the cache
   */
  public static getInstance(): SvgCache {
    if (!SvgCache.instance) {
      SvgCache.instance = new SvgCache();
    }
    return SvgCache.instance;
  }

  /**
   * Get a cached SVG by key
   * @param key The cache key
   * @returns The cached SVG or undefined if not found
   */
  public get(key: string): string | undefined {
    return this.cache.get(key);
  }

  /**
   * Set a value in the cache
   * @param key The cache key
   * @param value The SVG string to cache
   */
  public set(key: string, value: string): void {
    // If cache is full, remove the oldest entry
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  /**
   * Clear the cache
   */
  public clear(): void {
    this.cache.clear();
  }
}

export const svgCache = SvgCache.getInstance(); 