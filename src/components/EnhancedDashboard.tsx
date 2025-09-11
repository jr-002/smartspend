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
  const totalSavingsGoalAmount = safeSavingsGoals
    .filter(goal => typeof goal?.target_amount === 'number')
    .reduce((sum, goal) => sum + goal.target_amount, 0);
  const totalCurrentSavings = safeSavingsGoals
    .filter(goal => typeof goal?.current_amount === 'number')
    .reduce((sum, goal) => sum + goal.current_amount, 0);

  return (
    <div className="section-spacing">
      {/* Enhanced Overview Section with animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-clean hover-lift group relative overflow-hidden">
          <CardContent className="content-spacing relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                <p className={`text-3xl font-bold tracking-tight ${
                  balance >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {formatCurrency(balance, userCurrency)}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <CreditCard className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-clean hover-lift group relative overflow-hidden">
          <CardContent className="content-spacing relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                <p className="text-3xl font-bold text-success tracking-tight">
                  {formatCurrency(totalIncome, userCurrency)}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <ArrowUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-clean hover-lift group relative overflow-hidden">
          <CardContent className="content-spacing relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                <p className="text-3xl font-bold text-destructive tracking-tight">
                  {formatCurrency(totalExpenses, userCurrency)}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <ArrowDown className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-clean hover-lift group relative overflow-hidden">
          <CardContent className="content-spacing relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Savings Goals</p>
                <p className="text-3xl font-bold text-warning tracking-tight">
                  {savingsGoals.length > 0 
                    ? formatCurrency(totalCurrentSavings, userCurrency)
                    : formatCurrency(0, userCurrency)
                  }
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <PiggyBank className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Financial Snapshot */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="card-clean">
          <CardHeader>
            <CardTitle className="heading-secondary flex items-center gap-3">
              <ArrowUpDown className="w-5 h-5 text-primary" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="card-spacing">
            {transactions.length > 0 ? (
              <>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                            transaction.transaction_type === 'income' 
                              ? 'bg-success/10 text-success' 
                              : 'bg-destructive/10 text-destructive'
                          }`}>
                            {transaction.transaction_type === 'income' ? '+' : '-'}
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {transaction.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <p className={`font-semibold ${
                            transaction.transaction_type === 'income' ? 'text-success' : 'text-destructive'
                          }`}>
                            {transaction.transaction_type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount, userCurrency)}
                          </p>
                          <p className="text-xs text-muted-foreground">{transaction.date}</p>
                        </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full">
                  View All Transactions
                </Button>
              </>
            ) : (
              <div className="text-center py-12">
                <ArrowUpDown className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-subtle">Start by adding your first transaction</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bills Overview */}
        <Card className="card-clean">
          <CardHeader>
            <CardTitle className="heading-secondary flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              Bills Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="card-spacing">
            {bills.length > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 text-center rounded-lg border border-border/50">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Paid</p>
                    <p className="text-3xl font-bold text-success">{billsPaid}</p>
                  </div>
                  <div className="p-4 text-center rounded-lg border border-border/50">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Pending</p>
                    <p className="text-3xl font-bold text-warning">{billsPending}</p>
                  </div>
                  <div className="p-4 text-center rounded-lg border border-border/50">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Overdue</p>
                    <p className="text-3xl font-bold text-destructive">{billsOverdue}</p>
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
                  <p className="text-subtle">
                    {billsPaid} of {bills.length} bills completed
                  </p>
                </div>
                
                <Button variant="outline" className="w-full">
                  Manage Bills
                </Button>
              </>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No bills added</p>
                <p className="text-subtle">Add your first bill to track payments</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Budget Overview */}
      <Card className="card-clean">
        <CardHeader>
          <CardTitle className="heading-secondary flex items-center gap-3">
            <Coins className="w-5 h-5 text-primary" />
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="card-spacing">
          {budgets.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-foreground font-medium">
                  Active Budgets ({totalBudgets})
                </p>
                <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                  On Track
                </Badge>
              </div>
              
              <div className="grid gap-4">
                {budgets.map((budget) => (
                  <div key={budget.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Coins className="w-4 h-4 text-primary/70" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{budget.category}</p>
                          <p className="text-subtle">Monthly Budget</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">
                          {formatCurrency(budget.amount, userCurrency)}
                        </p>
                        <p className="text-subtle">allocated</p>
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
              
              <Button variant="outline" className="w-full">
                Manage All Budgets
              </Button>
            </>
          ) : (
            <div className="text-center py-12">
              <Coins className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No budgets created</p>
              <p className="text-subtle">Create your first budget to track spending</p>
              <Button className="mt-4">
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
