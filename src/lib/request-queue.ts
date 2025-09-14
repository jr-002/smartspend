// Enhanced request queue to prevent resource exhaustion
class RequestQueue {
  private queue: Array<{
    request: () => Promise<unknown>;
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
    priority: number;
    timestamp: number;
  }> = [];
  private processing = false;
  private maxConcurrent = 5; // Increased for better performance
  private currentRequests = 0;
  private minDelay = 50; // Reduced delay to prevent blocking
  private maxQueueSize = 50; // Prevent queue from growing too large

  async add<T>(
    request: () => Promise<T>, 
    priority: number = 0
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // Prevent queue overflow
      if (this.queue.length >= this.maxQueueSize) {
        reject(new Error('Request queue is full. Please try again later.'));
        return;
      }

      this.queue.push({
        request: request as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
        priority,
        timestamp: Date.now(),
      });
      
      // Sort by priority (higher priority first)
      this.queue.sort((a, b) => b.priority - a.priority);
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.currentRequests >= this.maxConcurrent) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.currentRequests < this.maxConcurrent) {
      const item = this.queue.shift();
      if (!item) continue;

      // Check if request is too old (timeout after 30 seconds)
      if (Date.now() - item.timestamp > 30000) {
        item.reject(new Error('Request timeout'));
        continue;
      }

      this.currentRequests++;
      
      item.request()
        .then(item.resolve)
        .catch(item.reject)
        .finally(() => {
          this.currentRequests--;
          // Add delay between requests to prevent resource exhaustion
          setTimeout(() => this.processQueue(), this.minDelay);
        });
    }

    this.processing = false;
  }

  // Get queue status for monitoring
  getStatus() {
    return {
      queueLength: this.queue.length,
      currentRequests: this.currentRequests,
      processing: this.processing,
    };
  }

  // Clear queue in case of emergency
  clearQueue() {
    this.queue.forEach(item => {
      item.reject(new Error('Queue cleared'));
    });
    this.queue = [];
  }
}

export const requestQueue = new RequestQueue();

// Wrapper function for API calls with automatic queuing
export const queuedAPICall = <T>(
  apiCall: () => Promise<T>,
  priority: number = 0
): Promise<T> => {
  return requestQueue.add(apiCall, priority);
};