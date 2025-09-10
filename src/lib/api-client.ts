// Centralized API client for handling all external API calls
// This provides a consistent interface and error handling for API operations

interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 10000,
    } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          ...this.defaultHeaders,
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText || response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      
      return {
        success: false,
        error: 'Unknown error occurred',
      };
    }
  }

  // AI-related API calls
  async generateFinancialInsights(userId: string): Promise<ApiResponse<any[]>> {
    return this.request('/api/ai-insights', {
      method: 'POST',
      body: { userId },
    });
  }

  async generateBudgetRecommendations(userId: string): Promise<ApiResponse<any>> {
    return this.request('/api/budget-ai', {
      method: 'POST',
      body: { userId },
    });
  }

  async generateSpendingPredictions(userId: string): Promise<ApiResponse<Record<string, number>>> {
    return this.request('/api/spending-predictions', {
      method: 'POST',
      body: { userId },
    });
  }

  async getFinancialAdvice(userContext: string): Promise<ApiResponse<{ advice: string }>> {
    return this.request('/api/ai-coach', {
      method: 'POST',
      body: { userContext },
    });
  }

  async analyzeFinancialRisk(financialData: any): Promise<ApiResponse<any>> {
    return this.request('/api/risk-prediction', {
      method: 'POST',
      body: { financialData },
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Utility functions for common API patterns
export const withRetry = async <T>(
  apiCall: () => Promise<ApiResponse<T>>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<ApiResponse<T>> => {
  let lastError: string = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await apiCall();
    
    if (result.success) {
      return result;
    }

    lastError = result.error || 'Unknown error';
    
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  return {
    success: false,
    error: `Failed after ${maxRetries} attempts. Last error: ${lastError}`,
  };
};

// Enhanced caching with Supabase optimizations
export const withCache = <T>(
  cacheKey: string,
  apiCall: () => Promise<ApiResponse<T>>,
  ttl: number = 5 * 60 * 1000 // 5 minutes default
): Promise<ApiResponse<T>> => {
  // Check memory cache first (faster)
  const memoryCache = (window as any).__smartspend_cache || new Map();
  (window as any).__smartspend_cache = memoryCache;
  
  const memoryCached = memoryCache.get(cacheKey);
  if (memoryCached && Date.now() - memoryCached.timestamp < ttl) {
    return Promise.resolve({ success: true, data: memoryCached.data });
  }

  // Check localStorage cache
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < ttl) {
        // Update memory cache
        memoryCache.set(cacheKey, { data, timestamp });
        return Promise.resolve({ success: true, data });
      }
    } catch (error) {
      localStorage.removeItem(cacheKey);
    }
  }

  return apiCall().then(result => {
    if (result.success && result.data) {
      const cacheData = {
        data: result.data,
        timestamp: Date.now(),
      };
      
      // Store in both memory and localStorage
      memoryCache.set(cacheKey, cacheData);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } catch (error) {
        // localStorage might be full, clean up old entries
        console.warn('Cache storage full, clearing old entries');
        const keys = Object.keys(localStorage);
        keys.filter(key => key.startsWith('smartspend_cache_'))
             .slice(0, Math.floor(keys.length / 2))
             .forEach(key => localStorage.removeItem(key));
        
        try {
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (e) {
          console.warn('Unable to cache data in localStorage');
        }
      }
    }
    return result;
  });
};

// Supabase-specific caching utilities
export const clearApiCache = (pattern?: string): void => {
  const memoryCache = (window as any).__smartspend_cache;
  if (memoryCache) {
    if (pattern) {
      for (const key of memoryCache.keys()) {
        if (key.includes(pattern)) {
          memoryCache.delete(key);
        }
      }
    } else {
      memoryCache.clear();
    }
  }
  
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('smartspend_cache_')) {
      if (!pattern || key.includes(pattern)) {
        localStorage.removeItem(key);
      }
    }
  });
};

// Preload critical data
export const preloadCriticalData = async (userId: string): Promise<void> => {
  if (!userId) return;
  
  const criticalApis = [
    () => apiClient.generateFinancialInsights(userId),
    () => apiClient.generateBudgetRecommendations(userId),
  ];
  
  // Preload in background without blocking UI
  criticalApis.forEach(apiCall => {
    withCache(`preload_${userId}_${apiCall.name}`, apiCall, 10 * 60 * 1000)
      .catch(error => console.warn('Preload failed:', error));
  });
};