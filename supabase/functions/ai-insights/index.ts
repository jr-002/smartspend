import { createClient } from 'npm:@supabase/supabase-js@2.7.1';
import Groq from 'npm:groq-sdk@0.7.0';

// Environment validation
function validateEnvironment() {
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'GROQ_API_KEY'];
  const missing = required.filter(key => !Deno.env.get(key));
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Enhanced input validation
interface ValidatedRequest {
  userId: string;
}

function sanitizeUserId(userId: unknown): string {
  if (typeof userId !== 'string') {
    throw new Error('User ID must be a string');
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(userId)) {
    throw new Error('Invalid user ID format - must be a valid UUID');
  }

  return userId.toLowerCase();
}

function validateRequest(body: unknown): ValidatedRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be a valid JSON object');
  }

  const { userId } = body as Record<string, unknown>;

  if (!userId) {
    throw new Error('userId is required');
  }

  return {
    userId: sanitizeUserId(userId),
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
    throw new Error('GROQ_API_KEY environment variable is required');
  }
  return new Groq({ apiKey });
}

interface FinancialData {
  transactions: Array<{
    amount: number;
    category: string;
    transaction_type: 'income' | 'expense';
    date: string;
    description: string;
  }>;
  budgets: Array<{
    category: string;
    amount: number;
    spent?: number;
  }>;
  savingsGoals: Array<{
    name: string;
    target_amount: number;
    current_amount: number;
    deadline: string;
  }>;
  bills: Array<{
    name: string;
    amount: number;
    due_date: string;
    status: string;
  }>;
  monthlyIncome: number;
  currency: string;
}

interface AIInsight {
  id: string;
  type: 'spending' | 'saving' | 'investment' | 'budget' | 'goal';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action: string;
  priority: number;
}

async function generateFinancialInsights(data: FinancialData): Promise<AIInsight[]> {
  try {
    const groq = initializeGroq();
    const prompt = createFinancialAnalysisPrompt(data);
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional financial advisor AI. Analyze the provided financial data and generate actionable insights. Return your response as a valid JSON array of insights with the specified structure."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 4000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from Groq API');
    }

    try {
      const insights = JSON.parse(response) as Array<{
        type?: string;
        title?: string;
        description?: string;
        impact?: 'high' | 'medium' | 'low';
        action?: string;
        priority?: number;
      }>;
      
      if (!Array.isArray(insights)) {
        throw new Error('Response is not an array');
      }
      
      return insights.map((insight, index: number): AIInsight => ({
        id: `ai-${Date.now()}-${index}`,
        type: (insight.type as 'spending' | 'saving' | 'investment' | 'budget' | 'goal') || 'spending',
        title: insight.title || 'Financial Insight',
        description: insight.description || '',
        impact: insight.impact || 'medium',
        action: insight.action || '',
        priority: insight.priority || index + 1
      })) as AIInsight[];
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', response);
      return getFallbackInsights(data);
    }

  } catch (error) {
    console.error('Error generating AI insights:', error);
    return getFallbackInsights(data);
  }
}

function createFinancialAnalysisPrompt(data: FinancialData): string {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7);
  
  const currentMonthTransactions = data.transactions.filter(t => t.date.startsWith(currentMonth));
  const lastMonthTransactions = data.transactions.filter(t => t.date.startsWith(lastMonth));
  
  const currentMonthSpending = currentMonthTransactions
    .filter(t => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const lastMonthSpending = lastMonthTransactions
    .filter(t => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const categorySpending = currentMonthTransactions
    .filter(t => t.transaction_type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  return `
Analyze this financial data and provide 3-5 actionable insights in JSON format:

FINANCIAL DATA:
- Monthly Income: ${data.currency} ${data.monthlyIncome}
- Current Month Spending: ${data.currency} ${currentMonthSpending}
- Last Month Spending: ${data.currency} ${lastMonthSpending}
- Spending Change: ${((currentMonthSpending - lastMonthSpending) / lastMonthSpending * 100).toFixed(1)}%

CATEGORY BREAKDOWN:
${Object.entries(categorySpending).map(([cat, amount]) => `- ${cat}: ${data.currency} ${amount}`).join('\n')}

BUDGETS:
${data.budgets.map(b => `- ${b.category}: ${data.currency} ${b.amount} (spent: ${data.currency} ${b.spent || 0})`).join('\n')}

SAVINGS GOALS:
${data.savingsGoals.map(g => `- ${g.name}: ${((g.current_amount / g.target_amount) * 100).toFixed(1)}% complete`).join('\n')}

UPCOMING BILLS:
${data.bills.filter(b => b.status === 'pending').map(b => `- ${b.name}: ${data.currency} ${b.amount} (due: ${b.due_date})`).join('\n')}

Return ONLY a JSON array with this exact structure:
[
  {
    "type": "spending|saving|investment|budget|goal",
    "title": "Brief insight title",
    "description": "Detailed analysis of the financial pattern or issue",
    "impact": "high|medium|low",
    "action": "Specific actionable recommendation",
    "priority": 1
  }
]

Focus on:
1. Spending patterns and anomalies
2. Budget performance
3. Savings opportunities
4. Bill management
5. Goal progress

Make insights specific to the data provided and include actual numbers where relevant.
`;
}

function getFallbackInsights(data: FinancialData): AIInsight[] {
  const insights: AIInsight[] = [];
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = data.transactions
    .filter(t => t.transaction_type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);
  
  if (currentMonthExpenses > data.monthlyIncome * 0.8) {
    insights.push({
      id: 'fallback-1',
      type: 'spending',
      title: 'High Spending Alert',
      description: `You've spent ${data.currency} ${currentMonthExpenses.toLocaleString()} this month, which is ${((currentMonthExpenses / data.monthlyIncome) * 100).toFixed(1)}% of your monthly income.`,
      impact: 'high',
      action: 'Review your expenses and identify areas where you can cut back to maintain a healthy savings rate.',
      priority: 1
    });
  }
  
  data.budgets.forEach((budget, index) => {
    const spent = budget.spent || 0;
    if (spent > budget.amount * 0.9) {
      insights.push({
        id: `fallback-budget-${index}`,
        type: 'budget',
        title: `${budget.category} Budget Alert`,
        description: `You've used ${((spent / budget.amount) * 100).toFixed(1)}% of your ${budget.category} budget.`,
        impact: spent > budget.amount ? 'high' : 'medium',
        action: `Monitor your ${budget.category} spending closely for the rest of the month.`,
        priority: insights.length + 1
      });
    }
  });
  
  return insights.slice(0, 4);
}

Deno.serve(async (req) => {
  const startTime = Date.now();
  
  try {
    validateEnvironment();
  } catch (error) {
    console.error('Environment validation failed:', error);
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
  
  // Enhanced security logging
  console.log(`AI Insights Request: ${req.method} ${req.url}`, {
    timestamp: new Date().toISOString(),
    userAgent: req.headers.get('user-agent'),
    ip: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'
  });

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Apply rate limiting: 3 requests per 5 minutes per identifier
  const identifier = getClientIdentifier(req);
  const rl = rateLimit(`ai-insights:${identifier}`, 3, 5 * 60_000);
  if (!rl.allowed) {
    const retryAfter = Math.ceil((rl.reset - Date.now()) / 1000);
    
    // Log rate limit exceeded
    console.warn('Rate limit exceeded', {
      identifier,
      endpoint: 'ai-insights',
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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      supabase.auth.setSession({
        access_token: authHeader.replace('Bearer ', ''),
        refresh_token: '',
      });
    }

    const [transactionsResult, budgetsResult, savingsGoalsResult, billsResult, profileResult] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', validatedData.userId).order('date', { ascending: false }),
      supabase.from('budgets').select('*').eq('user_id', validatedData.userId),
      supabase.from('savings_goals').select('*').eq('user_id', validatedData.userId),
      supabase.from('bills').select('*').eq('user_id', validatedData.userId),
      supabase.from('profiles').select('*').eq('id', validatedData.userId).limit(1)
    ]);

    if (transactionsResult.error || budgetsResult.error || savingsGoalsResult.error || billsResult.error) {
      console.error('Database error:', { transactionsResult, budgetsResult, savingsGoalsResult, billsResult, profileResult });
      return new Response(JSON.stringify({ error: 'Failed to fetch financial data' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle missing profile gracefully
    const profile = profileResult.data?.[0] || null;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthTransactions = transactionsResult.data.filter(t => t.date.startsWith(currentMonth) && t.transaction_type === 'expense');
    
    const budgetSpending = currentMonthTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const budgetsWithSpent = budgetsResult.data.map(budget => ({
      ...budget,
      spent: budgetSpending[budget.category] || 0
    }));

    const financialData: FinancialData = {
      transactions: transactionsResult.data.map(t => ({
        amount: t.amount,
        category: t.category,
        transaction_type: t.transaction_type,
        date: t.date,
        description: t.description
      })),
      budgets: budgetsWithSpent,
      savingsGoals: savingsGoalsResult.data,
      bills: billsResult.data,
      monthlyIncome: profile?.monthly_income || 0,
      currency: profile?.currency || 'USD'
    };

    const insights = await generateFinancialInsights(financialData);

    return new Response(JSON.stringify({ insights }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(rl.limit),
        'X-RateLimit-Remaining': String(rl.remaining),
        'X-RateLimit-Reset': String(rl.reset)
      },
    });

  } catch (error) {
    console.error('Error in ai-insights function:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      identifier,
    });
    
    // Return appropriate error response based on error type
    if (error instanceof Error && error.message.includes('validation')) {
      return new Response(JSON.stringify({ 
        error: error.message,
        insights: []
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
