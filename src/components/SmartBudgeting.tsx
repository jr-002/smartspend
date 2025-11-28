import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Calculator, TrendingUp, TrendingDown, Target, Loader2, Plus, Trash2 } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets, type NewBudget } from "@/hooks/useBudgets";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/currencies";
import EmptyState from "./EmptyState";

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
  const { transactions = [], loading: transactionsLoading } = useTransactions();
  const { budgets = [], loading: budgetsLoading, addBudget, deleteBudget } = useBudgets();
  const { profile } = useAuth();
  
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBudget, setNewBudget] = useState<NewBudget>({
    category: "",
    amount: 0,
    period: "monthly"
  });

  // Calculate current month spending by category
  const getCurrentMonthSpending = useCallback(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const safeTransactions = Array.isArray(transactions) ? transactions : [];
    const currentMonthTransactions = safeTransactions.filter(t => 
      t.date.startsWith(currentMonth) && t.transaction_type === 'expense'
    );

    const categorySpending: Record<string, number> = {};
    currentMonthTransactions.forEach(transaction => {
      categorySpending[transaction.category] = (categorySpending[transaction.category] || 0) + transaction.amount;
    });

    return categorySpending;
  }, [transactions]);

  const handleAddBudget = async () => {
    if (!newBudget.category?.trim() || !newBudget.amount || newBudget.amount <= 0) {
      toast({
        title: "Error",
        description: "Please provide a valid category name and amount greater than zero.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate category
    const existingBudget = budgetCategories.find(cat => 
      cat.name.toLowerCase() === newBudget.category.toLowerCase()
    );
    
    if (existingBudget) {
      toast({
        title: "Error",
        description: "A budget for this category already exists.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const success = await addBudget(newBudget);
    
    if (success) {
      setNewBudget({ category: "", amount: 0, period: "monthly" });
      setIsAddDialogOpen(false);
    }
    
    setIsSubmitting(false);
  };

  const handleDeleteBudget = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      await deleteBudget(id);
    }
  };

  // Initialize budget categories from existing budgets and transactions
  useEffect(() => {
    if (transactionsLoading || budgetsLoading) return;
    
    // Ensure we have arrays to work with
    const safeBudgets = Array.isArray(budgets) ? budgets : [];
    
    const currentMonthSpending = getCurrentMonthSpending();
    
    const categories = safeBudgets.map(budget => ({
      id: budget.id,
      name: budget.category,
      budgeted: budget.amount,
      spent: currentMonthSpending[budget.category] || 0,
      predicted: currentMonthSpending[budget.category] || 0,
      color: getColorForCategory(budget.category),
      trend: 'stable' as 'up' | 'down' | 'stable'
    }));

    setBudgetCategories(categories);
  }, [transactions, budgets, transactionsLoading, budgetsLoading, getCurrentMonthSpending]);

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

  const getProgressPercentage = (spent: number, budgeted: number) => {
    if (budgeted === 0) return 0;
    return Math.min((spent / budgeted) * 100, 100);
  };

  const getStatusColor = (spent: number, budgeted: number) => {
    if (budgeted === 0) return "text-muted-foreground";
    const percentage = (spent / budgeted) * 100;
    if (percentage > 100) return "text-destructive";
    if (percentage > 80) return "text-warning";
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
    spent: cat.spent
  }));

  if (transactionsLoading || budgetsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Smart Budgeting</h2>
            <p className="text-muted-foreground">AI-powered budget management</p>
          </div>
        </div>
        
        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading budget data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (budgetCategories.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Smart Budgeting</h2>
            <p className="text-muted-foreground">AI-powered budget management</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
                <DialogDescription>
                  Create a new budget category with spending limits and tracking.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={newBudget.category}
                    onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                    placeholder="e.g., Food, Transportation"
                  />
                </div>
                  <div>
                    <Label htmlFor="period">Period</Label>
                    <select 
                      id="period"
                      value={newBudget.period}
                      onChange={(e) => setNewBudget({...newBudget, period: e.target.value as 'weekly' | 'monthly' | 'yearly'})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount ({newBudget.period === 'weekly' ? 'Weekly' : newBudget.period === 'monthly' ? 'Monthly' : 'Yearly'})</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newBudget.amount || ""}
                      onChange={(e) => setNewBudget({...newBudget, amount: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                <Button 
                  onClick={handleAddBudget} 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Budget"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <EmptyState type="budgets" onAdd={() => setIsAddDialogOpen(true)} />
      </div>
    );
  }

  return (
    <div className="section-spacing">
      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="card-clean">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Budgeted</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{formatCurrency(totalBudgeted, profile?.currency || "USD")}</p>
              </div>
              <div className="p-2 bg-muted rounded-lg hidden sm:block">
                <Calculator className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-clean">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{formatCurrency(totalSpent, profile?.currency || "USD")}</p>
              </div>
              <div className="p-2 bg-muted rounded-lg hidden sm:block">
                <Target className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-clean">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Remaining</p>
                <p className={`text-xl sm:text-2xl font-bold ${totalBudgeted - totalSpent >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(totalBudgeted - totalSpent, profile?.currency || "USD")}
                </p>
              </div>
              <div className="p-2 bg-muted rounded-lg hidden sm:block">
                <TrendingUp className={`w-6 h-6 ${totalBudgeted - totalSpent >= 0 ? 'text-success' : 'text-destructive'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {pieChartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="card-clean">
            <CardHeader>
              <CardTitle className="heading-secondary">Spending Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] sm:h-[300px]">
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
                    <Tooltip formatter={(value) => formatCurrency(Number(value), profile?.currency || "USD")} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="card-clean">
            <CardHeader>
              <CardTitle className="heading-secondary">Budget vs Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value), profile?.currency || "USD")} />
                    <Bar dataKey="budgeted" fill="hsl(var(--muted-foreground))" name="Budgeted" />
                    <Bar dataKey="spent" fill="hsl(var(--primary))" name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budget Categories */}
      <Card className="card-clean">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="heading-primary">Budget Categories</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Budget
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Budget</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newBudget.category}
                      onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                      placeholder="e.g., Food, Transportation"
                    />
                  </div>
                  <div>
                    <Label htmlFor="period">Period</Label>
                    <select 
                      id="period"
                      value={newBudget.period}
                      onChange={(e) => setNewBudget({...newBudget, period: e.target.value as 'weekly' | 'monthly' | 'yearly'})}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount ({newBudget.period === 'weekly' ? 'Weekly' : newBudget.period === 'monthly' ? 'Monthly' : 'Yearly'})</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newBudget.amount || ""}
                      onChange={(e) => setNewBudget({...newBudget, amount: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                  <Button 
                    onClick={handleAddBudget} 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Budget"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {budgetCategories.map((category) => {
              const progressPercentage = getProgressPercentage(category.spent, category.budgeted);
              
              return (
                <div key={category.id} className="p-4 sm:p-6 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3 sm:gap-0">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                      <div>
                        <h3 className="font-semibold text-foreground">{category.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getTrendIcon(category.trend)}
                          <span className="text-subtle">
                            {category.trend === 'up' ? 'Trending up' : 
                             category.trend === 'down' ? 'Trending down' : 'Stable'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <p className="text-lg sm:text-xl font-bold text-foreground">{formatCurrency(category.spent, profile?.currency || "USD")}</p>
                        <p className="text-subtle">
                          of {formatCurrency(category.budgeted, profile?.currency || "USD")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBudget(category.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className={`font-semibold ${getStatusColor(category.spent, category.budgeted)}`}>
                        {progressPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    
                    {category.spent > category.budgeted && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive font-medium">
                          ⚠️ Over budget by {formatCurrency(category.spent - category.budgeted, profile?.currency || "USD")}
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