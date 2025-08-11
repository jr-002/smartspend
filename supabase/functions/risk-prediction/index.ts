import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import Groq from 'https://esm.sh/groq-sdk@0.7.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

async function analyzeFinancialRisk(financialData: any): Promise<string> {
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Apply rate limiting: 2 requests per 5 minutes per identifier
  const identifier = getClientIdentifier(req);
  const rl = rateLimit(`risk-prediction:${identifier}`, 2, 5 * 60_000);
  if (!rl.allowed) {
    const retryAfter = Math.ceil((rl.reset - Date.now()) / 1000);
    return new Response(JSON.stringify({ error: 'Too Many Requests. Please try again later.' }), {
      status: 429,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(rl.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(rl.reset)
      },
    });
  }

  try {
    const { financialData, userId } = await req.json();

    if (userId && !financialData) {
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
        supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(100),
        supabase.from('budgets').select('*').eq('user_id', userId),
        supabase.from('savings_goals').select('*').eq('user_id', userId),
        supabase.from('bills').select('*').eq('user_id', userId),
        supabase.from('debts').select('*').eq('user_id', userId),
        supabase.from('profiles').select('*').eq('id', userId).single()
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
        riskPredictions: analysis,
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

    if (!financialData) {
      return new Response(JSON.stringify({ error: 'Financial data or user ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const analysis = await analyzeFinancialRisk(financialData);

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
    console.error('Error in risk-prediction function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      analysis: 'Risk analysis is temporarily unavailable due to technical difficulties.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
