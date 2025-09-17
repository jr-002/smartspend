// Client-side caching utilities for better performance

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxSize = 50; // Reduced cache size to prevent memory issues

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // More aggressive cleanup if cache is getting large
    if (this.cache.size >= this.maxSize) {
      // Remove oldest 25% of entries
      const keysToRemove = Array.from(this.cache.keys()).slice(0, Math.floor(this.maxSize * 0.25));
      keysToRemove.forEach(key => this.cache.delete(key));
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    // Force garbage collection if available
    if ('gc' in window && typeof window.gc === 'function') {
      try {
        window.gc();
      } catch (error) {
        console.warn('Garbage collection failed:', error);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
export const memoryCache = new MemoryCache();

// Cache wrapper for async functions
export function withCache<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  ttl: number = 5 * 60 * 1000 // 5 minutes default
) {
  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args);
    
    // Check cache first
    const cached = memoryCache.get<R>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn(...args);
    memoryCache.set(key, result, ttl);
    
    return result;
  };
}

// Local storage cache with expiration
export class LocalStorageCache {
  private prefix: string;

  constructor(prefix: string = 'smartspend_cache_') {
    this.prefix = prefix;
  }

  set<T>(key: string, data: T, ttl: number = 24 * 60 * 60 * 1000): void {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to cache data in localStorage:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      
      if (!item) {
        return null;
      }

      const parsed = JSON.parse(item);
      const now = Date.now();
      
      if (now - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data from localStorage:', error);
      return null;
    }
  }

  delete(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const localCache = new LocalStorageCache();

// Utility to cache API responses
export const cacheApiResponse = withCache;

// Cache keys generator utilities
export const CacheKeys = {
  transactions: (userId: string) => `transactions_${userId}`,
  budgets: (userId: string) => `budgets_${userId}`,
  savingsGoals: (userId: string) => `savings_goals_${userId}`,
  bills: (userId: string) => `bills_${userId}`,
  investments: (userId: string) => `investments_${userId}`,
  analytics: (userId: string, period: string) => `analytics_${userId}_${period}`,
  aiInsights: (userId: string) => `ai_insights_${userId}`,
  profile: (userId: string) => `profile_${userId}`,
} as const;