import { z } from 'zod';

// Enhanced validation schemas for API endpoints
export const aiCoachRequestSchema = z.object({
  userContext: z.string()
    .min(10, 'User context must be at least 10 characters')
    .max(2000, 'User context must not exceed 2000 characters')
    .refine(val => !/<script/i.test(val), 'No script tags allowed')
    .refine(val => !/javascript:/i.test(val), 'No javascript protocols allowed')
    .refine(val => !/on\w+\s*=/i.test(val), 'No event handlers allowed')
    .transform(val => val.trim()),
});

export const aiInsightsRequestSchema = z.object({
  userId: z.string()
    .uuid('Invalid user ID format')
    .min(1, 'User ID is required'),
});

export const budgetAIRequestSchema = z.object({
  userId: z.string()
    .uuid('Invalid user ID format')
    .min(1, 'User ID is required'),
  type: z.enum(['recommendations', 'predictions']).optional(),
});

export const riskPredictionRequestSchema = z.object({
  userId: z.string()
    .uuid('Invalid user ID format')
    .min(1, 'User ID is required')
    .optional(),
  financialData: z.object({
    transactions: z.array(z.object({
      amount: z.number().positive().max(1000000),
      category: z.string().min(1).max(50),
      transaction_type: z.enum(['income', 'expense']),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      description: z.string().max(200),
    })).max(1000).optional(),
    budgets: z.array(z.object({
      category: z.string().min(1).max(50),
      amount: z.number().positive().max(1000000),
    })).max(50).optional(),
    monthlyIncome: z.number().min(0).max(10000000).optional(),
  }).optional(),
});

// Input sanitization utilities
export class InputSanitizer {
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
      .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
  }

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
}

// Request validation middleware
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async function(requestBody: unknown): Promise<T> {
    try {
      // Check if body is an object
      if (typeof requestBody !== 'object' || requestBody === null) {
        throw new Error('Request body must be a valid JSON object');
      }

      // Sanitize string inputs recursively
      const sanitizedBody = sanitizeObjectInputs(requestBody);
      
      // Validate against schema
      return schema.parse(sanitizedBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map(issue => 
          `${issue.path.join('.')}: ${issue.message}`
        ).join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      throw error;
    }
  };
}

// Recursively sanitize object inputs
function sanitizeObjectInputs(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObjectInputs(item));
  }

  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      try {
        if (key.toLowerCase().includes('context') || key.toLowerCase().includes('prompt')) {
          sanitized[key] = InputSanitizer.sanitizeAIPrompt(value);
        } else {
          sanitized[key] = InputSanitizer.sanitizeString(value);
        }
      } catch (error) {
        console.warn(`Failed to sanitize field ${key}:`, error);
        sanitized[key] = value;
      }
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObjectInputs(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}