import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Calculator, AlertTriangle, TrendingUp, TrendingDown, Target, Brain, Loader2, Sparkles, Zap } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/currencies";

interface BudgetPrediction {
  category: string;
  suggestedAmount: number;
  confidence: number;
  reasoning: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonalFactor: number;
}

interface BudgetRecommendation {
  totalBudget: number;
  categories: BudgetPrediction[];
  savingsRate: number;
  emergencyFund: number;
  insights: string[];
}

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  predicted: number;
  color: string;
  trend: 'up' | 'down' | 'stable';
}

const SmartBudgeting = () => {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { budgets, loading: budgetsLoading, addBudget } = useBudgets();
  const { user, profile } = useAuth();
  
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [predictions, setPredictions] = useState<Record<string, number>>({});
  const [aiRecommendations, setAiRecommendations] = useState<BudgetRecommendation | null>(null);
  const [isGeneratingBudget, setIsGeneratingBudget] = useState(false);
  const [isGeneratingPredictions, setIsGeneratingPredictions] = useState(false);
  const [predictiveAnalysis, setPredictiveAnalysis] = useState({
    monthlyIncome: 0,
    projectedExpenses: 0,
    projectedSavings: 0,
    savingsRate: 0,
    budgetVariance: 0,
    riskLevel: "low" as "low" | "medium" | "high"
  });

  // Calculate current month spending by category
  const getCurrentMonthSpending = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthTransactions = transactions.filter(t => 
      t.date.startsWith(currentMonth) && t.transaction_type === 'expense'
    );

    const categorySpending: Record<string, number> = {};
    currentMonthTransactions.forEach(transaction => {
      categorySpending[transaction.category] = (categorySpending[transaction.category] || 0) + transaction.amount;
    });

    return categorySpending;
  };

  // Generate AI-powered budget recommendations
  const generateAIBudget = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to generate AI budget recommendations.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingBudget(true);
    try {
      const response = await fetch('/api/budget-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: user.id, 
          action: 'generate-budget' 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.recommendations) {
        setAiRecommendations(data.recommendations);
        
        // Apply recommendations to create budget categories
        const newCategories: BudgetCategory[] = data.recommendations.categories.map((rec: BudgetPrediction, index: number) => ({
          id: `ai-${index}`,
          name: rec.category,
          budgeted: rec.suggestedAmount,
          spent: getCurrentMonthSpending()[rec.category] || 0,
          predicted: predictions[rec.category] || rec.suggestedAmount,
          color: getColorForCategory(rec.category),
          trend: rec.trend === 'increasing' ? 'up' : rec.trend === 'decreasing' ? 'down' : 'stable'
        }));

        setBudgetCategories(newCategories);
        
        toast({
          title: "AI Budget Generated!",
          description: `Generated budget recommendations based on your spending patterns with ${data.dataQuality.transactionCount} transactions analyzed.`,
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating AI budget:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI budget recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingBudget(false);
    }
  };

  // Generate spending predictions
  const generatePredictions = async () => {
    if (!user) return;

    setIsGeneratingPredictions(true);

    try {
      const response = await fetch('/api/budget-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: user.id, 
          action: 'predict-spending' 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.predictions) {
        setPredictions(data.predictions);
        
        // Update budget categories with new predictions
        setBudgetCategories(prev => prev.map(category => ({
          ...category,
          predicted: data.predictions[category.name] || category.predicted
        })));
      }
    } catch (error) {
      console.error('Error generating predictions:', error);
    } finally {
      setIsGeneratingPredictions(false);
    }
  };

  // Apply AI recommendations to actual budgets
  const applyAIRecommendations = async () => {
    if (!aiRecommendations || !user) return;

    try {
      for (const recommendation of aiRecommendations.categories) {
        await addBudget({
          category: recommendation.category,
          amount: recommendation.suggestedAmount,
          period: 'monthly'
        });
      }

      toast({
        title: "Budgets Applied!",
        description: "AI recommendations have been applied to your budget categories.",
      });
    } catch (error) {
      console.error('Error applying AI recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to apply AI recommendations. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Initialize budget categories from existing budgets and transactions
  useEffect(() => {
    if (transactionsLoading || budgetsLoading || !transactions.length) return;

    const currentMonthSpending = getCurrentMonthSpending();
    
    const categories = budgets.map(budget => ({
      id: budget.id,
      name: budget.category,
      budgeted: budget.amount,
      spent: currentMonthSpending[budget.category] || 0,
      predicted: predictions[budget.category] || budget.amount,
      color: getColorForCategory(budget.category),
      trend: 'stable'
    }));

    // Add categories that have spending but no budget
    Object.entries(currentMonthSpending).forEach(([category, spent]) => {
      if (!categories.find(c => c.name === category)) {
        categories.push({
          id: `spending-${category}`,
          name: category,
          budgeted: 0,
          spent,
          predicted: predictions[category] || spent * 1.1,
          color: getColorForCategory(category),
          trend: 'stable'
        });
      }
    });

    setBudgetCategories(categories);

    // Calculate predictive analysis
    const totalBudgeted = categories.reduce((sum, cat) => sum + cat.budgeted, 0);
    const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
    const totalPredicted = categories.reduce((sum, cat) => sum + cat.predicted, 0);
    const monthlyIncome = profile?.monthly_income || 0;

    setPredictiveAnalysis({
      monthlyIncome,
      projectedExpenses: totalPredicted,
      projectedSavings: Math.max(0, monthlyIncome - totalPredicted),
      savingsRate: monthlyIncome > 0 ? ((monthlyIncome - totalPredicted) / monthlyIncome) * 100 : 0,
      budgetVariance: totalPredicted - totalBudgeted,
      riskLevel: totalPredicted > monthlyIncome * 0.9 ? "high" : totalPredicted > monthlyIncome * 0.7 ? "medium" : "low"
    });

    // Auto-generate predictions on load
    generatePredictions();
  }, [transactions, budgets, transactionsLoading, budgetsLoading, profile]);

  const getColorForCategory = (category: string): string => {
    const colors = [
      "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", 
      "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6366F1"
    ];
    const index = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const totalBudgeted = budgetCategories.reduce((sum, cat) => sum + cat.budgeted, 0);
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalPredicted = budgetCategories.reduce((sum, cat) => sum + cat.predicted, 0);

  const getProgressPercentage = (spent: number, budgeted: number) => {
    return Math.min((spent / budgeted) * 100, 100);
  };

  const getStatusColor = (spent: number, budgeted: number, predicted: number) => {
    if (predicted > budgeted) return "text-destructive";
    if (spent > budgeted * 0.8) return "text-warning";
    return "text-success";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': 
      case 'increasing': return <TrendingUp className="w-4 h-4 text-destructive" />;
      case 'down': 
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-success" />;
      default: return <Target className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const pieChartData = budgetCategories.map(cat => ({
    name: cat.name,
    value: cat.spent,
    color: cat.color
  }));

  const comparisonData = budgetCategories.map(cat => ({
    name: cat.name.split(' ')[0],
    budgeted: cat.budgeted,
    spent: cat.spent,
    predicted: cat.predicted
  }));

  return (
    <div className="space-y-6">
      {/* Predictive Analysis Alert */}
      <Alert className={`${
        predictiveAnalysis.riskLevel === 'high' 
          ? 'border-destructive bg-destructive/10' 
          : predictiveAnalysis.riskLevel === 'medium'
          ? 'border-warning bg-warning/10'
          : 'border-success bg-success/10'
      }`}>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          <strong>AI Prediction:</strong> {
            predictiveAnalysis.riskLevel === 'high'
              ? `You're projected to spend ${formatCurrency(predictiveAnalysis.projectedExpenses, profile?.currency || "USD")} this month, which exceeds your income. Consider reducing discretionary spending.`
              : predictiveAnalysis.riskLevel === 'medium'
              ? `Your projected spending of ${formatCurrency(predictiveAnalysis.projectedExpenses, profile?.currency || "USD")} is within budget but leaves little room for savings.`
              : `Great job! Your spending is on track with a projected savings rate of ${predictiveAnalysis.savingsRate.toFixed(1)}%.`
          }
        </AlertDescription>
      </Alert>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budgeted</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalBudgeted, profile?.currency || "USD")}</p>
              </div>
              <Calculator className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Spent</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalSpent, profile?.currency || "USD")}</p>
              </div>
              <Target className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Predicted Total</p>
                <p className={`text-2xl font-bold ${
                  predictiveAnalysis.riskLevel === 'high' ? 'text-destructive' : 
                  predictiveAnalysis.riskLevel === 'medium' ? 'text-warning' : 'text-success'
                }`}>{formatCurrency(totalPredicted, profile?.currency || "USD")}</p>
              </div>
              <Brain className={`w-8 h-8 ${
                predictiveAnalysis.riskLevel === 'high' ? 'text-destructive' : 
                predictiveAnalysis.riskLevel === 'medium' ? 'text-warning' : 'text-success'
              }`} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Projected Savings</p>
                <p className={`text-2xl font-bold ${predictiveAnalysis.projectedSavings > 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(predictiveAnalysis.projectedSavings, profile?.currency || "USD")}
                </p>
              </div>
              <TrendingUp className={`w-8 h-8 ${predictiveAnalysis.projectedSavings > 0 ? 'text-success' : 'text-destructive'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader>
            <CardTitle>Spending Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₦${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader>
            <CardTitle>Budget vs Actual vs Predicted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₦${Number(value).toLocaleString()}`} />
                  <Bar dataKey="budgeted" fill="#94A3B8" name="Budgeted" />
                  <Bar dataKey="spent" fill="#3B82F6" name="Spent" />
                  <Bar dataKey="predicted" fill="#EF4444" name="Predicted" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations Panel */}
      {aiRecommendations && (
        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Budget Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground">Recommended Budget</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(aiRecommendations.totalBudget, profile?.currency || "USD")}</p>
              </div>
              <div className="text-center p-4 bg-success/5 rounded-lg">
                <p className="text-sm text-muted-foreground">Savings Rate</p>
                <p className="text-xl font-bold text-success">{aiRecommendations.savingsRate}%</p>
              </div>
              <div className="text-center p-4 bg-warning/5 rounded-lg">
                <p className="text-sm text-muted-foreground">Emergency Fund</p>
                <p className="text-xl font-bold text-warning">{formatCurrency(aiRecommendations.emergencyFund, profile?.currency || "USD")}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">AI Insights:</h4>
              {aiRecommendations.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">{insight}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={applyAIRecommendations} className="bg-gradient-primary">
                Apply Recommendations
              </Button>
              <Button variant="outline" onClick={() => setAiRecommendations(null)}>
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Categories */}
      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-foreground">Smart Budget Tracking</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={generatePredictions}
                disabled={isGeneratingPredictions}
                className="gap-2"
              >
                {isGeneratingPredictions ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    Update Predictions
                  </>
                )}
              </Button>
              <Button 
                className="bg-gradient-primary gap-2"
                onClick={generateAIBudget}
                disabled={isGeneratingBudget}
              >
                {isGeneratingBudget ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Auto-Generate Budget
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {budgetCategories.length === 0 && !transactionsLoading && !budgetsLoading ? (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No budget data available</h3>
              <p className="text-muted-foreground mb-6">
                Start by adding some transactions or let AI generate a budget based on your spending patterns
              </p>
              <Button onClick={generateAIBudget} className="bg-gradient-primary gap-2">
                <Sparkles className="w-4 h-4" />
                Generate AI Budget
              </Button>
            </div>
          ) : (
          <div className="space-y-6">
            {budgetCategories.map((category) => {
              const progressPercentage = getProgressPercentage(category.spent, category.budgeted);
              const predictedPercentage = getProgressPercentage(category.predicted, category.budgeted);
              
              return (
                <div key={category.id} className="p-6 border rounded-lg bg-card/50 hover:bg-card transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{category.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getTrendIcon(category.trend)}
                          <span className="text-sm text-muted-foreground">
                            {category.trend === 'up' || category.trend === 'increasing' ? 'Trending up' : 
                             category.trend === 'down' || category.trend === 'decreasing' ? 'Trending down' : 'Stable'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(category.spent, profile?.currency || "USD")}</p>
                      <p className="text-sm text-muted-foreground">
                        of {formatCurrency(category.budgeted, profile?.currency || "USD")}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Current Progress</span>
                      <span className={`font-semibold ${getStatusColor(category.spent, category.budgeted, category.predicted)}`}>
                        {progressPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">AI Prediction</span>
                      <span className={`font-semibold ${getStatusColor(category.spent, category.budgeted, category.predicted)}`}>
                        {formatCurrency(category.predicted, profile?.currency || "USD")} ({predictedPercentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={predictedPercentage} className="h-1 opacity-60" />
                    
                    {category.predicted > category.budgeted && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive font-medium">
                          ⚠️ Likely to exceed budget by {formatCurrency(category.predicted - category.budgeted, profile?.currency || "USD")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartBudgeting;