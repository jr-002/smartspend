// API client for handling all API requests
// Since this is a Vite app, we'll create mock API responses for development

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

// Mock API functions for development
export async function generateAIInsights(userId: string): Promise<AIInsight[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return [
    {
      id: '1',
      type: 'spending',
      title: 'High Food Spending Detected',
      description: 'Your food expenses are 35% higher than the recommended 15% of income. Consider meal planning and cooking at home more often.',
      impact: 'medium',
      action: 'Set a weekly meal plan and grocery budget of ₦15,000 to reduce food costs by 25%.',
      priority: 1
    },
    {
      id: '2',
      type: 'saving',
      title: 'Emergency Fund Opportunity',
      description: 'You have consistent monthly surplus that could be allocated to an emergency fund.',
      impact: 'high',
      action: 'Automatically transfer ₦10,000 monthly to a separate emergency savings account.',
      priority: 2
    },
    {
      id: '3',
      type: 'budget',
      title: 'Transportation Budget Optimization',
      description: 'Your transportation costs vary significantly month-to-month, suggesting opportunities for optimization.',
      impact: 'low',
      action: 'Consider purchasing a monthly transport pass or exploring carpooling options.',
      priority: 3
    }
  ];
}

export async function generateBudgetRecommendations(userId: string): Promise<BudgetRecommendation> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    totalBudget: 85000,
    categories: [
      {
        category: 'Food',
        suggestedAmount: 25000,
        confidence: 85,
        reasoning: 'Based on your current spending pattern, with 15% reduction through meal planning',
        trend: 'stable',
        seasonalFactor: 1.0
      },
      {
        category: 'Transportation',
        suggestedAmount: 15000,
        confidence: 90,
        reasoning: 'Consistent monthly transport needs with slight optimization',
        trend: 'stable',
        seasonalFactor: 1.0
      },
      {
        category: 'Entertainment',
        suggestedAmount: 12000,
        confidence: 75,
        reasoning: 'Balanced entertainment budget allowing for social activities',
        trend: 'increasing',
        seasonalFactor: 1.2
      },
      {
        category: 'Utilities',
        suggestedAmount: 18000,
        confidence: 95,
        reasoning: 'Fixed costs with seasonal variations for electricity',
        trend: 'stable',
        seasonalFactor: 1.1
      },
      {
        category: 'Shopping',
        suggestedAmount: 15000,
        confidence: 70,
        reasoning: 'Discretionary spending with room for optimization',
        trend: 'decreasing',
        seasonalFactor: 0.9
      }
    ],
    savingsRate: 20,
    emergencyFund: 255000,
    insights: [
      'Your spending pattern shows good discipline in fixed categories',
      'Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings',
      'Emergency fund should cover 3-6 months of expenses',
      'Automate savings to ensure consistent progress toward goals'
    ]
  };
}

export async function generateSpendingPredictions(userId: string): Promise<Record<string, number>> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    'Food': 28000,
    'Transportation': 16500,
    'Entertainment': 14000,
    'Utilities': 19000,
    'Shopping': 13500
  };
}

export async function generateFinancialAdvice(userContext: string): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return `Based on your question about "${userContext}", here's my personalized advice:

💡 **Key Recommendations:**
1. **Budget Optimization**: Focus on the 50/30/20 rule as a starting point
2. **Emergency Fund**: Aim to save 3-6 months of expenses
3. **Debt Management**: Pay off high-interest debt first
4. **Investment Strategy**: Start with low-cost index funds

🎯 **Immediate Actions:**
- Track all expenses for the next 30 days
- Set up automatic savings transfers
- Review and optimize recurring subscriptions
- Create specific, measurable financial goals

📊 **Long-term Strategy:**
- Build a diversified investment portfolio
- Regularly review and adjust your budget
- Consider additional income streams
- Plan for major life events and expenses

Remember, personal finance is personal - adjust these recommendations based on your specific situation and goals.`;
}

export async function analyzeFinancialRisk(financialData: any): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return `Financial Risk Analysis Report:

🔍 **Risk Assessment Score: 65/100** (Moderate Risk)

**Key Risk Factors:**
1. **Cash Flow Risk (Medium)**: Monthly expenses occasionally exceed 90% of income
2. **Emergency Fund Risk (High)**: Current emergency fund covers only 1.2 months of expenses
3. **Debt Risk (Low)**: Manageable debt levels with good payment history
4. **Investment Risk (Medium)**: Portfolio lacks diversification

**Predictions:**
- 25% chance of budget overspend in next 3 months
- 15% probability of emergency fund depletion within 6 months
- 60% likelihood of meeting savings goals if current trends continue

**Recommendations:**
1. Increase emergency fund to 3 months of expenses
2. Implement stricter budget controls for variable expenses
3. Diversify investment portfolio across asset classes
4. Set up automatic savings to reduce spending temptation

**Health Score Breakdown:**
- Spending Control: 70/100
- Savings Rate: 60/100
- Debt Management: 85/100
- Emergency Preparedness: 40/100
- Investment Strategy: 55/100`;
}