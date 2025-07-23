import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, ArrowUpDown, CreditCard, PiggyBank, FileText, Coins } from "lucide-react";
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

  if (transactionsLoading || billsLoading || budgetsLoading || savingsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate financial metrics
  const totalIncome = transactions
    .filter((t) => t.transaction_type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const billsPaid = bills.filter((bill) => bill.status === 'paid').length;
  const billsPending = bills.filter((bill) => bill.status === 'pending').length;
  const billsOverdue = bills.filter((bill) => bill.status === 'overdue').length;

  const totalBudgets = budgets.length;

  // Calculate savings goals metrics
  const totalSavingsGoalAmount = savingsGoals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const totalCurrentSavings = savingsGoals.reduce((sum, goal) => sum + goal.current_amount, 0);

  return (
    <div className="space-y-8">
      {/* Enhanced Overview Section with animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card hover-lift border-0 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Current Balance</p>
                <p className={`text-3xl font-bold tracking-tight ${
                  balance >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {formatCurrency(balance, profile?.currency || "USD")}
                </p>
                <div className="flex items-center gap-1 text-xs">
                  <div className={`w-2 h-2 rounded-full ${balance >= 0 ? 'bg-success' : 'bg-destructive'}`} />
                  <span className="text-muted-foreground">
                    {balance >= 0 ? 'Positive' : 'Negative'} balance
                  </span>
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-2xl">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift border-0 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Total Income</p>
                <p className="text-3xl font-bold text-success tracking-tight">
                  {formatCurrency(totalIncome, profile?.currency || "USD")}
                </p>
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-muted-foreground">This month</span>
                </div>
              </div>
              <div className="p-3 bg-success/10 rounded-2xl">
                <ArrowUp className="w-8 h-8 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift border-0 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Total Expenses</p>
                <p className="text-3xl font-bold text-destructive tracking-tight">
                  {formatCurrency(totalExpenses, profile?.currency || "USD")}
                </p>
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  <span className="text-muted-foreground">This month</span>
                </div>
              </div>
              <div className="p-3 bg-destructive/10 rounded-2xl">
                <ArrowDown className="w-8 h-8 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift border-0 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Savings Goals</p>
                <p className="text-3xl font-bold text-warning tracking-tight">
                  {savingsGoals.length > 0 
                    ? formatCurrency(totalCurrentSavings, profile?.currency || "USD")
                    : formatCurrency(0, profile?.currency || "USD")
                  }
                </p>
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                  <span className="text-muted-foreground">
                    {savingsGoals.length > 0 
                      ? `${savingsGoals.length} active goals`
                      : 'No goals set'
                    }
                  </span>
                </div>
              </div>
              <div className="p-3 bg-warning/10 rounded-2xl">
                <PiggyBank className="w-8 h-8 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Financial Snapshot */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="glass-card hover-lift border-0 group">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <ArrowUpDown className="w-5 h-5 text-primary" />
              </div>
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {transactions.length > 0 ? (
              <>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="glass-card p-4 hover:shadow-glow transition-all duration-200 group/item">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                            transaction.transaction_type === 'income' 
                              ? 'bg-success/20 text-success' 
                              : 'bg-destructive/20 text-destructive'
                          }`}>
                            {transaction.transaction_type === 'income' ? '+' : '-'}
                          </div>
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground group-hover/item:text-primary transition-colors">
                              {transaction.description}
                            </p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {transaction.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <p className={`font-bold text-lg ${
                            transaction.transaction_type === 'income' ? 'text-success' : 'text-destructive'
                          }`}>
                            {transaction.transaction_type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount, profile?.currency || "USD")}
                          </p>
                          <p className="text-sm text-muted-foreground">{transaction.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full hover-lift">
                  View All Transactions
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <ArrowUpDown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground">Start by adding your first transaction</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bills Overview */}
        <Card className="glass-card hover-lift border-0 group">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-xl">
                <FileText className="w-5 h-5 text-warning" />
              </div>
              Bills Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {bills.length > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="glass-card p-4 text-center hover-lift">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Paid</p>
                    <p className="text-3xl font-bold text-success">{billsPaid}</p>
                    <div className="w-8 h-1 bg-success rounded-full mx-auto mt-2" />
                  </div>
                  <div className="glass-card p-4 text-center hover-lift">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Pending</p>
                    <p className="text-3xl font-bold text-warning">{billsPending}</p>
                    <div className="w-8 h-1 bg-warning rounded-full mx-auto mt-2" />
                  </div>
                  <div className="glass-card p-4 text-center hover-lift">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Overdue</p>
                    <p className="text-3xl font-bold text-destructive">{billsOverdue}</p>
                    <div className="w-8 h-1 bg-destructive rounded-full mx-auto mt-2" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Payment Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {(billsPaid / bills.length * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={(billsPaid / bills.length) * 100} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {billsPaid} of {bills.length} bills completed
                  </p>
                </div>
                
                <Button variant="outline" className="w-full hover-lift">
                  Manage Bills
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No bills added</p>
                <p className="text-sm text-muted-foreground">Add your first bill to track payments</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Budget Overview */}
      <Card className="glass-card hover-lift border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-xl">
              <Coins className="w-5 h-5 text-success" />
            </div>
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {budgets.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-foreground font-medium">
                  Active Budgets ({totalBudgets})
                </p>
                <Badge variant="secondary" className="bg-success/20 text-success">
                  On Track
                </Badge>
              </div>
              
              <div className="grid gap-4">
                {budgets.map((budget) => (
                  <div key={budget.id} className="glass-card p-4 hover-lift group/budget">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
                          <Coins className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground capitalize">{budget.category}</p>
                          <p className="text-sm text-muted-foreground">Monthly Budget</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">
                          {formatCurrency(budget.amount, profile?.currency || "USD")}
                        </p>
                        <p className="text-sm text-muted-foreground">allocated</p>
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
              
              <Button variant="outline" className="w-full hover-lift">
                Manage All Budgets
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <Coins className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No budgets created</p>
              <p className="text-sm text-muted-foreground">Create your first budget to track spending</p>
              <Button className="mt-4 hover-lift">
                Create Budget
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDashboard;
