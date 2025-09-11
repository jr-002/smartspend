import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
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

interface TransactionData {
  id: string;
  amount: number;
  category: string;
  date: string;
  transaction_type: 'income' | 'expense';
  description: string;
}

interface BudgetPrediction {
  category: string;
  suggestedAmount: number;
  confidence: number;
  reasoning: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonalFactor: number;
}

interface BudgetRecommendation {
  totalBudget: number;
  categories: BudgetPrediction[];
  savingsRate: number;
  emergencyFund: number;
  insights: string[];
}

async function generateBudgetPredictions(
  transactions: TransactionData[],
  monthlyIncome: number,
  currency: string = 'USD'
): Promise<BudgetRecommendation> {
  try {
    const analysisData = analyzeTransactionPatterns(transactions);
    const prompt = createBudgetAnalysisPrompt(analysisData, monthlyIncome, currency);
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional financial advisor AI specializing in budget optimization. Analyze transaction data and provide intelligent budget recommendations. Return your response as valid JSON with the specified structure."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 6000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from Groq API');
    }

    const recommendation = JSON.parse(response);
    return validateAndFormatRecommendation(recommendation, monthlyIncome);

  } catch (error) {
    console.error('Error generating budget predictions:', error);
    return getFallbackBudgetRecommendation(transactions, monthlyIncome);
  }
}

function analyzeTransactionPatterns(transactions: TransactionData[]) {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  const recentTransactions = transactions.filter(t => 
    new Date(t.date) >= threeMonthsAgo && t.transaction_type === 'expense'
  );
  
  const olderTransactions = transactions.filter(t => 
    new Date(t.date) >= sixMonthsAgo && 
    new Date(t.date) < threeMonthsAgo && 
    t.transaction_type === 'expense'
  );

  const recentCategorySpending = calculateCategorySpending(recentTransactions);
  const olderCategorySpending = calculateCategorySpending(olderTransactions);
  const categoryTrends = calculateSpendingTrends(recentCategorySpending, olderCategorySpending);
  const monthlyAverages = calculateMonthlyAverages(recentTransactions);

  return {
    recentCategorySpending,
    olderCategorySpending,
    categoryTrends,
    monthlyAverages,
    totalRecentSpending: Object.values(recentCategorySpending).reduce((sum, amount) => sum + amount, 0),
    transactionCount: recentTransactions.length,
    averageTransactionAmount: recentTransactions.length > 0 
      ? recentTransactions.reduce((sum, t) => sum + t.amount, 0) / recentTransactions.length 
      : 0
  };
}

function calculateCategorySpending(transactions: TransactionData[]): Record<string, number> {
  return transactions.reduce((acc, transaction) => {
    acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);
}

function calculateSpendingTrends(
  recent: Record<string, number>, 
  older: Record<string, number>
): Record<string, { trend: 'increasing' | 'decreasing' | 'stable'; change: number }> {
  const trends: Record<string, { trend: 'increasing' | 'decreasing' | 'stable'; change: number }> = {};
  const allCategories = new Set([...Object.keys(recent), ...Object.keys(older)]);

  allCategories.forEach(category => {
    const recentAmount = recent[category] || 0;
    const olderAmount = older[category] || 0;

    if (olderAmount === 0) {
      trends[category] = { trend: 'stable', change: 0 };
      return;
    }

    const change = ((recentAmount - olderAmount) / olderAmount) * 100;
    
    if (Math.abs(change) < 10) {
      trends[category] = { trend: 'stable', change };
    } else if (change > 0) {
      trends[category] = { trend: 'increasing', change };
    } else {
      trends[category] = { trend: 'decreasing', change };
    }
  });

  return trends;
}

function calculateMonthlyAverages(transactions: TransactionData[]): Record<string, number> {
  const monthlyData: Record<string, Record<string, number>> = {};

  transactions.forEach(transaction => {
    const monthKey = transaction.date.slice(0, 7);
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {};
    }
    monthlyData[monthKey][transaction.category] = 
      (monthlyData[monthKey][transaction.category] || 0) + transaction.amount;
  });

  const categoryAverages: Record<string, number> = {};
  const monthCount = Object.keys(monthlyData).length || 1;

  Object.values(monthlyData).forEach(monthData => {
    Object.entries(monthData).forEach(([category, amount]) => {
      categoryAverages[category] = (categoryAverages[category] || 0) + amount;
    });
  });

  Object.keys(categoryAverages).forEach(category => {
    categoryAverages[category] = categoryAverages[category] / monthCount;
  });

  return categoryAverages;
}

function createBudgetAnalysisPrompt(
  analysisData: {
    recentCategorySpending: Record<string, number>;
    olderCategorySpending: Record<string, number>;
    categoryTrends: Record<string, { trend: 'increasing' | 'decreasing' | 'stable'; change: number }>;
    monthlyAverages: Record<string, number>;
    totalRecentSpending: number;
    transactionCount: number;
    averageTransactionAmount: number;
  },
  monthlyIncome: number,
  currency: string
): string {
  return `
Analyze this financial data and provide intelligent budget recommendations in JSON format:

INCOME: ${currency} ${monthlyIncome.toLocaleString()}

RECENT SPENDING ANALYSIS (Last 3 months):
${Object.entries(analysisData.recentCategorySpending)
  .map(([cat, amount]) => `- ${cat}: ${currency} ${(amount as number).toLocaleString()}`)
  .join('\n')}

SPENDING TRENDS:
${Object.entries(analysisData.categoryTrends)
  .map(([cat, trend]) => {
    const { trend: trendType, change } = trend as { trend: string; change: number };
    return `- ${cat}: ${trendType} (${change.toFixed(1)}% change)`;
  })
  .join('\n')}

MONTHLY AVERAGES:
${Object.entries(analysisData.monthlyAverages)
  .map(([cat, avg]) => `- ${cat}: ${currency} ${(avg as number).toLocaleString()}`)
  .join('\n')}

Return ONLY a JSON object with this exact structure:
{
  "totalBudget": number,
  "categories": [
    {
      "category": "string",
      "suggestedAmount": number,
      "confidence": number (0-100),
      "reasoning": "string explaining the recommendation",
      "trend": "increasing|decreasing|stable",
      "seasonalFactor": number (0.5-2.0)
    }
  ],
  "savingsRate": number (percentage),
  "emergencyFund": number,
  "insights": [
    "string insights about spending patterns and recommendations"
  ]
}

Guidelines:
1. Recommend 50/30/20 rule as baseline (50% needs, 30% wants, 20% savings)
2. Adjust based on actual spending patterns and trends
3. Provide confidence scores based on data quality
4. Include 3-5 actionable insights
5. Ensure total budget doesn't exceed 80% of income for safety
6. Recommend emergency fund of 3-6 months expenses

Focus on practical, achievable recommendations based on the user's actual spending behavior.
`;
}

function validateAndFormatRecommendation(
  recommendation: {
    totalBudget: number;
    categories: Array<{
      category: string;
      suggestedAmount: number;
      confidence: number;
      reasoning: string;
      trend: 'increasing' | 'decreasing' | 'stable';
      seasonalFactor: number;
    }>;
    savingsRate: number;
    emergencyFund: number;
    insights: string[];
  },
  monthlyIncome: number
): BudgetRecommendation {
  const maxBudget = monthlyIncome * 0.8;
  if (recommendation.totalBudget > maxBudget) {
    recommendation.totalBudget = maxBudget;
    
    const reductionFactor = maxBudget / recommendation.totalBudget;
    recommendation.categories = recommendation.categories.map((cat) => ({
      ...cat,
      suggestedAmount: cat.suggestedAmount * reductionFactor
    }));
  }

  if (recommendation.savingsRate < 10) {
    recommendation.savingsRate = 10;
  }

  const monthlyExpenses = recommendation.totalBudget;
  if (recommendation.emergencyFund < monthlyExpenses * 3) {
    recommendation.emergencyFund = monthlyExpenses * 3;
  }

  return recommendation;
}

function getFallbackBudgetRecommendation(
  transactions: TransactionData[],
  monthlyIncome: number
): BudgetRecommendation {
  const recentTransactions = transactions.filter(t => {
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    return new Date(t.date) >= threeMonthsAgo && t.transaction_type === 'expense';
  });

  const categorySpending = calculateCategorySpending(recentTransactions);
  const totalSpending = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);
  const monthlyAverage = totalSpending / 3;

  const categories: BudgetPrediction[] = Object.entries(categorySpending).map(([category, amount]) => {
    const monthlyAmount = amount / 3;
    const adjustedAmount = Math.min(monthlyAmount * 1.1, monthlyIncome * 0.15);

    return {
      category,
      suggestedAmount: adjustedAmount,
      confidence: 70,
      reasoning: `Based on your average spending of ${monthlyAmount.toLocaleString()} per month in this category`,
      trend: 'stable' as const,
      seasonalFactor: 1.0
    };
  });

  return {
    totalBudget: Math.min(monthlyAverage * 1.1, monthlyIncome * 0.7),
    categories,
    savingsRate: 20,
    emergencyFund: monthlyAverage * 3,
    insights: [
      "Budget based on your recent spending patterns",
      "Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings",
      "Build an emergency fund of 3-6 months of expenses",
      "Review and adjust your budget monthly based on actual spending"
    ]
  };
}

async function generateSpendingPredictions(transactions: TransactionData[], currency: string): Promise<Record<string, number>> {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  
  const recentTransactions = transactions.filter(t => 
    t.transaction_type === 'expense' && 
    new Date(t.date) >= threeMonthsAgo
  );
  
  const categorySpending: Record<string, number[]> = {};
  
  recentTransactions.forEach(t => {
    if (!categorySpending[t.category]) {
      categorySpending[t.category] = [];
    }
    categorySpending[t.category].push(t.amount);
  });
  
  const predictions: Record<string, number> = {};
  
  Object.entries(categorySpending).forEach(([category, amounts]) => {
    const average = amounts.reduce((sum, amount) => sum + amount, 0) / 3;
    predictions[category] = Math.round(average * 1.1);
  });
  
  return predictions;
}

serve(async (req) => {
  const startTime = Date.now();
  
  // Enhanced security logging
  console.log(`Budget AI Request: ${req.method} ${req.url}`, {
    timestamp: new Date().toISOString(),
    userAgent: req.headers.get('user-agent'),
    ip: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'
  });

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Apply rate limiting: 2 requests per 5 minutes per identifier
  const identifier = getClientIdentifier(req);
  const rl = rateLimit(`budget-ai:${identifier}`, 2, 5 * 60_000);
  if (!rl.allowed) {
    const retryAfter = Math.ceil((rl.reset - Date.now()) / 1000);
    
    // Log rate limit exceeded
    console.warn('Rate limit exceeded', {
      identifier,
      endpoint: 'budget-ai',
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
    const requestBody = await req.json();
    const { userId, type } = requestBody;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    const [transactionsResult, profileResult] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('profiles').select('*').eq('id', userId).single()
    ]);

    if (transactionsResult.error || profileResult.error) {
      console.error('Database error:', { transactionsResult, profileResult });
      return new Response(JSON.stringify({ error: 'Failed to fetch financial data' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (type === 'predictions') {
      const predictions = await generateSpendingPredictions(
        transactionsResult.data,
        profileResult.data?.currency || 'USD'
      );
      
      return new Response(JSON.stringify({ predictions }), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(rl.limit),
          'X-RateLimit-Remaining': String(rl.remaining),
          'X-RateLimit-Reset': String(rl.reset)
        },
      });
    } else {
      const recommendations = await generateBudgetPredictions(
        transactionsResult.data,
        profileResult.data?.monthly_income || 0,
        profileResult.data?.currency || 'USD'
      );

      return new Response(JSON.stringify({ recommendations }), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(rl.limit),
          'X-RateLimit-Remaining': String(rl.remaining),
          'X-RateLimit-Reset': String(rl.reset)
        },
      });
    }

  } catch (error) {
    console.error('Error in budget-ai function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
