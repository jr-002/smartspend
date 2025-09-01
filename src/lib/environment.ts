// Simple environment utilities for Lovable
// Note: Lovable doesn't support VITE_* environment variables
// Environment variables are used only for Vercel deployment

interface EnvironmentConfig {
  app: {
    environment: 'development' | 'production' | 'test';
    version: string;
  };
}

// Simple configuration without environment variable validation
function getEnvironment(): EnvironmentConfig {
  const nodeEnv = import.meta.env.NODE_ENV || 'development';
  
  return {
    app: {
      environment: nodeEnv as 'development' | 'production' | 'test',
      version: '1.0.0',
    },
  };
}

export const env = getEnvironment();

export const isDevelopment = env.app.environment === 'development';
export const isProduction = env.app.environment === 'production';
export const isTest = env.app.environment === 'test';