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
      // Return fallback insights instead of throwing
      return getFallbackInsights();
    }

    return data.insights || [];
  } catch (error) {
    console.error('Error in generateAIInsights:', error);
    // Return fallback insights instead of throwing
    return getFallbackInsights();
  }
}

export async function generateBudgetRecommendations(userId: string): Promise<BudgetRecommendation> {
  try {
    const { data, error } = await supabase.functions.invoke('budget-ai', {
      body: { userId }
    });

    if (error) {
      console.error('Error calling budget-ai function:', error);
      // Return fallback recommendations instead of throwing
      return getFallbackBudgetRecommendations();
    }

    return data.recommendations;
  } catch (error) {
    console.error('Error in generateBudgetRecommendations:', error);
    // Return fallback recommendations instead of throwing
    return getFallbackBudgetRecommendations();
  }
}

export async function generateSpendingPredictions(userId: string): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase.functions.invoke('budget-ai', {
      body: { userId, type: 'predictions' }
    });

    if (error) {
      console.error('Error calling budget-ai function for predictions:', error);
      // Return empty object as fallback
      return {};
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
      // Return fallback advice instead of throwing
      return getFallbackFinancialAdvice(userContext);
    }

    return data.advice || '';
  } catch (error) {
    console.error('Error in generateFinancialAdvice:', error);
    // Return fallback advice instead of throwing
    return getFallbackFinancialAdvice(userContext);
  }
}

export async function analyzeFinancialRisk(financialData: any): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('risk-prediction', {
      body: { financialData }
    });

    if (error) {
      console.error('Error calling risk-prediction function:', error);
      // Return fallback analysis instead of throwing
      return getFallbackRiskAnalysis();
    }

    return data.analysis || '';
  } catch (error) {
    console.error('Error in analyzeFinancialRisk:', error);
    // Return fallback analysis instead of throwing
    return getFallbackRiskAnalysis();
  }
}

// Fallback functions for when AI services are unavailable
function getFallbackInsights(): AIInsight[] {
  return [
    {
      id: 'fallback-1',
      type: 'spending',
      title: 'Track Your Expenses',
      description: 'Start by adding your daily transactions to get personalized insights.',
      impact: 'medium',
      action: 'Add at least 10 transactions to see spending patterns.',
      priority: 1
    },
    {
      id: 'fallback-2',
      type: 'budget',
      title: 'Create Your First Budget',
      description: 'Set up budget categories to control your spending.',
      impact: 'high',
      action: 'Create budgets for your main expense categories.',
      priority: 2
    }
  ];
}

function getFallbackBudgetRecommendations(): BudgetRecommendation {
  return {
    totalBudget: 0,
    categories: [
      {
        category: 'Food',
        suggestedAmount: 0,
        confidence: 50,
        reasoning: 'Add transactions to get personalized recommendations',
        trend: 'stable',
        seasonalFactor: 1.0
      }
    ],
    savingsRate: 20,
    emergencyFund: 0,
    insights: [
      'Add more transaction data to get better recommendations',
      'Start with the 50/30/20 rule: 50% needs, 30% wants, 20% savings'
    ]
  };
}

function getFallbackFinancialAdvice(userContext: string): string {
  if (userContext.toLowerCase().includes('budget')) {
    return "To create an effective budget, start by tracking all your expenses for a month. Then categorize them into needs (50%), wants (30%), and savings (20%). This is known as the 50/30/20 rule and is a great starting point for most people.";
  }
  
  if (userContext.toLowerCase().includes('save')) {
    return "Building savings is crucial for financial security. Start with a small emergency fund of $1,000, then work towards 3-6 months of expenses. Automate your savings by setting up automatic transfers to a separate savings account.";
  }
  
  return "Focus on the basics: track your spending, create a budget, build an emergency fund, and pay off high-interest debt. These fundamentals will set you up for long-term financial success.";
}

function getFallbackRiskAnalysis(): string {
  return "To provide a comprehensive risk analysis, please add more financial data including transactions, budgets, and savings goals. In the meantime, focus on building an emergency fund and tracking your expenses to improve your financial health.";
}