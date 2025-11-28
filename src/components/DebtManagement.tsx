
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, AlertTriangle, Calculator, TrendingDown, Loader2 } from "lucide-react";
import { useDebts } from "@/hooks/useDebts";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/utils/currencies";
import EmptyState from "./EmptyState";

const DebtManagement = () => {
  const { debts, loading } = useDebts();
  const { profile } = useAuth();
  const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>('avalanche');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Debt Management</h2>
            <p className="text-muted-foreground">Track and manage your debts</p>
          </div>
        </div>
        
        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading debts...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (debts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Debt Management</h2>
            <p className="text-muted-foreground">Track and manage your debts</p>
          </div>
        </div>
        
        <EmptyState type="debts" />
      </div>
    );
  }

  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  const totalOriginalAmount = debts.reduce((sum, debt) => sum + debt.original_amount, 0);
  const totalPaidOff = totalOriginalAmount - totalDebt;

  const getSortedDebts = () => {
    if (strategy === 'snowball') {
      return [...debts].sort((a, b) => a.balance - b.balance);
    } else {
      return [...debts].sort((a, b) => b.interest_rate - a.interest_rate);
    }
  };

  return (
    <div className="space-y-6">
      {/* Debt Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Debt</p>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(totalDebt, profile?.currency || "USD")}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Payments</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(totalMinimumPayment, profile?.currency || "USD")}
                </p>
              </div>
              <Calculator className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid Off</p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(totalPaidOff, profile?.currency || "USD")}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalOriginalAmount > 0 ? ((totalPaidOff / totalOriginalAmount) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">Debt Management</CardTitle>
        </CardHeader>
        
        <CardContent>
          <Tabs value={strategy} onValueChange={(value) => setStrategy(value as 'snowball' | 'avalanche')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="avalanche">Debt Avalanche</TabsTrigger>
              <TabsTrigger value="snowball">Debt Snowball</TabsTrigger>
            </TabsList>
            
            <TabsContent value="avalanche" className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Debt Avalanche Strategy</h3>
                <p className="text-sm text-blue-700">
                  Pay minimum on all debts, then put extra money toward the debt with the highest interest rate. 
                  This saves the most money on interest over time.
                </p>
              </div>
              
              <div className="space-y-4">
                {getSortedDebts().map((debt, index) => (
                  <DebtCard key={debt.id} debt={debt} rank={index + 1} currency={profile?.currency || "USD"} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="snowball" className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Debt Snowball Strategy</h3>
                <p className="text-sm text-green-700">
                  Pay minimum on all debts, then put extra money toward the smallest debt first. 
                  This provides psychological wins and momentum.
                </p>
              </div>
              
              <div className="space-y-4">
                {getSortedDebts().map((debt, index) => (
                  <DebtCard key={debt.id} debt={debt} rank={index + 1} currency={profile?.currency || "USD"} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

interface DebtCardProps {
  debt: {
    id: string;
    name: string;
    type: string;
    balance: number;
    original_amount: number;
    interest_rate: number;
    minimum_payment: number;
    priority: string;
  };
  rank: number;
  currency: string;
}

const DebtCard = ({ debt, rank, currency }: DebtCardProps) => {
  const progressPercentage = ((debt.original_amount - debt.balance) / debt.original_amount) * 100;
  const payoffMonths = Math.ceil(debt.balance / debt.minimum_payment);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card/50 hover:bg-card transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
            {rank}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{debt.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{debt.type}</Badge>
              <Badge className={getPriorityColor(debt.priority)}>
                {debt.priority} priority
              </Badge>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{formatCurrency(debt.balance, currency)}</p>
          <p className="text-sm text-muted-foreground">
            {debt.interest_rate}% APR
          </p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold text-foreground">
            {progressPercentage.toFixed(1)}% paid off
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div>
            <p className="text-sm font-medium text-foreground">Minimum Payment</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(debt.minimum_payment, currency)}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-foreground">Payoff Time</p>
            <p className="text-lg font-bold text-foreground">{payoffMonths} months</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              Calculate
            </Button>
            <Button size="sm" className="flex-1 bg-gradient-primary">
              Pay Extra
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtManagement;
