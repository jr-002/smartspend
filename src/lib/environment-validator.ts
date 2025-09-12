// Runtime environment validation for production deployment
interface EnvironmentConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_APP_VERSION?: string;
  NODE_ENV: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: Partial<EnvironmentConfig>;
}

export class EnvironmentValidator {
  private static instance: EnvironmentValidator;
  
  static getInstance(): EnvironmentValidator {
    if (!EnvironmentValidator.instance) {
      EnvironmentValidator.instance = new EnvironmentValidator();
    }
    return EnvironmentValidator.instance;
  }

  validateEnvironment(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const config: Partial<EnvironmentConfig> = {};

    // Critical environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const nodeEnv = import.meta.env.NODE_ENV || 'development';
    const appVersion = import.meta.env.VITE_APP_VERSION;

    // Validate Supabase URL
    if (!supabaseUrl) {
      errors.push('VITE_SUPABASE_URL is required but not defined');
    } else if (!this.isValidSupabaseUrl(supabaseUrl)) {
      errors.push('VITE_SUPABASE_URL is not a valid Supabase URL format');
    } else {
      config.VITE_SUPABASE_URL = supabaseUrl;
    }

    // Validate Supabase Anonymous Key
    if (!supabaseAnonKey) {
      errors.push('VITE_SUPABASE_ANON_KEY is required but not defined');
    } else if (!this.isValidJWT(supabaseAnonKey)) {
      errors.push('VITE_SUPABASE_ANON_KEY is not a valid JWT token');
    } else {
      config.VITE_SUPABASE_ANON_KEY = supabaseAnonKey;
    }

    // Validate Node Environment
    if (!['development', 'production', 'test'].includes(nodeEnv)) {
      warnings.push(`NODE_ENV is set to '${nodeEnv}', expected 'development', 'production', or 'test'`);
    }
    config.NODE_ENV = nodeEnv;

    // Optional but recommended variables
    if (!appVersion && nodeEnv === 'production') {
      warnings.push('VITE_APP_VERSION is not set - recommended for production deployments');
    } else if (appVersion) {
      config.VITE_APP_VERSION = appVersion;
    }

    // Additional production checks
    if (nodeEnv === 'production') {
      this.validateProductionEnvironment(errors, warnings, config);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      config,
    };
  }

  private validateProductionEnvironment(
    errors: string[],
    warnings: string[],
    config: Partial<EnvironmentConfig>
  ): void {
    // Check for development-specific configurations in production
    if (config.VITE_SUPABASE_URL?.includes('localhost')) {
      errors.push('Production environment cannot use localhost Supabase URL');
    }

    // Validate HTTPS in production
    if (config.VITE_SUPABASE_URL && !config.VITE_SUPABASE_URL.startsWith('https://')) {
      errors.push('Production Supabase URL must use HTTPS');
    }

    // Check for proper domain
    if (config.VITE_SUPABASE_URL && !config.VITE_SUPABASE_URL.includes('.supabase.co')) {
      warnings.push('Supabase URL does not appear to be a standard Supabase domain');
    }
  }

  private isValidSupabaseUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return (
        (parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:') &&
        (parsedUrl.hostname.includes('.supabase.co') || parsedUrl.hostname === 'localhost')
      );
    } catch {
      return false;
    }
  }

  private isValidJWT(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Try to decode the header and payload
      JSON.parse(atob(parts[0]));
      JSON.parse(atob(parts[1]));
      
      return true;
    } catch {
      return false;
    }
  }

  displayValidationResults(result: ValidationResult): void {
    if (result.isValid) {
      console.log('✅ Environment validation passed');
      if (result.warnings.length > 0) {
        console.warn('⚠️ Environment warnings:', result.warnings);
      }
    } else {
      console.error('❌ Environment validation failed:');
      result.errors.forEach(error => console.error(`  - ${error}`));
      
      if (result.warnings.length > 0) {
        console.warn('⚠️ Additional warnings:', result.warnings);
      }
    }
  }

  createEnvironmentErrorUI(result: ValidationResult): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #fee2e2;
      color: #991b1b;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: system-ui, -apple-system, sans-serif;
    `;

    container.innerHTML = `
      <div style="max-width: 600px; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
        <h1 style="color: #dc2626; font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">
          ⚠️ Configuration Error
        </h1>
        <p style="margin-bottom: 1rem; color: #374151;">
          The application cannot start due to missing or invalid environment configuration:
        </p>
        <ul style="margin-bottom: 1.5rem; padding-left: 1.5rem; color: #374151;">
          ${result.errors.map(error => `<li style="margin-bottom: 0.5rem;">• ${error}</li>`).join('')}
        </ul>
        <div style="background: #f3f4f6; padding: 1rem; border-radius: 4px; font-size: 0.875rem; color: #374151;">
          <strong>For developers:</strong> Check your environment variables configuration and ensure all required values are properly set.
        </div>
      </div>
    `;

    return container;
  }
}

export const environmentValidator = EnvironmentValidator.getInstance();