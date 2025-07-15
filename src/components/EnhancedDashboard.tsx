import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, ArrowUpDown, CreditCard, PiggyBank, FileText, Coins } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { useBills } from "@/hooks/useBills";
import { useBudgets } from "@/hooks/useBudgets";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/utils/currencies";

const EnhancedDashboard = () => {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { bills, loading: billsLoading } = useBills();
  const { budgets, loading: budgetsLoading } = useBudgets();
  const { profile } = useAuth();

  if (transactionsLoading || billsLoading || budgetsLoading) {
    return <div>Loading...</div>;
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

  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(balance, profile?.currency || "USD")}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(totalIncome, profile?.currency || "USD")}
                </p>
              </div>
              <ArrowUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(totalExpenses, profile?.currency || "USD")}
                </p>
              </div>
              <ArrowDown className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Savings</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(12345, profile?.currency || "USD")}
                </p>
              </div>
              <PiggyBank className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Transactions */}
        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-primary" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.transaction_type === 'income' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                    }`}>
                      {transaction.transaction_type === 'income' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.transaction_type === 'income' ? 'text-success' : 'text-destructive'
                    }`}>
                      {transaction.transaction_type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount, profile?.currency || "USD")}
                    </p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Transactions
            </Button>
          </CardContent>
        </Card>

        {/* Bills Overview */}
        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-warning" />
              Bills Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold text-success">{billsPaid}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">{billsPending}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-destructive">{billsOverdue}</p>
              </div>
            </div>
            <Progress value={(billsPaid / bills.length) * 100} className="h-2" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{billsPaid} of {bills.length} bills paid</span>
              <span>{(billsPaid / bills.length * 100).toFixed(1)}%</span>
            </div>
            <Button variant="outline" className="w-full">
              Manage Bills
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Budget Overview */}
      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Coins className="w-5 h-5 text-success" />
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">You have {totalBudgets} budgets set up.</p>
          {budgets.map((budget) => (
            <div key={budget.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">{budget.category}</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(budget.amount, profile?.currency || "USD")}</p>
              </div>
              <Progress value={50} className="h-2" />
            </div>
          ))}
          <Button variant="outline" className="w-full">
            Manage Budgets
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDashboard;
