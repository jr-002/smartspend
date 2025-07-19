// API client for handling all API requests
import { supabase } from '@/integrations/supabase/client'

export interface FinancialData {
  transactions: Array<{
    amount: number;
    category: string;
    type: 'income' | 'expense';
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

export interface AIInsight {
  id: string;
  type: 'spending' | 'saving' | 'investment' | 'budget' | 'goal';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action: string;
  priority: number;
}

export interface BudgetRecommendation {
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
}

// Real AI API functions using Supabase Edge Functions
export async function generateAIInsights(userId: string): Promise<AIInsight[]> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-insights', {
      body: { userId }
    });

    if (error) {
      console.error('Error calling ai-insights function:', error);
      throw new Error(error.message || 'Failed to generate AI insights');
    }

    return data.insights || [];
  } catch (error) {
    console.error('Error in generateAIInsights:', error);
    throw error;
  }
}

export async function generateBudgetRecommendations(userId: string): Promise<BudgetRecommendation> {
  try {
    const { data, error } = await supabase.functions.invoke('budget-ai', {
      body: { userId }
    });

    if (error) {
      console.error('Error calling budget-ai function:', error);
      throw new Error(error.message || 'Failed to generate budget recommendations');
    }

    return data.recommendations;
  } catch (error) {
    console.error('Error in generateBudgetRecommendations:', error);
    throw error;
  }
}

export async function generateSpendingPredictions(userId: string): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase.functions.invoke('budget-ai', {
      body: { userId, type: 'predictions' }
    });

    if (error) {
      console.error('Error calling budget-ai function for predictions:', error);
      throw new Error(error.message || 'Failed to generate spending predictions');
    }

    return data.predictions || {};
  } catch (error) {
    console.error('Error in generateSpendingPredictions:', error);
    // Return empty object as fallback
    return {};
  }
}

export async function generateFinancialAdvice(userContext: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-coach', {
      body: { userContext }
    });

    if (error) {
      console.error('Error calling ai-coach function:', error);
      throw new Error(error.message || 'Failed to generate financial advice');
    }

    return data.advice || '';
  } catch (error) {
    console.error('Error in generateFinancialAdvice:', error);
    throw error;
  }
}

export async function analyzeFinancialRisk(financialData: any): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('risk-prediction', {
      body: { financialData }
    });

    if (error) {
      console.error('Error calling risk-prediction function:', error);
      throw new Error(error.message || 'Failed to analyze financial risk');
    }

    return data.analysis || '';
  } catch (error) {
    console.error('Error in analyzeFinancialRisk:', error);
    throw error;
  }
}