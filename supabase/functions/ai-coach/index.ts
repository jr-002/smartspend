
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Groq from 'https://esm.sh/groq-sdk@0.7.0';

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
}

const groq = new Groq({
  apiKey: Deno.env.get('GROQ_API_KEY'),
});

async function generateFinancialAdvice(userContext: string): Promise<string> {
  try {
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
      max_tokens: 800,
    });

    return completion.choices[0]?.message?.content || 'I apologize, but I\'m unable to provide advice at this time. Please try again later or consider consulting with a human financial advisor for personalized guidance.';
  } catch (error) {
    console.error('Error generating financial advice:', error);
    return 'I\'m experiencing technical difficulties right now. Please try again in a few moments, or consider speaking with a qualified financial advisor for immediate assistance.';
  }
}

serve(async (req) => {
  const startTime = Date.now();
  
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
    const { userContext } = await req.json();

    if (!userContext || typeof userContext !== 'string') {
      return new Response(JSON.stringify({ error: 'User context is required and must be a string' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (userContext.length > 2000) {
      return new Response(JSON.stringify({ error: 'User context is too long. Please keep it under 2000 characters.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const advice = await generateFinancialAdvice(userContext);

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
    console.error('Error in ai-coach function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      advice: 'I apologize, but I\'m experiencing technical difficulties. Please try again later.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
