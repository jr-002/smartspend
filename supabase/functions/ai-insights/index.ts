import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import Groq from 'https://esm.sh/groq-sdk@0.7.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const groq = new Groq({
  apiKey: Deno.env.get('GROQ_API_KEY'),
});

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

    const insights = JSON.parse(response);
    
    return insights.map((insight: any, index: number) => ({
      id: `ai-${Date.now()}-${index}`,
      type: insight.type || 'spending',
      title: insight.title || 'Financial Insight',
      description: insight.description || '',
      impact: insight.impact || 'medium',
      action: insight.action || '',
      priority: insight.priority || index + 1
    }));

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

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

    const [transactionsResult, budgetsResult, savingsGoalsResult, billsResult, profileResult] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('budgets').select('*').eq('user_id', userId),
      supabase.from('savings_goals').select('*').eq('user_id', userId),
      supabase.from('bills').select('*').eq('user_id', userId),
      supabase.from('profiles').select('*').eq('id', userId).single()
    ]);

    if (transactionsResult.error || budgetsResult.error || savingsGoalsResult.error || billsResult.error || profileResult.error) {
      console.error('Database error:', { transactionsResult, budgetsResult, savingsGoalsResult, billsResult, profileResult });
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
      monthlyIncome: profileResult.data?.monthly_income || 0,
      currency: profileResult.data?.currency || 'USD'
    };

    const insights = await generateFinancialInsights(financialData);

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-insights function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
