
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, ArrowUpDown, CreditCard, PiggyBank, FileText, Coins, Calculator, Target, Brain } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { useBills } from "@/hooks/useBills";
import { useBudgets } from "@/hooks/useBudgets";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/utils/currencies";

const EnhancedDashboard = () => {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { bills, loading: billsLoading } = useBills();
  const { budgets, loading: budgetsLoading } = useBudgets();
  const { goals: savingsGoals, loading: savingsLoading } = useSavingsGoals();
  const { profile } = useAuth();

  // Show loading only if all are loading (initial load)
  const isInitialLoading = transactionsLoading && billsLoading && budgetsLoading && savingsLoading;
  
  // Calculate financial metrics with safety checks
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeBills = Array.isArray(bills) ? bills : [];
  const safeBudgets = Array.isArray(budgets) ? budgets : [];
  const safeSavingsGoals = Array.isArray(savingsGoals) ? savingsGoals : [];

  // Get user's preferred currency
  const userCurrency = profile?.currency || "USD";

  const totalIncome = safeTransactions
    .filter((t) => t?.transaction_type === 'income' && typeof t.amount === 'number')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = safeTransactions
    .filter((t) => t?.transaction_type === 'expense' && typeof t.amount === 'number')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const billsPaid = safeBills.filter((bill) => bill?.status === 'paid').length;
  const billsPending = safeBills.filter((bill) => bill?.status === 'pending').length;
  const billsOverdue = safeBills.filter((bill) => bill?.status === 'overdue').length;

  const totalBudgets = safeBudgets.length;

  // Calculate savings goals metrics
  const totalCurrentSavings = safeSavingsGoals
    .filter(goal => typeof goal?.current_amount === 'number')
    .reduce((sum, goal) => sum + goal.current_amount, 0);

  if (isInitialLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border/50 p-6 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-muted/60 rounded w-1/2"></div>
                <div className="h-8 bg-muted/60 rounded w-3/4"></div>
                <div className="h-3 bg-muted/40 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {profile?.name || 'User'}!</h1>
        <p className="text-muted-foreground text-base sm:text-lg">Here's your financial overview for today.</p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover-lift group relative overflow-hidden border-border/50">
          <CardContent className="p-4 sm:p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                <p className={`text-3xl font-bold tracking-tight ${
                  balance >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {formatCurrency(balance, userCurrency)}
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {balance >= 0 ? 'Positive balance' : 'Negative balance'}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift group relative overflow-hidden border-border/50">
          <CardContent className="p-4 sm:p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                <p className="text-2xl sm:text-3xl font-bold text-success tracking-tight">
                  {formatCurrency(totalIncome, userCurrency)}
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">This month</p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <ArrowUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift group relative overflow-hidden border-border/50">
          <CardContent className="p-4 sm:p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                <p className="text-2xl sm:text-3xl font-bold text-destructive tracking-tight">
                  {formatCurrency(totalExpenses, userCurrency)}
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">This month</p>
              </div>
              <div className="p-3 bg-destructive/10 rounded-lg">
                <ArrowDown className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift group relative overflow-hidden border-border/50">
          <CardContent className="p-4 sm:p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Savings Goals</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                  {savingsGoals.length > 0 
                    ? formatCurrency(totalCurrentSavings, userCurrency)
                    : formatCurrency(0, userCurrency)
                  }
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {savingsGoals.length} active goals
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <PiggyBank className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Activity Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Transactions */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold flex items-center gap-3">
                <ArrowUpDown className="w-5 h-5 text-primary" />
                Recent Transactions
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {transactions.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-border/30 hover:bg-muted/30 transition-all duration-200 group">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                          transaction.transaction_type === 'income' 
                            ? 'bg-success/10 text-success border border-success/20' 
                            : 'bg-destructive/10 text-destructive border border-destructive/20'
                        }`}>
                          {transaction.transaction_type === 'income' ? '+' : '−'}
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-muted-foreground hidden sm:block">
                            {transaction.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className={`font-semibold ${
                          transaction.transaction_type === 'income' ? 'text-success' : 'text-destructive'
                        }`}>
                          {transaction.transaction_type === 'income' ? '+' : '−'}
                          {formatCurrency(transaction.amount, userCurrency)}
                        </p>
                        <p className="text-xs text-muted-foreground hidden sm:block">{transaction.date}</p>
                      </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ArrowUpDown className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">No transactions yet</h3>
                <p className="text-muted-foreground mb-4">Start by adding your first transaction</p>
                <Button className="bg-primary hover:bg-primary/90">
                  Add Transaction
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bills Overview */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                Bills Overview
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                Manage Bills
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {bills.length > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 rounded-lg border border-border/30 bg-success/5">
                    <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <span className="text-success font-bold text-sm">✓</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-success">{billsPaid}</p>
                    <p className="text-xs text-muted-foreground">Paid</p>
                  </div>
                  <div className="text-center p-3 sm:p-4 rounded-lg border border-border/30 bg-warning/5">
                    <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <span className="text-warning font-bold text-sm">⏳</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-warning">{billsPending}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                  <div className="text-center p-3 sm:p-4 rounded-lg border border-border/30 bg-destructive/5">
                    <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <span className="text-destructive font-bold text-sm">!</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-destructive">{billsOverdue}</p>
                    <p className="text-xs text-muted-foreground">Overdue</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Payment Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {(billsPaid / bills.length * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={(billsPaid / bills.length) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {billsPaid} of {bills.length} bills completed this month
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">No bills added</h3>
                <p className="text-muted-foreground mb-4">Add your first bill to track payments</p>
                <Button className="bg-primary hover:bg-primary/90">
                  Add Bill
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget Overview */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center gap-3">
              <Coins className="w-5 h-5 text-primary" />
              Budget Overview
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              Manage Budgets
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {budgets.length > 0 ? (
            <>
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Coins className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Active Budgets ({totalBudgets})</p>
                    <p className="text-sm text-muted-foreground">Monthly budget tracking</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                  On Track
                </Badge>
              </div>
              
              <div className="grid gap-4">
                {budgets.slice(0, 3).map((budget) => (
                  <div key={budget.id} className="p-3 sm:p-4 rounded-lg border border-border/30 hover:bg-muted/20 transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Coins className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{budget.category}</p>
                          <p className="text-xs text-muted-foreground hidden sm:block">Monthly Budget</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">
                          {formatCurrency(budget.amount, userCurrency)}
                        </p>
                        <p className="text-xs text-muted-foreground hidden sm:block">allocated</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-foreground">50%</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Coins className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">No budgets created</h3>
              <p className="text-muted-foreground mb-4">Create your first budget to track spending</p>
              <Button className="bg-primary hover:bg-primary/90">
                Create Budget
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
          <CardDescription>Common tasks to manage your finances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/30">
              <ArrowUpDown className="w-6 h-6 text-primary" />
              <span className="text-xs sm:text-sm font-medium">Add Transaction</span>
            </Button>
            <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/30">
              <Calculator className="w-6 h-6 text-primary" />
              <span className="text-xs sm:text-sm font-medium">Create Budget</span>
            </Button>
            <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/30">
              <Target className="w-6 h-6 text-primary" />
              <span className="text-xs sm:text-sm font-medium">Set Goal</span>
            </Button>
            <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/30">
              <Brain className="w-6 h-6 text-primary" />
              <span className="text-xs sm:text-sm font-medium">AI Insights</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDashboard;