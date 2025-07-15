import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { generateFinancialInsights, type FinancialData } from '../../src/lib/groq';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Fetch user's financial data
    const [
      transactionsResult,
      budgetsResult,
      savingsGoalsResult,
      billsResult,
      profileResult
    ] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false }),
      
      supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId),
      
      supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId),
      
      supabase
        .from('bills')
        .select('*')
        .eq('user_id', userId),
      
      supabase
        .from('profiles')
        .select('monthly_income, currency')
        .eq('id', userId)
        .single()
    ]);

    if (transactionsResult.error) throw transactionsResult.error;
    if (budgetsResult.error) throw budgetsResult.error;
    if (savingsGoalsResult.error) throw savingsGoalsResult.error;
    if (billsResult.error) throw billsResult.error;
    if (profileResult.error) throw profileResult.error;

    // Calculate budget spending
    const transactions = transactionsResult.data || [];
    const budgets = (budgetsResult.data || []).map(budget => {
      const spent = transactions
        .filter(t => 
          t.transaction_type === 'expense' && 
          t.category === budget.category &&
          t.date.startsWith(new Date().toISOString().slice(0, 7))
        )
        .reduce((sum, t) => sum + t.amount, 0);
      
      return { ...budget, spent };
    });

    const financialData: FinancialData = {
      transactions: transactions.map(t => ({
        amount: t.amount,
        category: t.category,
        type: t.transaction_type as 'income' | 'expense',
        date: t.date,
        description: t.description
      })),
      budgets,
      savingsGoals: savingsGoalsResult.data || [],
      bills: billsResult.data || [],
      monthlyIncome: profileResult.data?.monthly_income || 0,
      currency: profileResult.data?.currency || 'USD'
    };

    // Generate AI insights
    const insights = await generateFinancialInsights(financialData);

    res.status(200).json({ insights });

  } catch (error) {
    console.error('Error generating AI insights:', error);
    res.status(500).json({ 
      error: 'Failed to generate insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}