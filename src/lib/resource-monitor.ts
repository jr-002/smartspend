// Resource monitoring and management utility
class ResourceMonitor {
  private static instance: ResourceMonitor;
  private memoryThreshold = 100 * 1024 * 1024; // 100MB
  private requestCount = 0;
  private maxRequestsPerMinute = 30;
  private requestTimestamps: number[] = [];

  static getInstance(): ResourceMonitor {
    if (!ResourceMonitor.instance) {
      ResourceMonitor.instance = new ResourceMonitor();
    }
    return ResourceMonitor.instance;
  }

  // Check if we have sufficient resources for a new request
  canMakeRequest(): boolean {
    // Check memory usage
    if (this.isMemoryLow()) {
      console.warn('Memory usage is high, deferring request');
      return false;
    }

    // Check request rate
    if (this.isRequestRateHigh()) {
      console.warn('Request rate is high, deferring request');
      return false;
    }

    return true;
  }

  private isMemoryLow(): boolean {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize > this.memoryThreshold;
    }
    return false;
  }

  private isRequestRateHigh(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Clean old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => timestamp > oneMinuteAgo
    );
    
    return this.requestTimestamps.length >= this.maxRequestsPerMinute;
  }

  // Track a new request
  trackRequest(): void {
    this.requestCount++;
    this.requestTimestamps.push(Date.now());
  }

  // Force garbage collection if available
  forceGarbageCollection(): void {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      try {
        (window as any).gc();
      } catch (error) {
        console.warn('Garbage collection failed:', error);
      }
    }
  }

  // Get current resource status
  getResourceStatus() {
    const memory = 'memory' in performance ? (performance as any).memory : null;
    
    return {
      memoryUsage: memory ? {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
      } : null,
      requestCount: this.requestCount,
      recentRequests: this.requestTimestamps.length,
      canMakeRequest: this.canMakeRequest(),
    };
  }

  // Clean up resources
  cleanup(): void {
    this.requestTimestamps = [];
    this.requestCount = 0;
    this.forceGarbageCollection();
  }
}

export const resourceMonitor = ResourceMonitor.getInstance();

// Wrapper for resource-aware API calls
export const resourceAwareAPICall = async <T>(
  apiCall: () => Promise<T>,
  fallback?: () => T
): Promise<T> => {
  if (!resourceMonitor.canMakeRequest()) {
    if (fallback) {
      console.warn('Using fallback due to resource constraints');
      return fallback();
    }
    throw new Error('Insufficient resources to make request. Please try again later.');
  }

  resourceMonitor.trackRequest();
  
  try {
    return await apiCall();
  } catch (error) {
    // If it's a resource error, trigger cleanup
    if (error instanceof Error && error.message.includes('resources')) {
      resourceMonitor.cleanup();
    }
    throw error;
  }
};