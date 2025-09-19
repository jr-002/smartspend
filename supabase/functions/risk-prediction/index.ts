import { createClient } from 'npm:@supabase/supabase-js@2.7.1';
import Groq from 'npm:groq-sdk@0.7.0';

// Enhanced input validation
interface ValidatedRequest {
  userId?: string;
  financialData?: FinancialRiskData;
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

function validateFinancialData(data: unknown): FinancialRiskData | undefined {
  if (!data || typeof data !== 'object') {
    return undefined;
  }

  // Basic validation for financial data structure
  const financialData = data as Record<string, unknown>;
  
  // Validate transactions array if present
  if (financialData.transactions && Array.isArray(financialData.transactions)) {
    const validTransactions = financialData.transactions.filter((t: unknown) => 
      t && typeof t === 'object' && 
      typeof (t as Record<string, unknown>).amount === 'number' && 
      typeof (t as Record<string, unknown>).category === 'string'
    );
    
    if (validTransactions.length !== financialData.transactions.length) {
      console.warn('Some transactions were filtered out due to invalid format');
    }
    
    financialData.transactions = validTransactions;
  }

  return financialData as FinancialRiskData;
}

function validateRequest(body: unknown): ValidatedRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be a valid JSON object');
  }

  const { userId, financialData } = body as Record<string, unknown>;

  // At least one of userId or financialData must be provided
  if (!userId && !financialData) {
    throw new Error('Either userId or financialData must be provided');
  }

  const result: ValidatedRequest = {};

  if (userId) {
    result.userId = sanitizeUserId(userId);
  }

  if (financialData) {
    result.financialData = validateFinancialData(financialData);
  }

  return result;
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
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' data: https:; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self'",
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

interface FinancialRiskData {
  profile?: {
    monthly_income: number;
    currency: string;
  };
  transactions: Array<{
    amount: number;
    category: string;
    transaction_type: 'income' | 'expense';
    date: string;
  }>;
  budgets?: Array<{
    category: string;
    amount: number;
    spent?: number;
    utilization?: number;
  }>;
  savingsGoals?: Array<{
    target_amount: number;
    current_amount: number;
  }>;
  bills?: Array<{
    amount: number;
    status: string;
  }>;
  debts?: Array<{
    balance: number;
  }>;
  totalDebt?: number;
  totalSavings?: number;
  monthlyExpenses?: number;
  monthlyIncome?: number;
  currency?: string;
  upcomingBills?: Array<{
    amount: number;
    status: string;
  }>;
  budgetUtilization?: Array<{
    category: string;
    utilization: number;
  }>;
}

async function analyzeFinancialRisk(financialData: FinancialRiskData): Promise<string> {
  try {
    const dataString = JSON.stringify(financialData);
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a financial risk assessment expert. Analyze the provided financial data and provide:
1. A comprehensive risk analysis identifying potential financial vulnerabilities
2. A financial health score out of 100 (higher is better)
3. Specific risk factors and their severity levels
4. Actionable recommendations to mitigate identified risks

Format your response as a structured analysis that includes the numerical health score prominently.`,
        },
        {
          role: 'user',
          content: `Please analyze this financial data and provide a comprehensive risk assessment with a health score out of 100: ${dataString}`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 2000,
    });

    return completion.choices[0]?.message?.content || 'Unable to analyze risk at this time. Please ensure you have sufficient financial data and try again.';
  } catch (error) {
    console.error('Error analyzing financial risk:', error);
    return 'Risk analysis is temporarily unavailable. Please try again later or consult with a financial advisor for a comprehensive risk assessment.';
  }
}

function calculateHealthScore(analysis: string): number {
  try {
    const scoreMatches = analysis.match(/(?:score|health|rating).*?(\d{1,3}(?:\.\d)?)/gi);
    
    if (scoreMatches && scoreMatches.length > 0) {
      for (const match of scoreMatches) {
        const numberMatch = match.match(/(\d{1,3}(?:\.\d)?)/);
        if (numberMatch) {
          const score = parseFloat(numberMatch[1]);
          if (score >= 0 && score <= 100) {
            return score;
          }
        }
      }
    }

    const lowRiskWords = ['excellent', 'strong', 'healthy', 'good', 'stable', 'low risk'];
    const mediumRiskWords = ['moderate', 'fair', 'average', 'caution', 'medium risk'];
    const highRiskWords = ['poor', 'high risk', 'concerning', 'dangerous', 'critical', 'urgent'];

    const lowerAnalysis = analysis.toLowerCase();
    
    let score = 50;
    
    const lowRiskCount = lowRiskWords.filter(word => lowerAnalysis.includes(word)).length;
    const mediumRiskCount = mediumRiskWords.filter(word => lowerAnalysis.includes(word)).length;
    const highRiskCount = highRiskWords.filter(word => lowerAnalysis.includes(word)).length;

    if (lowRiskCount > highRiskCount && lowRiskCount > mediumRiskCount) {
      score = 75 + (lowRiskCount * 5);
    } else if (highRiskCount > lowRiskCount && highRiskCount > mediumRiskCount) {
      score = 35 - (highRiskCount * 5);
    } else if (mediumRiskCount > 0) {
      score = 55;
    }

    return Math.min(Math.max(score, 0), 100);
  } catch (error) {
    console.error('Error calculating health score:', error);
    return 50;
  }
}

Deno.serve(async (req) => {
  const startTime = Date.now();
  
  // Enhanced security logging
  console.log(`Risk Prediction Request: ${req.method} ${req.url}`, {
    timestamp: new Date().toISOString(),
    userAgent: req.headers.get('user-agent'),
    ip: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'
  });

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Apply rate limiting: 2 requests per 5 minutes per identifier
  const identifier = getClientIdentifier(req);
  const rl = rateLimit(`risk-prediction:${identifier}`, 2, 5 * 60_000);
  if (!rl.allowed) {
    const retryAfter = Math.ceil((rl.reset - Date.now()) / 1000);
    
    // Log rate limit exceeded
    console.warn('Rate limit exceeded', {
      identifier,
      endpoint: 'risk-prediction',
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

    if (validatedData.userId && !validatedData.financialData) {
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

      const [transactionsResult, budgetsResult, savingsGoalsResult, billsResult, debtsResult, profileResult] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', validatedData.userId).order('date', { ascending: false }).limit(100),
        supabase.from('budgets').select('*').eq('user_id', validatedData.userId),
        supabase.from('savings_goals').select('*').eq('user_id', validatedData.userId),
        supabase.from('bills').select('*').eq('user_id', validatedData.userId),
        supabase.from('debts').select('*').eq('user_id', validatedData.userId),
        supabase.from('profiles').select('*').eq('id', validatedData.userId).single()
      ]);

      if (transactionsResult.error || profileResult.error) {
        console.error('Database error:', { transactionsResult, profileResult });
        return new Response(JSON.stringify({ error: 'Failed to fetch financial data' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const currentMonth = new Date().toISOString().slice(0, 7);
      const currentMonthTransactions = transactionsResult.data.filter(t => t.date.startsWith(currentMonth) && t.transaction_type === 'expense');
      
      const budgetSpending = currentMonthTransactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

      const budgetsWithSpent = (budgetsResult.data || []).map(budget => ({
        ...budget,
        spent: budgetSpending[budget.category] || 0,
        utilization: budget.amount > 0 ? (budgetSpending[budget.category] || 0) / budget.amount : 0
      }));

      const comprehensiveFinancialData = {
        profile: profileResult.data,
        transactions: transactionsResult.data,
        budgets: budgetsWithSpent,
        savingsGoals: savingsGoalsResult.data || [],
        bills: billsResult.data || [],
        debts: debtsResult.data || [],
        monthlyIncome: profileResult.data?.monthly_income || 0,
        currency: profileResult.data?.currency || 'USD',
        totalDebt: (debtsResult.data || []).reduce((sum, debt) => sum + debt.balance, 0),
        totalSavings: (savingsGoalsResult.data || []).reduce((sum, goal) => sum + goal.current_amount, 0),
        monthlyExpenses: currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0),
        upcomingBills: (billsResult.data || []).filter(bill => bill.status === 'pending'),
        budgetUtilization: budgetsWithSpent.map(b => ({ category: b.category, utilization: b.utilization }))
      };

      const analysis = await analyzeFinancialRisk(comprehensiveFinancialData);
      const healthScore = calculateHealthScore(analysis);

      return new Response(JSON.stringify({
        analysis: analysis,
        healthScore: healthScore,
        analysisData: {
          totalDebt: comprehensiveFinancialData.totalDebt,
          totalSavings: comprehensiveFinancialData.totalSavings,
          monthlyExpenses: comprehensiveFinancialData.monthlyExpenses,
          debtToIncomeRatio: comprehensiveFinancialData.monthlyIncome > 0 ? 
            (comprehensiveFinancialData.totalDebt / (comprehensiveFinancialData.monthlyIncome * 12)) * 100 : 0,
          savingsRate: comprehensiveFinancialData.monthlyIncome > 0 ?
            ((comprehensiveFinancialData.monthlyIncome - comprehensiveFinancialData.monthlyExpenses) / comprehensiveFinancialData.monthlyIncome) * 100 : 0
        }
      }), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(rl.limit),
          'X-RateLimit-Remaining': String(rl.remaining),
          'X-RateLimit-Reset': String(rl.reset)
        },
      });
    }

    if (!validatedData.financialData) {
      return new Response(JSON.stringify({ error: 'Financial data is required when userId is not provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const analysis = await analyzeFinancialRisk(validatedData.financialData);

    return new Response(JSON.stringify({ analysis }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(rl.limit),
        'X-RateLimit-Remaining': String(rl.remaining),
        'X-RateLimit-Reset': String(rl.reset)
      },
    });

  } catch (error) {
    console.error('Error in risk-prediction function:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      identifier,
    });
    
    // Return appropriate error response based on error type
    if (error instanceof Error && error.message.includes('validation')) {
      return new Response(JSON.stringify({ 
        error: error.message,
        analysis: 'Unable to analyze risk due to invalid input data.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      analysis: 'Risk analysis is temporarily unavailable due to technical difficulties.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
