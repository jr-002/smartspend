import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface AnalyticsData {
  // Financial Overview
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  savingsRate: number;
  
  // Spending Analysis
  monthlySpending: Array<{
    month: string;
    amount: number;
    budget: number;
  }>;
  
  // Category Breakdown
  categoryBreakdown: Array<{
    name: string;
    value: number;
    color: string;
    percentage: number;
  }>;
  
  // Income vs Expenses
  incomeVsExpenses: Array<{
    month: string;
    income: number;
    expenses: number;
    savings: number;
  }>;
  
  // Key Metrics
  keyMetrics: {
    totalSpent: number;
    avgDailySpending: number;
    biggestExpense: {
      category: string;
      amount: number;
    };
    budgetVariance: number;
    monthlyChange: number;
  };
  
  // Goals and Bills Summary
  goalsProgress: {
    totalGoals: number;
    completedGoals: number;
    totalTargetAmount: number;
    totalCurrentAmount: number;
  };
  
  billsStatus: {
    totalBills: number;
    paidBills: number;
    pendingBills: number;
    overdueBills: number;
    totalBillAmount: number;
  };
}

export const useAnalytics = (period: string = '3months') => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAnalyticsData = async () => {
    if (!user) {
      setAnalyticsData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Calculate date range based on period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '1month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case '3months':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case '1year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(endDate.getMonth() - 3);
      }

      // Fetch all required data in parallel
      const [
        transactionsResult,
        budgetsResult,
        savingsGoalsResult,
        billsResult
      ] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0]),
        
        supabase
          .from('budgets')
          .select('*')
          .eq('user_id', user.id),
        
        supabase
          .from('savings_goals')
          .select('*')
          .eq('user_id', user.id),
        
        supabase
          .from('bills')
          .select('*')
          .eq('user_id', user.id)
      ]);

      if (transactionsResult.error) throw transactionsResult.error;
      if (budgetsResult.error) throw budgetsResult.error;
      if (savingsGoalsResult.error) throw savingsGoalsResult.error;
      if (billsResult.error) throw billsResult.error;

      const transactions = transactionsResult.data || [];
      const budgets = budgetsResult.data || [];
      const savingsGoals = savingsGoalsResult.data || [];
      const bills = billsResult.data || [];

      // Process transactions data
      const incomeTransactions = transactions.filter(t => t.transaction_type === 'income');
      const expenseTransactions = transactions.filter(t => t.transaction_type === 'expense');
      
      const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
      const currentBalance = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

      // Generate monthly spending data
      const monthlyData = generateMonthlyData(transactions, budgets, startDate, endDate);
      
      // Generate category breakdown
      const categoryData = generateCategoryBreakdown(expenseTransactions);
      
      // Generate income vs expenses data
      const incomeVsExpensesData = generateIncomeVsExpensesData(transactions, startDate, endDate);
      
      // Calculate key metrics
      const keyMetrics = calculateKeyMetrics(transactions, budgets);
      
      // Process goals data
      const goalsProgress = {
        totalGoals: savingsGoals.length,
        completedGoals: savingsGoals.filter(g => g.current_amount >= g.target_amount).length,
        totalTargetAmount: savingsGoals.reduce((sum, g) => sum + g.target_amount, 0),
        totalCurrentAmount: savingsGoals.reduce((sum, g) => sum + g.current_amount, 0),
      };
      
      // Process bills data
      const billsStatus = {
        totalBills: bills.length,
        paidBills: bills.filter(b => b.status === 'paid').length,
        pendingBills: bills.filter(b => b.status === 'pending').length,
        overdueBills: bills.filter(b => b.status === 'overdue').length,
        totalBillAmount: bills.reduce((sum, b) => sum + b.amount, 0),
      };

      const analyticsData: AnalyticsData = {
        totalIncome,
        totalExpenses,
        currentBalance,
        savingsRate,
        monthlySpending: monthlyData,
        categoryBreakdown: categoryData,
        incomeVsExpenses: incomeVsExpensesData,
        keyMetrics,
        goalsProgress,
        billsStatus,
      };

      setAnalyticsData(analyticsData);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data');
      toast({
        title: "Error",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [user, period]);

  return {
    analyticsData,
    loading,
    error,
    refetch: fetchAnalyticsData,
  };
};

// Helper functions
function generateMonthlyData(transactions: any[], budgets: any[], startDate: Date, endDate: Date) {
  const monthlyData = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const monthKey = current.toISOString().slice(0, 7); // YYYY-MM format
    const monthName = current.toLocaleDateString('en-US', { month: 'short' });
    
    const monthTransactions = transactions.filter(t => 
      t.transaction_type === 'expense' && t.date.startsWith(monthKey)
    );
    
    const monthlyAmount = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const monthlyBudget = budgets.reduce((sum, b) => sum + (b.period === 'monthly' ? b.amount : b.amount / 12), 0);
    
    monthlyData.push({
      month: monthName,
      amount: monthlyAmount,
      budget: monthlyBudget,
    });
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return monthlyData;
}

function generateCategoryBreakdown(expenseTransactions: any[]) {
  const categoryTotals: Record<string, number> = {};
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  expenseTransactions.forEach(transaction => {
    categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
  });
  
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280', '#EC4899', '#14B8A6'];
  
  return Object.entries(categoryTotals)
    .map(([category, amount], index) => ({
      name: category,
      value: amount,
      color: colors[index % colors.length],
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Top 8 categories
}

function generateIncomeVsExpensesData(transactions: any[], startDate: Date, endDate: Date) {
  const monthlyData = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const monthKey = current.toISOString().slice(0, 7);
    const monthName = current.toLocaleDateString('en-US', { month: 'short' });
    
    const monthTransactions = transactions.filter(t => t.date.startsWith(monthKey));
    const income = monthTransactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTransactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    monthlyData.push({
      month: monthName,
      income,
      expenses,
      savings: income - expenses,
    });
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return monthlyData;
}

function calculateKeyMetrics(transactions: any[], budgets: any[]) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7);
  
  const currentMonthExpenses = transactions
    .filter(t => t.transaction_type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);
  
  const lastMonthExpenses = transactions
    .filter(t => t.transaction_type === 'expense' && t.date.startsWith(lastMonth))
    .reduce((sum, t) => sum + t.amount, 0);
  
  const monthlyChange = lastMonthExpenses > 0 
    ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
    : 0;
  
  const totalBudget = budgets.reduce((sum, b) => sum + (b.period === 'monthly' ? b.amount : b.amount / 12), 0);
  const budgetVariance = currentMonthExpenses - totalBudget;
  
  // Calculate biggest expense category
  const categoryTotals: Record<string, number> = {};
  transactions
    .filter(t => t.transaction_type === 'expense' && t.date.startsWith(currentMonth))
    .forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
  
  const biggestCategory = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)[0];
  
  const daysInMonth = new Date().getDate();
  const avgDailySpending = daysInMonth > 0 ? currentMonthExpenses / daysInMonth : 0;
  
  return {
    totalSpent: currentMonthExpenses,
    avgDailySpending,
    biggestExpense: {
      category: biggestCategory?.[0] || 'N/A',
      amount: biggestCategory?.[1] || 0,
    },
    budgetVariance,
    monthlyChange,
  };
}