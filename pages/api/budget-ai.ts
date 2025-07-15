import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { generateBudgetPredictions, type TransactionData } from '../../src/lib/budgetAI';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, action } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Fetch user's financial data
    const [transactionsResult, profileResult] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Last 6 months
        .order('date', { ascending: false }),
      
      supabase
        .from('profiles')
        .select('monthly_income, currency')
        .eq('id', userId)
        .single()
    ]);

    if (transactionsResult.error) throw transactionsResult.error;
    if (profileResult.error) throw profileResult.error;

    const transactions: TransactionData[] = (transactionsResult.data || []).map(t => ({
      id: t.id,
      amount: t.amount,
      category: t.category,
      date: t.date,
      transaction_type: t.transaction_type as 'income' | 'expense',
      description: t.description
    }));

    const monthlyIncome = profileResult.data?.monthly_income || 0;
    const currency = profileResult.data?.currency || 'USD';

    if (action === 'generate-budget') {
      // Generate AI-powered budget recommendations
      const recommendations = await generateBudgetPredictions(transactions, monthlyIncome, currency);
      
      res.status(200).json({ 
        success: true,
        recommendations,
        dataQuality: {
          transactionCount: transactions.length,
          monthsOfData: Math.min(6, Math.ceil(transactions.length / 30)),
          hasRecentData: transactions.some(t => {
            const transactionDate = new Date(t.date);
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            return transactionDate >= thirtyDaysAgo;
          })
        }
      });
    } else if (action === 'predict-spending') {
      // Generate spending predictions for current month
      const currentMonth = new Date().toISOString().slice(0, 7);
      const currentMonthTransactions = transactions.filter(t => 
        t.date.startsWith(currentMonth) && t.transaction_type === 'expense'
      );

      const daysIntoMonth = new Date().getDate();
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

      const categorySpending: Record<string, number> = {};
      const predictions: Record<string, number> = {};

      currentMonthTransactions.forEach(t => {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      });

      // Calculate predictions based on current spending rate
      Object.entries(categorySpending).forEach(([category, amount]) => {
        const dailyAverage = amount / daysIntoMonth;
        predictions[category] = dailyAverage * daysInMonth;
      });

      res.status(200).json({
        success: true,
        predictions,
        currentSpending: categorySpending,
        daysIntoMonth,
        daysInMonth
      });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('Error in budget AI API:', error);
    res.status(500).json({ 
      error: 'Failed to process budget AI request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}