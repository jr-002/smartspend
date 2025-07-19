// Client-side rate limiting utility
// Helps prevent excessive API calls and improves user experience

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (context: any) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      if (now > entry.resetTime) {
        this.storage.delete(key);
      }
    }
  }

  private getKey(context: any): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(context);
    }
    return 'default';
  }

  isAllowed(context: any = {}): boolean {
    const key = this.getKey(context);
    const now = Date.now();
    const entry = this.storage.get(key);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.storage.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    if (entry.count >= this.config.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRemainingRequests(context: any = {}): number {
    const key = this.getKey(context);
    const entry = this.storage.get(key);
    
    if (!entry || Date.now() > entry.resetTime) {
      return this.config.maxRequests;
    }
    
    return Math.max(0, this.config.maxRequests - entry.count);
  }

  getResetTime(context: any = {}): number {
    const key = this.getKey(context);
    const entry = this.storage.get(key);
    
    if (!entry || Date.now() > entry.resetTime) {
      return 0;
    }
    
    return entry.resetTime;
  }
}

// Pre-configured rate limiters for different API types
export const aiInsightsLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 60000, // 1 minute
  keyGenerator: (context) => `ai-insights-${context.userId || 'anonymous'}`,
});

export const budgetAILimiter = new RateLimiter({
  maxRequests: 3,
  windowMs: 300000, // 5 minutes
  keyGenerator: (context) => `budget-ai-${context.userId || 'anonymous'}`,
});

export const financialCoachLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60000, // 1 minute
  keyGenerator: (context) => `financial-coach-${context.userId || 'anonymous'}`,
});

export const riskPredictionLimiter = new RateLimiter({
  maxRequests: 2,
  windowMs: 300000, // 5 minutes
  keyGenerator: (context) => `risk-prediction-${context.userId || 'anonymous'}`,
});

// Utility function to check rate limit before API call
export const withRateLimit = async <T>(
  limiter: RateLimiter,
  context: any,
  apiCall: () => Promise<T>,
  onRateLimited?: (resetTime: number) => void
): Promise<T> => {
  if (!limiter.isAllowed(context)) {
    const resetTime = limiter.getResetTime(context);
    const waitTime = Math.ceil((resetTime - Date.now()) / 1000);
    
    if (onRateLimited) {
      onRateLimited(resetTime);
    }
    
    throw new Error(`Rate limit exceeded. Try again in ${waitTime} seconds.`);
  }
  
  return apiCall();
};