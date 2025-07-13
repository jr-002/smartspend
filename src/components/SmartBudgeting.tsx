import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Calculator, AlertTriangle, TrendingUp, TrendingDown, Target, Brain } from "lucide-react";

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
  const [budgetCategories] = useState<BudgetCategory[]>([
    {
      id: "1",
      name: "Food & Dining",
      budgeted: 50000,
      spent: 45200,
      predicted: 52800,
      color: "#3B82F6",
      trend: "up"
    },
    {
      id: "2",
      name: "Transportation",
      budgeted: 25000,
      spent: 22500,
      predicted: 27200,
      color: "#10B981",
      trend: "up"
    },
    {
      id: "3",
      name: "Entertainment",
      budgeted: 15000,
      spent: 8200,
      predicted: 12400,
      color: "#8B5CF6",
      trend: "down"
    },
    {
      id: "4",
      name: "Shopping",
      budgeted: 30000,
      spent: 35600,
      predicted: 42800,
      color: "#F59E0B",
      trend: "up"
    },
    {
      id: "5",
      name: "Bills & Utilities",
      budgeted: 40000,
      spent: 38500,
      predicted: 39200,
      color: "#EF4444",
      trend: "stable"
    }
  ]);

  const [predictiveAnalysis] = useState({
    monthlyIncome: 280000,
    projectedExpenses: 174400,
    projectedSavings: 105600,
    savingsRate: 37.7,
    budgetVariance: -8400,
    riskLevel: "medium"
  });

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
      case 'up': return <TrendingUp className="w-4 h-4 text-destructive" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-success" />;
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
      <Alert className={`border-warning bg-warning/10 ${predictiveAnalysis.budgetVariance < 0 ? 'border-destructive bg-destructive/10' : ''}`}>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          <strong>AI Prediction:</strong> Based on your spending patterns, you're likely to exceed your budget by ₦{Math.abs(predictiveAnalysis.budgetVariance).toLocaleString()} this month. 
          Consider adjusting your shopping and food spending.
        </AlertDescription>
      </Alert>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budgeted</p>
                <p className="text-2xl font-bold text-foreground">₦{totalBudgeted.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-foreground">₦{totalSpent.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-destructive">₦{totalPredicted.toLocaleString()}</p>
              </div>
              <Brain className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Projected Savings</p>
                <p className="text-2xl font-bold text-success">₦{predictiveAnalysis.projectedSavings.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
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

      {/* Budget Categories */}
      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-foreground">Smart Budget Tracking</CardTitle>
            <Button className="bg-gradient-primary">
              Auto-Generate Budget
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
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
                            {category.trend === 'up' ? 'Trending up' : 
                             category.trend === 'down' ? 'Trending down' : 'Stable'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">₦{category.spent.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">of ₦{category.budgeted.toLocaleString()}</p>
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
                        ₦{category.predicted.toLocaleString()} ({predictedPercentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={predictedPercentage} className="h-1 opacity-60" />
                    
                    {category.predicted > category.budgeted && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive font-medium">
                          ⚠️ Likely to exceed budget by ₦{(category.predicted - category.budgeted).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartBudgeting;