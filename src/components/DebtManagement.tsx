import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, AlertTriangle, Calculator, TrendingDown } from "lucide-react";

interface Debt {
  id: string;
  name: string;
  type: string;
  balance: number;
  originalAmount: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

const DebtManagement = () => {
  const [debts] = useState<Debt[]>([
    {
      id: "1",
      name: "Credit Card - GTBank",
      type: "Credit Card",
      balance: 85000,
      originalAmount: 120000,
      interestRate: 24.0,
      minimumPayment: 8500,
      dueDate: "2025-01-25",
      priority: "high"
    },
    {
      id: "2",
      name: "Personal Loan - Access Bank",
      type: "Personal Loan",
      balance: 450000,
      originalAmount: 600000,
      interestRate: 18.5,
      minimumPayment: 25000,
      dueDate: "2025-01-30",
      priority: "medium"
    },
    {
      id: "3",
      name: "Car Loan - First Bank",
      type: "Auto Loan",
      balance: 1200000,
      originalAmount: 2000000,
      interestRate: 15.0,
      minimumPayment: 45000,
      dueDate: "2025-02-05",
      priority: "low"
    }
  ]);

  const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>('avalanche');

  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  const totalOriginalAmount = debts.reduce((sum, debt) => sum + debt.originalAmount, 0);
  const totalPaidOff = totalOriginalAmount - totalDebt;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getProgressPercentage = (paid: number, original: number) => {
    return ((original - paid) / original) * 100;
  };

  const getSortedDebts = () => {
    if (strategy === 'snowball') {
      return [...debts].sort((a, b) => a.balance - b.balance);
    } else {
      return [...debts].sort((a, b) => b.interestRate - a.interestRate);
    }
  };

  const calculatePayoffTime = (debt: Debt, extraPayment: number = 0) => {
    const monthlyPayment = debt.minimumPayment + extraPayment;
    const monthlyRate = debt.interestRate / 100 / 12;
    const months = Math.log(1 + (debt.balance * monthlyRate) / monthlyPayment) / Math.log(1 + monthlyRate);
    return Math.ceil(months);
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
                <p className="text-2xl font-bold text-destructive">₦{totalDebt.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-foreground">₦{totalMinimumPayment.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-success">₦{totalPaidOff.toLocaleString()}</p>
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
                  {((totalPaidOff / totalOriginalAmount) * 100).toFixed(1)}%
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
                  <DebtCard key={debt.id} debt={debt} rank={index + 1} />
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
                  <DebtCard key={debt.id} debt={debt} rank={index + 1} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

const DebtCard = ({ debt, rank }: { debt: Debt; rank: number }) => {
  const progressPercentage = ((debt.originalAmount - debt.balance) / debt.originalAmount) * 100;
  const payoffMonths = Math.ceil(debt.balance / debt.minimumPayment);

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
          <p className="text-2xl font-bold text-foreground">₦{debt.balance.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">
            {debt.interestRate}% APR
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
            <p className="text-lg font-bold text-foreground">₦{debt.minimumPayment.toLocaleString()}</p>
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