// Complete Content Security Policy implementation
export interface CSPConfig {
  reportOnly?: boolean;
  reportUri?: string;
  nonce?: string;
  enableUnsafeInline?: boolean;
  enableUnsafeEval?: boolean;
  customDirectives?: Record<string, string[]>;
}

export class ContentSecurityPolicy {
  private config: CSPConfig;

  constructor(config: CSPConfig = {}) {
    this.config = {
      reportOnly: false,
      enableUnsafeInline: false,
      enableUnsafeEval: false,
      ...config
    };
  }

  generatePolicy(): string {
    const directives: Record<string, string[]> = {
      'default-src': ["'self'"],
      'script-src': this.getScriptSources(),
      'style-src': this.getStyleSources(),
      'img-src': this.getImageSources(),
      'font-src': this.getFontSources(),
      'connect-src': this.getConnectSources(),
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'upgrade-insecure-requests': [],
      ...this.config.customDirectives
    };

    // Note: frame-ancestors and report-uri are ignored in meta tags
    // These should only be set via HTTP headers (see vercel.json)

    return Object.entries(directives)
      .map(([directive, sources]) => {
        if (sources.length === 0) {
          return directive;
        }
        return `${directive} ${sources.join(' ')}`;
      })
      .join('; ');
  }

  private getScriptSources(): string[] {
    const sources = ["'self'"];
    
    if (this.config.nonce) {
      sources.push(`'nonce-${this.config.nonce}'`);
    }
    
    // Only allow unsafe-inline and unsafe-eval in development or if explicitly enabled
    if (this.config.enableUnsafeInline || import.meta.env.DEV) {
      sources.push("'unsafe-inline'");
    }
    
    if (this.config.enableUnsafeEval || import.meta.env.DEV) {
      sources.push("'unsafe-eval'");
    }

    // Trusted CDNs for production
    if (import.meta.env.PROD) {
      sources.push(
        'https://cdn.jsdelivr.net',
        'https://unpkg.com',
        'https://cdnjs.cloudflare.com'
      );
    }

    return sources;
  }

  private getStyleSources(): string[] {
    const sources = ["'self'"];
    
    if (this.config.nonce) {
      sources.push(`'nonce-${this.config.nonce}'`);
    }
    
    // Allow unsafe-inline for styles (common requirement for CSS-in-JS)
    sources.push("'unsafe-inline'");
    
    // Trusted style sources
    sources.push(
      'https://fonts.googleapis.com',
      'https://cdn.jsdelivr.net'
    );

    return sources;
  }

  private getImageSources(): string[] {
    return [
      "'self'",
      'data:',
      'blob:',
      'https:',
      // Specific trusted image sources
      'https://images.pexels.com',
      'https://images.unsplash.com',
      'https://via.placeholder.com'
    ];
  }

  private getFontSources(): string[] {
    return [
      "'self'",
      'data:',
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net'
    ];
  }

  private getConnectSources(): string[] {
    const sources = ["'self'"];
    
    // Supabase endpoints
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl) {
      sources.push(supabaseUrl);
      sources.push('https://*.supabase.co');
    }
    
    // Analytics and monitoring
    if (import.meta.env.VITE_SENTRY_DSN) {
      sources.push('https://*.sentry.io');
    }
    
    // IP location API for currency detection
    sources.push('https://ipapi.co');
    
    // WebSocket connections
    sources.push('wss:');
    
    return sources;
  }

  getHeaderName(): string {
    return this.config.reportOnly 
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy';
  }

  applyToDocument(): void {
    const meta = document.createElement('meta');
    meta.httpEquiv = this.getHeaderName();
    meta.content = this.generatePolicy();
    document.head.appendChild(meta);
  }
}

// Production CSP configuration
export const productionCSP = new ContentSecurityPolicy({
  reportOnly: false,
  enableUnsafeInline: false,
  enableUnsafeEval: false,
  reportUri: '/api/csp-report',
  customDirectives: {
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
    'media-src': ["'self'", 'data:', 'blob:']
  }
});

// Development CSP configuration (more permissive)
export const developmentCSP = new ContentSecurityPolicy({
  reportOnly: true,
  enableUnsafeInline: true,
  enableUnsafeEval: true,
});

// Get appropriate CSP for current environment
export const getCSP = (): ContentSecurityPolicy => {
  return import.meta.env.PROD ? productionCSP : developmentCSP;
};

// CSP violation reporting
export const handleCSPViolation = (event: SecurityPolicyViolationEvent) => {
  console.warn('CSP Violation:', {
    blockedURI: event.blockedURI,
    violatedDirective: event.violatedDirective,
    originalPolicy: event.originalPolicy,
    documentURI: event.documentURI,
    lineNumber: event.lineNumber,
    columnNumber: event.columnNumber,
    sourceFile: event.sourceFile,
    timestamp: new Date().toISOString()
  });

  // In production, send to monitoring service
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    // This would send to Sentry or another monitoring service
    console.error('CSP violation reported to monitoring service');
  }
};

// Initialize CSP
export const initializeCSP = (): void => {
  const csp = getCSP();
  csp.applyToDocument();
  
  // Listen for CSP violations
  document.addEventListener('securitypolicyviolation', handleCSPViolation);
  
  console.log(`CSP initialized (${import.meta.env.PROD ? 'production' : 'development'} mode)`);
};