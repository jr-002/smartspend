// Environment configuration and validation
interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  groq: {
    apiKey?: string;
  };
  app: {
    environment: 'development' | 'production' | 'test';
    version: string;
  };
}

// Validate required environment variables
function validateEnvironment(): EnvironmentConfig {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const nodeEnv = import.meta.env.NODE_ENV || 'development';

  if (!supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL is required');
  }

  if (!supabaseAnonKey) {
    throw new Error('VITE_SUPABASE_ANON_KEY is required');
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error('VITE_SUPABASE_URL must be a valid URL');
  }

  return {
    supabase: {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
    },
    groq: {
      apiKey: import.meta.env.VITE_GROQ_API_KEY,
    },
    app: {
      environment: nodeEnv as 'development' | 'production' | 'test',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    },
  };
}

export const env = validateEnvironment();

export const isDevelopment = env.app.environment === 'development';
export const isProduction = env.app.environment === 'production';
export const isTest = env.app.environment === 'test';