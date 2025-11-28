// Enhanced environment configuration for different deployment stages
import { isDevelopment, isProduction } from './environment';

interface AppConfig {
  api: {
    timeout: number;
    retries: number;
    cacheEnabled: boolean;
    cacheTTL: number;
  };
  features: {
    analytics: boolean;
    errorReporting: boolean;
    debugging: boolean;
    offlineMode: boolean;
  };
  performance: {
    lazyLoading: boolean;
    prefetching: boolean;
    serviceWorker: boolean;
  };
  ui: {
    showDebugInfo: boolean;
    enableDevTools: boolean;
  };
}

const developmentConfig: AppConfig = {
  api: {
    timeout: 15000,
    retries: 2,
    cacheEnabled: false,
    cacheTTL: 1 * 60 * 1000, // 1 minute
  },
  features: {
    analytics: false,
    errorReporting: false,
    debugging: true,
    offlineMode: false,
  },
  performance: {
    lazyLoading: false,
    prefetching: false,
    serviceWorker: false,
  },
  ui: {
    showDebugInfo: true,
    enableDevTools: true,
  },
};

const productionConfig: AppConfig = {
  api: {
    timeout: 10000,
    retries: 3,
    cacheEnabled: true,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
  },
  features: {
    analytics: true,
    errorReporting: true,
    debugging: false,
    offlineMode: true,
  },
  performance: {
    lazyLoading: true,
    prefetching: true,
    serviceWorker: true,
  },
  ui: {
    showDebugInfo: false,
    enableDevTools: false,
  },
};

export const appConfig: AppConfig = isProduction ? productionConfig : developmentConfig;

// Environment-specific utilities
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = 'https://gxvsmnmgrxovbsmdkdqf.supabase.co/functions/v1';
  return `${baseUrl}${endpoint}`;
};

export const shouldEnableFeature = (feature: keyof AppConfig['features']): boolean => {
  return appConfig.features[feature];
};

export const getPerformanceSetting = (setting: keyof AppConfig['performance']): boolean => {
  return appConfig.performance[setting];
};

// Logging configuration
export const logLevel = isDevelopment ? 'debug' : 'error';

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (isDevelopment || appConfig.ui.showDebugInfo) {
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
  },
};