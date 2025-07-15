import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
  dangerouslyAllowBrowser: false // Only use on server-side
});

export interface TransactionData {
  id: string;
  amount: number;
  category: string;
  date: string;
  transaction_type: 'income' | 'expense';
  description: string;
}

export interface BudgetPrediction {
  category: string;
  suggestedAmount: number;
  confidence: number;
  reasoning: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonalFactor: number;
}

export interface BudgetRecommendation {
  totalBudget: number;
  categories: BudgetPrediction[];
  savingsRate: number;
  emergencyFund: number;
  insights: string[];
}

export async function generateBudgetPredictions(
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
      model: "llama3-8b-8192",
      temperature: 0.2,
      max_tokens: 3000,
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

  // Filter transactions by time periods
  const recentTransactions = transactions.filter(t => 
    new Date(t.date) >= threeMonthsAgo && t.transaction_type === 'expense'
  );
  
  const olderTransactions = transactions.filter(t => 
    new Date(t.date) >= sixMonthsAgo && 
    new Date(t.date) < threeMonthsAgo && 
    t.transaction_type === 'expense'
  );

  // Calculate category spending patterns
  const recentCategorySpending = calculateCategorySpending(recentTransactions);
  const olderCategorySpending = calculateCategorySpending(olderTransactions);

  // Calculate trends
  const categoryTrends = calculateSpendingTrends(recentCategorySpending, olderCategorySpending);

  // Calculate monthly averages
  const monthlyAverages = calculateMonthlyAverages(recentTransactions);

  // Identify seasonal patterns
  const seasonalPatterns = identifySeasonalPatterns(transactions);

  return {
    recentCategorySpending,
    olderCategorySpending,
    categoryTrends,
    monthlyAverages,
    seasonalPatterns,
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
    const monthKey = transaction.date.slice(0, 7); // YYYY-MM
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {};
    }
    monthlyData[monthKey][transaction.category] = 
      (monthlyData[monthKey][transaction.category] || 0) + transaction.amount;
  });

  const categoryAverages: Record<string, number> = {};
  const monthCount = Object.keys(monthlyData).length || 1;

  // Calculate averages across all months
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

function identifySeasonalPatterns(transactions: TransactionData[]): Record<string, number> {
  const currentMonth = new Date().getMonth();
  const seasonalFactors: Record<string, number> = {};

  // Group transactions by month and category
  const monthlySpending: Record<number, Record<string, number>> = {};

  transactions.forEach(transaction => {
    const month = new Date(transaction.date).getMonth();
    if (!monthlySpending[month]) {
      monthlySpending[month] = {};
    }
    monthlySpending[month][transaction.category] = 
      (monthlySpending[month][transaction.category] || 0) + transaction.amount;
  });

  // Calculate seasonal factors for current month
  Object.keys(monthlySpending[currentMonth] || {}).forEach(category => {
    const currentMonthSpending = monthlySpending[currentMonth]?.[category] || 0;
    const averageSpending = Object.values(monthlySpending)
      .reduce((sum, monthData) => sum + (monthData[category] || 0), 0) / 12;

    seasonalFactors[category] = averageSpending > 0 ? currentMonthSpending / averageSpending : 1;
  });

  return seasonalFactors;
}

function createBudgetAnalysisPrompt(
  analysisData: any,
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
  .map(([cat, trend]) => `- ${cat}: ${(trend as any).trend} (${(trend as any).change.toFixed(1)}% change)`)
  .join('\n')}

MONTHLY AVERAGES:
${Object.entries(analysisData.monthlyAverages)
  .map(([cat, avg]) => `- ${cat}: ${currency} ${(avg as number).toLocaleString()}`)
  .join('\n')}

CURRENT TOTAL SPENDING: ${currency} ${analysisData.totalRecentSpending.toLocaleString()}
TRANSACTION COUNT: ${analysisData.transactionCount}
AVERAGE TRANSACTION: ${currency} ${analysisData.averageTransactionAmount.toLocaleString()}

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
3. Consider seasonal factors for categories like utilities, clothing
4. Provide confidence scores based on data quality
5. Include 3-5 actionable insights
6. Ensure total budget doesn't exceed 80% of income for safety
7. Recommend emergency fund of 3-6 months expenses
8. Account for spending trends when setting future budgets

Focus on practical, achievable recommendations based on the user's actual spending behavior.
`;
}

function validateAndFormatRecommendation(
  recommendation: any,
  monthlyIncome: number
): BudgetRecommendation {
  // Ensure total budget doesn't exceed 80% of income
  const maxBudget = monthlyIncome * 0.8;
  if (recommendation.totalBudget > maxBudget) {
    recommendation.totalBudget = maxBudget;
    
    // Proportionally reduce category budgets
    const reductionFactor = maxBudget / recommendation.totalBudget;
    recommendation.categories = recommendation.categories.map((cat: any) => ({
      ...cat,
      suggestedAmount: cat.suggestedAmount * reductionFactor
    }));
  }

  // Ensure minimum savings rate of 10%
  if (recommendation.savingsRate < 10) {
    recommendation.savingsRate = 10;
  }

  // Validate emergency fund (3-6 months of expenses)
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
  const monthlyAverage = totalSpending / 3; // 3 months of data

  // Apply 50/30/20 rule with adjustments based on actual spending
  const categories: BudgetPrediction[] = Object.entries(categorySpending).map(([category, amount]) => {
    const monthlyAmount = amount / 3;
    const adjustedAmount = Math.min(monthlyAmount * 1.1, monthlyIncome * 0.15); // Cap at 15% of income per category

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

// Client-side helper functions for the component
export function calculateBudgetVariance(
  actualSpending: Record<string, number>,
  budgetedAmounts: Record<string, number>
): Record<string, { variance: number; percentage: number; status: 'over' | 'under' | 'on-track' }> {
  const variances: Record<string, any> = {};

  Object.keys(budgetedAmounts).forEach(category => {
    const actual = actualSpending[category] || 0;
    const budgeted = budgetedAmounts[category] || 0;
    const variance = actual - budgeted;
    const percentage = budgeted > 0 ? (variance / budgeted) * 100 : 0;

    let status: 'over' | 'under' | 'on-track' = 'on-track';
    if (percentage > 10) status = 'over';
    else if (percentage < -10) status = 'under';

    variances[category] = { variance, percentage, status };
  });

  return variances;
}

export function generateSpendingPredictions(
  transactions: TransactionData[],
  daysIntoMonth: number
): Record<string, number> {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthTransactions = transactions.filter(t => 
    t.date.startsWith(currentMonth) && t.transaction_type === 'expense'
  );

  const categorySpending = calculateCategorySpending(currentMonthTransactions);
  const predictions: Record<string, number> = {};

  // Calculate daily average and project for full month
  Object.entries(categorySpending).forEach(([category, amount]) => {
    const dailyAverage = amount / daysIntoMonth;
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    predictions[category] = dailyAverage * daysInMonth;
  });

  return predictions;
}