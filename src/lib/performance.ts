// Performance optimization utilities
import React from 'react';

// Debounce function for search inputs and API calls
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Enhanced debounce with immediate execution option
export function debounceWithImmediate<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) func(...args);
    }, wait);
    
    if (callNow) func(...args);
  };
}

// Request queue to prevent overwhelming the API
class RequestQueue {
  private queue: Array<() => Promise<unknown>> = [];
  private processing = false;
  private maxConcurrent = 3;
  private currentRequests = 0;
  private minDelay = 100; // Minimum delay between requests

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.currentRequests >= this.maxConcurrent) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.currentRequests < this.maxConcurrent) {
      const request = this.queue.shift();
      if (request) {
        this.currentRequests++;
        
        request()
          .finally(() => {
            this.currentRequests--;
            // Add small delay between requests
            setTimeout(() => this.processQueue(), this.minDelay);
          });
      }
    }

    this.processing = false;
  }
}

export const requestQueue = new RequestQueue();

// Throttle function for scroll events and frequent updates
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memoization utility for expensive calculations
export function memoize<T extends (...args: unknown[]) => ReturnType<T>>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    // Clean up cache if it gets too large
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  }) as T;
}

// Lazy loading utility for heavy components
export function createLazyComponent<P extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = React.lazy(importFunc);
  
  return React.forwardRef<React.ComponentType<P>, P>((props, ref) => {
    const FallbackComponent = fallback;
    return React.createElement(
      React.Suspense,
      {
        fallback: FallbackComponent
          ? React.createElement(FallbackComponent)
          : React.createElement('div', null, 'Loading...')
      },
      React.createElement(LazyComponent, { ...props, ref })
    );
  });
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();
  
  static mark(name: string): void {
    this.marks.set(name, performance.now());
  }
  
  static measure(name: string, startMark: string): number {
    const startTime = this.marks.get(startMark);
    if (!startTime) {
      console.warn(`Start mark "${startMark}" not found`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    
    // Clean up old marks
    this.marks.delete(startMark);
    
    return duration;
  }
  
  static measureAsync<T>(
    name: string,
    asyncFunc: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    return asyncFunc().finally(() => {
      const duration = performance.now() - startTime;
      console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    });
  }
}

// Memory usage monitoring
export function logMemoryUsage(label: string): void {
  if ('memory' in performance) {
    const memory = (performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number; } }).memory;
    console.log(`Memory Usage (${label}):`, {
      used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`,
    });
  }
}

// Bundle size analyzer helper
export function analyzeComponentSize(componentName: string, component: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Component ${componentName} loaded:`, {
      type: typeof component,
      hasDefaultExport: component !== null && typeof component === 'object' && 'default' in component,
      keys: component !== null && typeof component === 'object' ? Object.keys(component) : [],
    });
  }
}