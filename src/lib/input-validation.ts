import { z } from 'zod';

// Add missing InputSanitizer class that's referenced in other files
export class InputSanitizer {
  // Remove potentially dangerous HTML/script content
  static sanitizeString(input: string, maxLength: number = 1000): string {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }

    return input
      .trim()
      .slice(0, maxLength)
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/vbscript:/gi, '') // Remove vbscript: protocols
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      // Remove control characters (ASCII 0-31) and DEL (ASCII 127)
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001F\u007F]/g, '');
  }

  // Sanitize AI prompts to prevent injection attacks
  static sanitizeAIPrompt(prompt: string): string {
    if (typeof prompt !== 'string') {
      throw new Error('Prompt must be a string');
    }

    // Check for common prompt injection patterns
    const dangerousPatterns = [
      /ignore\s+previous\s+instructions/gi,
      /forget\s+everything/gi,
      /you\s+are\s+now/gi,
      /system\s*:/gi,
      /assistant\s*:/gi,
      /\[system\]/gi,
      /\[\/system\]/gi,
      /<\|.*?\|>/gi, // Special tokens
    ];

    let sanitized = this.sanitizeString(prompt, 5000);

    // Log and clean potential injection attempts
    for (const pattern of dangerousPatterns) {
      if (pattern.test(sanitized)) {
        console.warn('Potential prompt injection detected:', {
          pattern: pattern.source,
          prompt: sanitized.substring(0, 100),
        });
        sanitized = sanitized.replace(pattern, '');
      }
    }

    return sanitized;
  }

  // Sanitize financial data
  static sanitizeFinancialAmount(amount: unknown): number {
    const num = parseFloat(String(amount));
    
    if (isNaN(num) || !isFinite(num)) {
      throw new Error('Invalid amount: must be a valid number');
    }

    if (num < 0) {
      throw new Error('Invalid amount: must be non-negative');
    }

    if (num > 1000000000) { // 1 billion limit
      throw new Error('Invalid amount: exceeds maximum allowed value');
    }

    return Math.round(num * 100) / 100; // Round to 2 decimal places
  }

  // Sanitize user ID (UUID format)
  static sanitizeUserId(userId: unknown): string {
    if (typeof userId !== 'string') {
      throw new Error('User ID must be a string');
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(userId)) {
      throw new Error('Invalid user ID format');
    }

    return userId.toLowerCase();
  }

  // Rate limit bypass attempt detection
  static detectRateLimitBypass(request: Request): boolean {
    const suspiciousHeaders = [
      'x-forwarded-for',
      'x-real-ip',
      'x-originating-ip',
      'cf-connecting-ip',
    ];

    let suspiciousCount = 0;
    
    for (const header of suspiciousHeaders) {
      const value = request.headers.get(header);
      if (value) {
        const ips = value.split(',').map(ip => ip.trim());
        if (ips.length > 3) { // Multiple forwarded IPs could indicate proxy chains
          suspiciousCount++;
        }
      }
    }

    return suspiciousCount >= 2;
  }
}

// Security-focused input sanitization
// Note: InputSanitizer class moved to top of file to fix import issues

// Validation schemas for common API inputs
export const apiValidationSchemas = {
  aiCoach: z.object({
    userContext: z.string()
      .min(10, 'User context must be at least 10 characters')
      .max(2000, 'User context must not exceed 2000 characters')
      .refine(val => !/<script/i.test(val), 'No script tags allowed'),
  }),

  aiInsights: z.object({
    userId: z.string().uuid('Invalid user ID format'),
  }),

  budgetAI: z.object({
    userId: z.string().uuid('Invalid user ID format'),
    type: z.enum(['recommendations', 'predictions']).optional(),
  }),

  riskPrediction: z.object({
    userId: z.string().uuid('Invalid user ID format').optional(),
    financialData: z.unknown().optional(),
  }),

  financialData: z.object({
    transactions: z.array(z.object({
      amount: z.number().positive().max(1000000),
      category: z.string().min(1).max(50),
      transaction_type: z.enum(['income', 'expense']),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      description: z.string().max(200),
    })).max(1000), // Limit array size
    
    budgets: z.array(z.object({
      category: z.string().min(1).max(50),
      amount: z.number().positive().max(1000000),
    })).max(50),
    
    savingsGoals: z.array(z.object({
      name: z.string().min(1).max(100),
      target_amount: z.number().positive().max(10000000),
      current_amount: z.number().nonnegative().max(10000000),
    })).max(20),
  }),
};

// Request validation middleware
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  sanitizeInputs: boolean = true
) {
  return async function validationMiddleware(
    request: Request,
    handler: (req: Request, validatedData: T) => Promise<Response>
  ): Promise<Response> {
    try {
      // Check request size
      const contentLength = request.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB limit
        return new Response(
          JSON.stringify({ error: 'Request too large' }),
          {
            status: 413,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Parse and validate request body
      const body = await request.json();
      
      // Sanitize inputs if requested
      if (sanitizeInputs && typeof body === 'object' && body !== null) {
        sanitizeObjectInputs(body);
      }

      const validatedData = schema.parse(body);
      
      return await handler(request, validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new Response(
          JSON.stringify({
            error: 'Validation failed',
            details: error.issues.map(e => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      if (error instanceof SyntaxError) {
        return new Response(
          JSON.stringify({ error: 'Invalid JSON format' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      console.error('Validation error:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid request data' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  };
}

// Recursively sanitize object inputs
function sanitizeObjectInputs(obj: unknown): void {
  if (typeof obj !== 'object' || obj === null) {
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        sanitizeObjectInputs(item);
      }
    });
  } else if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        try {
          if (key.toLowerCase().includes('context') || key.toLowerCase().includes('prompt')) {
            obj[key] = InputSanitizer.sanitizeAIPrompt(obj[key]);
          } else {
            obj[key] = InputSanitizer.sanitizeString(obj[key]);
          }
        } catch (error) {
          console.warn(`Failed to sanitize field ${key}:`, error);
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObjectInputs(obj[key]);
      }
    });
  }
}

// SQL injection prevention (though Supabase client handles this)
export function validateSQLInput(input: string): boolean {
  const sqlInjectionPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
    /[';][\s]*--/g,
    /\/\*[\s\S]*?\*\//g,
    /[';][\s]*#/g,
  ];

  return !sqlInjectionPatterns.some(pattern => pattern.test(input));
}