// Security headers middleware for API endpoints
export interface SecurityConfig {
  enableCSP?: boolean;
  enableHSTS?: boolean;
  enableXFrameOptions?: boolean;
  enableXContentTypeOptions?: boolean;
  enableReferrerPolicy?: boolean;
  customHeaders?: Record<string, string>;
}

// Comprehensive security headers
export function getSecurityHeaders(config: SecurityConfig = {}): Record<string, string> {
  const {
    enableCSP = true,
    enableHSTS = true,
    enableXFrameOptions = true,
    enableXContentTypeOptions = true,
    enableReferrerPolicy = true,
    customHeaders = {},
  } = config;

  const headers: Record<string, string> = {
    // CORS headers (essential for web app communication)
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Max-Age': '86400',
    
    // Content type
    'Content-Type': 'application/json',
    
    // Prevent clickjacking
    ...(enableXFrameOptions && { 'X-Frame-Options': 'DENY' }),
    
    // Prevent MIME type sniffing
    ...(enableXContentTypeOptions && { 'X-Content-Type-Options': 'nosniff' }),
    
    // XSS protection
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer policy
    ...(enableReferrerPolicy && { 'Referrer-Policy': 'strict-origin-when-cross-origin' }),
    
    // Content Security Policy
    ...(enableCSP && {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; '),
    }),
    
    // HTTP Strict Transport Security (for HTTPS)
    ...(enableHSTS && {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    }),
    
    // Additional security headers
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    
    // Custom headers
    ...customHeaders,
  };

  return headers;
}

// Security middleware wrapper
export function withSecurityHeaders(config?: SecurityConfig) {
  return function securityMiddleware(
    handler: (req: Request) => Promise<Response>
  ) {
    return async function(req: Request): Promise<Response> {
      try {
        const response = await handler(req);
        const securityHeaders = getSecurityHeaders(config);
        
        // Add security headers to response
        Object.entries(securityHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
        
        return response;
      } catch (error) {
        // Even error responses should have security headers
        const securityHeaders = getSecurityHeaders(config);
        return new Response(
          JSON.stringify({ error: 'Internal server error' }),
          {
            status: 500,
            headers: securityHeaders,
          }
        );
      }
    };
  };
}

// CORS preflight handler with security headers
export function handleCORSPreflight(config?: SecurityConfig): Response {
  const securityHeaders = getSecurityHeaders(config);
  return new Response(null, {
    status: 200,
    headers: securityHeaders,
  });
}

// Security audit logging
export function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  request: Request
) {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    details,
    ip: request.headers.get('x-forwarded-for') || 
        request.headers.get('cf-connecting-ip') || 
        'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    url: request.url,
  };
  
  console.warn('Security Event:', JSON.stringify(logData));
  
  // In production, send to security monitoring service
  // Example: Sentry.captureMessage(`Security Event: ${event}`, 'warning', { extra: logData });
}