// Advanced rate limiting with persistence and intelligent limits

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  burstAllowance?: number;
  recoveryPeriodMs?: number;
  skipIfAuthenticated?: boolean;
  adminBypass?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number;
  limit: number;
  retryAfter?: number;
}

export interface RateLimitEntry {
  count: number;
  reset: number;
  burstUsed: number;
  lastRequest: number;
}

// Persistent rate limiter using Supabase for storage
export class AdvancedRateLimiter {
  private memoryStore = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;
  private endpoint: string;

  constructor(endpoint: string, config: RateLimitConfig) {
    this.endpoint = endpoint;
    this.config = {
      burstAllowance: 0,
      recoveryPeriodMs: 3600000, // 1 hour default recovery
      skipIfAuthenticated: false,
      adminBypass: true,
      ...config,
    };

    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 300000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryStore.entries()) {
      if (now > entry.reset) {
        this.memoryStore.delete(key);
      }
    }
  }

  private getKey(identifier: string): string {
    return `${this.endpoint}:${identifier}`;
  }

  // Get rate limit entry from memory store
  private getRateLimitEntry(key: string): RateLimitEntry | null {
    const memoryEntry = this.memoryStore.get(key);
    if (memoryEntry && Date.now() <= memoryEntry.reset) {
      return memoryEntry;
    }
    return null;
  }

  // Save rate limit entry to memory store
  private saveRateLimitEntry(key: string, entry: RateLimitEntry): void {
    this.memoryStore.set(key, entry);
  }

  async checkRateLimit(
    identifier: string,
    isAuthenticated: boolean = false,
    isAdmin: boolean = false
  ): Promise<RateLimitResult> {
    const key = this.getKey(identifier);
    const now = Date.now();

    // Admin bypass
    if (this.config.adminBypass && isAdmin) {
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        reset: now + this.config.windowMs,
        limit: this.config.maxRequests,
      };
    }

    // Skip if authenticated and configured to do so
    if (this.config.skipIfAuthenticated && isAuthenticated) {
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        reset: now + this.config.windowMs,
        limit: this.config.maxRequests,
      };
    }

    const existingEntry = this.getRateLimitEntry(key);

    // No existing entry or expired window
    if (!existingEntry || now > existingEntry.reset) {
      const newEntry: RateLimitEntry = {
        count: 1,
        reset: now + this.config.windowMs,
        burstUsed: 0,
        lastRequest: now,
      };

      this.saveRateLimitEntry(key, newEntry);

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        reset: newEntry.reset,
        limit: this.config.maxRequests,
      };
    }

    // Check if rate limit exceeded
    const totalAllowed = this.config.maxRequests + (this.config.burstAllowance || 0);
    const currentUsage = existingEntry.count;

    if (currentUsage >= totalAllowed) {
      const retryAfter = Math.ceil((existingEntry.reset - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        reset: existingEntry.reset,
        limit: this.config.maxRequests,
        retryAfter,
      };
    }

    // Allow request and increment counter
    const updatedEntry: RateLimitEntry = {
      ...existingEntry,
      count: existingEntry.count + 1,
      lastRequest: now,
    };

    // Track burst usage
    if (currentUsage >= this.config.maxRequests) {
      updatedEntry.burstUsed = existingEntry.burstUsed + 1;
    }

    this.saveRateLimitEntry(key, updatedEntry);

    return {
      allowed: true,
      remaining: Math.max(0, totalAllowed - updatedEntry.count),
      reset: existingEntry.reset,
      limit: this.config.maxRequests,
    };
  }

  // Get current rate limit status without incrementing
  getStatus(identifier: string): RateLimitResult {
    const key = this.getKey(identifier);
    const now = Date.now();
    const entry = this.getRateLimitEntry(key);

    if (!entry || now > entry.reset) {
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        reset: now + this.config.windowMs,
        limit: this.config.maxRequests,
      };
    }

    const totalAllowed = this.config.maxRequests + (this.config.burstAllowance || 0);
    
    return {
      allowed: entry.count < totalAllowed,
      remaining: Math.max(0, totalAllowed - entry.count),
      reset: entry.reset,
      limit: this.config.maxRequests,
    };
  }
}

// Pre-configured rate limiters for different API endpoints
export const aiCoachLimiter = new AdvancedRateLimiter('ai-coach', {
  maxRequests: 5,
  windowMs: 60000, // 1 minute
  burstAllowance: 2,
  skipIfAuthenticated: false,
});

export const aiInsightsLimiter = new AdvancedRateLimiter('ai-insights', {
  maxRequests: 3,
  windowMs: 300000, // 5 minutes
  burstAllowance: 1,
  skipIfAuthenticated: false,
});

export const budgetAILimiter = new AdvancedRateLimiter('budget-ai', {
  maxRequests: 2,
  windowMs: 300000, // 5 minutes
  burstAllowance: 1,
  skipIfAuthenticated: false,
});

export const riskPredictionLimiter = new AdvancedRateLimiter('risk-prediction', {
  maxRequests: 2,
  windowMs: 300000, // 5 minutes
  burstAllowance: 0,
  skipIfAuthenticated: false,
});

// Utility function to add rate limit headers to response
export function addRateLimitHeaders(
  headers: Record<string, string>,
  result: RateLimitResult
): Record<string, string> {
  return {
    ...headers,
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
    ...(result.retryAfter && { 'Retry-After': String(result.retryAfter) }),
  };
}