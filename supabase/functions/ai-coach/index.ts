
import { serve } from "./deps.ts";
import type { Request } from "./deps.ts";
import Groq from 'npm:groq-sdk@0.7.0';

// Environment validation
function validateEnvironment() {
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'GROQ_API_KEY'];
  const missing = required.filter(key => !Deno.env.get(key));
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Enhanced input validation and sanitization
interface ValidatedRequest {
  userContext: string;
}

// Input sanitization utility
function sanitizeString(input: string, maxLength: number = 2000): string {
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
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, '');
}

function sanitizeAIPrompt(prompt: string): string {
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

  let sanitized = sanitizeString(prompt, 5000);

  // Log and clean potential injection attempts
  for (const pattern of dangerousPatterns) {
    if (pattern.test(sanitized)) {
      console.warn('Potential prompt injection detected:', {
        pattern: pattern.source,
        prompt: sanitized.substring(0, 100),
        timestamp: new Date().toISOString(),
      });
      sanitized = sanitized.replace(pattern, '');
    }
  }

  return sanitized;
}

// Enhanced request validation
function validateRequest(body: unknown): ValidatedRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be a valid JSON object');
  }

  const { userContext } = body as Record<string, unknown>;

  if (!userContext || typeof userContext !== 'string') {
    throw new Error('userContext is required and must be a string');
  }

  if (userContext.length < 10) {
    throw new Error('userContext must be at least 10 characters long');
  }

  if (userContext.length > 2000) {
    throw new Error('userContext must not exceed 2000 characters');
  }

  // Sanitize the user context
  const sanitizedContext = sanitizeAIPrompt(userContext);

  if (sanitizedContext.length < 5) {
    throw new Error('userContext contains insufficient valid content after sanitization');
  }

  return {
    userContext: sanitizedContext,
  };
}

// Enhanced security headers with comprehensive protection
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self'",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'cross-origin',
};

// Simple in-memory rate limiter per identifier (user or IP)
type RateEntry = { count: number; reset: number };
const rateStore = new Map<string, RateEntry>();

function getClientIdentifier(req: Request): string {
  const auth = req.headers.get('authorization') || '';
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || '').split(',')[0].trim();
  if (auth.startsWith('Bearer ')) {
    const token = auth.replace('Bearer ', '');
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      return payload.sub || ip || 'anonymous';
    } catch {
      return ip || 'anonymous';
    }
  }
  return ip || 'anonymous';
}

function rateLimit(key: string, limit: number, windowMs: number) {
  try {
    const now = Date.now();
    const entry = rateStore.get(key);
    if (!entry || now > entry.reset) {
      const reset = now + windowMs;
      rateStore.set(key, { count: 1, reset });
      return { allowed: true, remaining: limit - 1, reset, limit };
    }
    if (entry.count >= limit) {
      return { allowed: false, remaining: 0, reset: entry.reset, limit };
    }
    entry.count += 1;
    return { allowed: true, remaining: Math.max(0, limit - entry.count), reset: entry.reset, limit };
  } catch (error) {
    console.warn('Rate limiting failed, allowing request:', error);
    return { allowed: true, remaining: limit - 1, reset: Date.now() + windowMs, limit };
  }
}

// Initialize Groq with validation
function initializeGroq() {
  const apiKey = Deno.env.get('GROQ_API_KEY');
  if (!apiKey) {
    console.error('GROQ_API_KEY environment variable is missing');
    throw new Error('AI service configuration error - API key not found');
  }
  
  if (apiKey.length < 10) {
    console.error('GROQ_API_KEY appears to be invalid (too short)');
    throw new Error('AI service configuration error - invalid API key');
  }
  
  return new Groq({ apiKey });
}

async function generateFinancialAdvice(userContext: string): Promise<string> {
  try {
    let groq;
    try {
      groq = initializeGroq();
    } catch (initError) {
      console.error('Failed to initialize Groq:', initError);
      return 'I apologize, but the AI coaching service is currently unavailable due to a configuration issue. Please contact support or try again later.';
    }
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a knowledgeable financial advisor. Provide specific, actionable advice based on the user\'s financial situation. Be professional, empathetic, and offer practical steps they can take to improve their financial health.',
        },
        {
          role: 'user',
          content: userContext,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      maxTokens: 800,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.warn('Groq API returned empty response');
      return 'I apologize, but I\'m unable to provide advice at this time. Please try again later or consider consulting with a human financial advisor for personalized guidance.';
    }
    
    return content;
  } catch (error) {
    console.error('Error generating financial advice:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    if (error instanceof Error && error.message.includes('API key')) {
      return 'The AI coaching service is currently unavailable due to a configuration issue. Please contact support.';
    }
    
    if (error instanceof Error && error.message.includes('rate limit')) {
      return 'The AI service is currently experiencing high demand. Please try again in a few minutes.';
    }
    
    return 'I\'m experiencing technical difficulties right now. Please try again in a few moments, or consider speaking with a qualified financial advisor for immediate assistance.';
  }
}

Deno.serve(async (req: Request) => {
  const startTime = Date.now();
  
  try {
    validateEnvironment();
  } catch (error) {
    console.error('Environment validation failed:', error);
    return new Response(JSON.stringify({ 
      error: 'Server configuration error',
      advice: 'I apologize, but the AI service is currently unavailable due to configuration issues. Please contact support or try again later.'
    }), {
      status: 500,
      headers: corsHeaders,
    });
  }
  
  // Enhanced security logging
  console.log(`AI Coach Request: ${req.method} ${req.url}`, {
    timestamp: new Date().toISOString(),
    userAgent: req.headers.get('user-agent'),
    ip: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'
  });

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Apply rate limiting: 5 requests per minute per identifier
  const identifier = getClientIdentifier(req);
  const rl = rateLimit(`ai-coach:${identifier}`, 5, 60_000);
  if (!rl.allowed) {
    const retryAfter = Math.ceil((rl.reset - Date.now()) / 1000);
    
    // Log rate limit exceeded
    console.warn('Rate limit exceeded', {
      identifier,
      endpoint: 'ai-coach',
      timestamp: new Date().toISOString(),
      retryAfter
    });
    
    return new Response(JSON.stringify({ error: 'Too Many Requests. Please try again later.' }), {
      status: 429,
      headers: { 
        ...corsHeaders, 
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(rl.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(rl.reset)
      },
    });
  }

  try {
    // Enhanced request validation and sanitization
    const requestBody = await req.json();
    const validatedData = validateRequest(requestBody);

    const advice = await generateFinancialAdvice(validatedData.userContext);

    return new Response(JSON.stringify({ advice }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(rl.limit),
        'X-RateLimit-Remaining': String(rl.remaining),
        'X-RateLimit-Reset': String(rl.reset)
      },
    });


  } catch (error) {
    console.error('Error in ai-coach function:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      identifier,
    });
    
    // Return appropriate error response based on error type
    if (error instanceof Error && error.message.includes('Validation')) {
      return new Response(JSON.stringify({ 
        error: error.message,
        advice: 'Please check your input and try again with a valid question.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      advice: 'I apologize, but I\'m experiencing technical difficulties. Please try again later.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
