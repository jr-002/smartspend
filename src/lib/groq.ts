<<<<<<< HEAD
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
  dangerouslyAllowBrowser: false // Only use on server-side
});

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

export async function generateFinancialInsights(data: FinancialData): Promise<AIInsight[]> {
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
      model: "llama3-8b-8192",
      temperature: 0.3,
      max_tokens: 2048,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from Groq API');
    }

    // Parse the JSON response
    const insights = JSON.parse(response);
    
    // Validate and format insights
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
    // Return fallback insights if AI fails
    return getFallbackInsights(data);
  }
}

function createFinancialAnalysisPrompt(data: FinancialData): string {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7);
  
  const currentMonthTransactions = data.transactions.filter(t => t.date.startsWith(currentMonth));
  const lastMonthTransactions = data.transactions.filter(t => t.date.startsWith(lastMonth));
  
  const currentMonthSpending = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const lastMonthSpending = lastMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const categorySpending = currentMonthTransactions
    .filter(t => t.type === 'expense')
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
  
  // Analyze spending trends
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = data.transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
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
  
  // Check budget performance
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
  
  return insights.slice(0, 4); // Limit to 4 insights
}
=======
import { Groq } from 'groq-sdk';

// Initialize Groq client
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

// Helper function for financial advice generation
export async function generateFinancialAdvice(userContext: string) {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are a knowledgeable financial advisor. Provide specific, actionable advice based on the user\'s financial situation.',
      },
      {
        role: 'user',
        content: userContext,
      },
    ],
    model: 'mixtral-8x7b-32768',
    temperature: 0.7,
    max_tokens: 800,
  });

  return completion.choices[0]?.message?.content || 'Unable to generate advice at this time.';
}

// Helper function for risk analysis
export async function analyzeFinancialRisk(financialData: any) {
  const dataString = JSON.stringify(financialData);
  
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are a financial risk assessment expert. Analyze the provided financial data and provide risk predictions and a health score.',
      },
      {
        role: 'user',
        content: `Please analyze this financial data and provide risk predictions and a health score: ${dataString}`,
      },
    ],
    model: 'mixtral-8x7b-32768',
    temperature: 0.5,
    max_tokens: 1000,
  });

  return completion.choices[0]?.message?.content || 'Unable to analyze risk at this time.';
}
>>>>>>> c224187 (chore: update project dependencies and add new components)
