// API client for handling all API requests
import { supabase } from '@/integrations/supabase/client';
import { captureException } from './sentry';
import { monitoredAPICall } from './monitoring';
import { resourceAwareAPICall } from './resource-monitor';
import { queuedAPICall } from './request-queue';
import { enhancedMonitor } from './enhanced-monitoring';

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
  if (!userId) {
    console.error('generateAIInsights: userId is required');
    return getFallbackInsights();
  }

  // Track user action for monitoring
  enhancedMonitor.trackUserAction('ai_insights_generation', userId);

  try {
    const result = await resourceAwareAPICall(
      () => monitoredAPICall('ai-insights', async () => {
        return queuedAPICall(
          async () => {
            const response = await supabase.functions.invoke('ai-insights', {
              body: { userId }
            });
            return response;
          },
          3 // High priority for AI insights
        );
      }),
      () => ({ data: { insights: getFallbackInsights() }, error: null })
    );

    const { data, error } = result as { 
      data: { 
        insights: Array<{
          id: string;
          type: 'spending' | 'saving' | 'investment' | 'budget' | 'goal';
          title: string;
          description: string;
          impact: 'high' | 'medium' | 'low';
          action: string;
          priority: number;
        }> 
      }; 
      error: Error | null 
    };

    if (error) {
      captureException(error);
      console.error('Error calling ai-insights function:', error);
      enhancedMonitor.trackError(error, { 
        category: 'ai_insights', 
        userId,
        severity: 'medium' 
      });
      return getFallbackInsights();
    }

    // Validate response structure
    if (!data || !Array.isArray(data.insights)) {
      console.warn('Invalid response structure from ai-insights function');
      return getFallbackInsights();
    }

    return data.insights.map((insight, index: number): AIInsight => ({
      id: insight.id || `fallback-${Date.now()}-${index}`,
      type: insight.type || 'spending',
      title: insight.title || 'Financial Insight',
      description: insight.description || 'No description available',
      impact: insight.impact || 'medium',
      action: insight.action || 'Review your financial data',
      priority: insight.priority || index + 1
    }));
  } catch (error) {
    captureException(error);
    console.error('Error in generateAIInsights:', error);
    return getFallbackInsights();
  }
}

export async function generateBudgetRecommendations(userId: string): Promise<BudgetRecommendation> {
  if (!userId) {
    console.error('generateBudgetRecommendations: userId is required');
    return getFallbackBudgetRecommendations();
  }

  // Track user action for monitoring
  enhancedMonitor.trackUserAction('budget_recommendations_generation', userId);

  try {
    const { data, error } = await resourceAwareAPICall(
      () => queuedAPICall(
        () => supabase.functions.invoke('budget-ai', {
          body: { userId }
        }),
        2 // Medium priority
      ),
      () => ({ data: { recommendations: getFallbackBudgetRecommendations() }, error: null })
    );

    if (error) {
      console.error('Error calling budget-ai function:', error);
      enhancedMonitor.trackError(error, { 
        category: 'budget_ai', 
        userId,
        severity: 'medium' 
      });
      return getFallbackBudgetRecommendations();
    }

    // Validate response structure
    if (!data || !data.recommendations) {
      console.warn('Invalid response structure from budget-ai function');
      return getFallbackBudgetRecommendations();
    }

    return data.recommendations;
  } catch (error) {
    console.error('Error in generateBudgetRecommendations:', error);
    enhancedMonitor.trackError(error instanceof Error ? error : new Error('Unknown error'), { 
      category: 'budget_recommendations', 
      userId,
      severity: 'medium' 
    });
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
    return {};
  }
}

export async function generateFinancialAdvice(userContext: string): Promise<string> {
  if (!userContext?.trim()) {
    return "Please provide more details about your financial question so I can give you better advice.";
  }

  // Rate limiting check
  const lastRequest = localStorage.getItem('lastAIRequest');
  const now = Date.now();
  if (lastRequest && now - parseInt(lastRequest) < 5000) { // 5 second cooldown
    return "Please wait a moment before asking another question.";
  }
  localStorage.setItem('lastAIRequest', now.toString());

  // Track user action for monitoring
  enhancedMonitor.trackUserAction('ai_coach_query');

  try {
    const { data, error } = await resourceAwareAPICall(
      () => queuedAPICall(
        () => supabase.functions.invoke('ai-coach', {
          body: { userContext }
        }),
        3 // High priority for user interactions
      ),
      () => ({ data: { advice: getFallbackFinancialAdvice(userContext) }, error: null })
    );

    if (error) {
      console.error('Error calling ai-coach function:', error);
      enhancedMonitor.trackError(error, { 
        category: 'ai_coach', 
        severity: 'medium' 
      });
      return getFallbackFinancialAdvice(userContext);
    }

    return data.advice || getFallbackFinancialAdvice(userContext);
  } catch (error) {
    console.error('Error in generateFinancialAdvice:', error);
    enhancedMonitor.trackError(error instanceof Error ? error : new Error('Unknown error'), { 
      category: 'financial_advice', 
      severity: 'medium' 
    });
    return getFallbackFinancialAdvice(userContext);
  }
}

export async function analyzeFinancialRisk(financialData: Record<string, unknown>): Promise<string> {
  // Track user action for monitoring
  enhancedMonitor.trackUserAction('risk_analysis');

  try {
    const { data, error } = await supabase.functions.invoke('risk-prediction', {
      body: { financialData }
    });

    if (error) {
      console.error('Error calling risk-prediction function:', error);
      enhancedMonitor.trackError(error, { 
        category: 'risk_prediction', 
        severity: 'medium' 
      });
      // Return fallback analysis instead of throwing
      return getFallbackRiskAnalysis();
    }

    return data.analysis || '';
  } catch (error) {
    console.error('Error in analyzeFinancialRisk:', error);
    enhancedMonitor.trackError(error instanceof Error ? error : new Error('Unknown error'), { 
      category: 'risk_analysis', 
      severity: 'medium' 
    });
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
      title: 'Start Tracking Your Expenses',
      description: 'Begin by recording your daily transactions to unlock personalized financial insights and recommendations.',
      impact: 'medium',
      action: 'Add at least 10 transactions over the next week to see meaningful spending patterns and trends.',
      priority: 1
    },
    {
      id: 'fallback-2',
      type: 'budget',
      title: 'Create Your First Budget',
      description: 'Establish budget categories for your main expenses to gain better control over your spending habits.',
      impact: 'high',
      action: 'Start with budgets for Food, Transportation, and Entertainment - your likely biggest expense categories.',
      priority: 2
    },
    {
      id: 'fallback-3',
      type: 'saving',
      title: 'Build an Emergency Fund',
      description: 'Having an emergency fund is crucial for financial security and peace of mind.',
      impact: 'high',
      action: 'Start by saving $1,000 as a starter emergency fund, then work towards 3-6 months of expenses.',
      priority: 3
    },
    {
      id: 'fallback-4',
      type: 'goal',
      title: 'Set Financial Goals',
      description: 'Clear financial goals help you stay motivated and track your progress effectively.',
      impact: 'medium',
      action: 'Create specific, measurable goals like "Save $5,000 for vacation by December 2025".',
      priority: 4
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