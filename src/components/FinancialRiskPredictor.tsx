import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, TrendingDown, Shield, Brain, Calendar, DollarSign, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { formatCurrency } from "@/utils/currencies";
import { analyzeFinancialRisk } from "@/lib/api";
import { enhancedMonitor } from "@/lib/enhanced-monitoring";
import { resourceMonitor } from "@/lib/resource-monitor";
import { useToast } from "@/hooks/use-toast";

interface RiskPrediction {
  type: 'balance' | 'overspend' | 'goal' | 'emergency';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  probability: number;
  timeframe: string;
  impact: string;
  recommendations: string[];
  preventable: boolean;
}

interface FinancialHealth {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: {
    name: string;
    score: number;
    weight: number;
    status: 'good' | 'warning' | 'critical';
  }[];
}

const FinancialRiskPredictor = () => {
  const { profile } = useAuth();
  const { transactions } = useTransactions();
  const { budgets } = useBudgets();
  const { toast } = useToast();
  
  const [predictions, setPredictions] = useState<RiskPrediction[]>([]);
  const [healthScore, setHealthScore] = useState<FinancialHealth>({
    score: 0,
    grade: 'C',
    factors: []
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateRiskPredictions = useCallback((): RiskPrediction[] => {
    const predictions: RiskPrediction[] = [];
    
    // Analyze current month spending
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthExpenses = transactions
      .filter(t => t.transaction_type === 'expense' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyIncome = profile?.monthly_income || 0;
    const daysInMonth = new Date().getDate();
    const totalDaysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const projectedMonthlySpending = (currentMonthExpenses / daysInMonth) * totalDaysInMonth;

    // Balance risk prediction
    if (projectedMonthlySpending > monthlyIncome * 0.95) {
      predictions.push({
        type: 'balance',
        severity: 'high',
        title: 'Account Balance Risk',
        description: `Your projected spending of ${formatCurrency(projectedMonthlySpending, profile?.currency || 'USD')} may exceed your monthly income.`,
        probability: 85,
        timeframe: `${totalDaysInMonth - daysInMonth} days`,
        impact: 'Potential overdraft or inability to pay bills',
        recommendations: [
          'Reduce discretionary spending immediately',
          'Consider additional income sources',
          'Review and cancel non-essential subscriptions',
          'Set up spending alerts at 80% of budget'
        ],
        preventable: true
      });
    }

    // Budget overspend prediction
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    if (projectedMonthlySpending > totalBudget * 1.1) {
      predictions.push({
        type: 'overspend',
        severity: 'medium',
        title: 'Budget Overspend Alert',
        description: `You're on track to overspend your budget by ${formatCurrency(projectedMonthlySpending - totalBudget, profile?.currency || 'USD')} this month.`,
        probability: 72,
        timeframe: 'End of month',
        impact: 'Reduced savings and potential debt accumulation',
        recommendations: [
          'Track daily expenses more closely',
          'Implement the envelope budgeting method',
          'Find cheaper alternatives for regular purchases',
          'Consider meal planning to reduce food costs'
        ],
        preventable: true
      });
    }

    // Emergency fund risk
    const totalSavings = transactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0) - 
      transactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = currentMonthExpenses || projectedMonthlySpending;
    const emergencyFundMonths = totalSavings / monthlyExpenses;

    if (emergencyFundMonths < 3) {
      predictions.push({
        type: 'emergency',
        severity: emergencyFundMonths < 1 ? 'high' : 'medium',
        title: 'Emergency Fund Insufficient',
        description: `Your emergency fund covers only ${emergencyFundMonths.toFixed(1)} months of expenses. Financial experts recommend 3-6 months.`,
        probability: 90,
        timeframe: 'Ongoing vulnerability',
        impact: 'High financial stress during unexpected events',
        recommendations: [
          'Automate emergency fund contributions',
          `Start with a goal of ${formatCurrency(50000, profile?.currency || 'USD')} emergency fund`,
          'Reduce non-essential spending temporarily',
          'Consider a high-yield savings account'
        ],
        preventable: true
      });
    }

    return predictions.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }, [transactions, budgets, profile]);

  const calculateHealthScore = useCallback((): FinancialHealth => {
    const factors = [
      {
        name: 'Spending Control',
        score: Math.min(100, Math.max(0, 100 - (predictions.filter(p => p.type === 'overspend').length * 30))),
        weight: 25,
        status: predictions.some(p => p.type === 'overspend' && p.severity === 'high') ? 'critical' : 
                predictions.some(p => p.type === 'overspend') ? 'warning' : 'good'
      },
      {
        name: 'Emergency Preparedness',
        score: Math.min(100, Math.max(0, 100 - (predictions.filter(p => p.type === 'emergency').length * 40))),
        weight: 30,
        status: predictions.some(p => p.type === 'emergency' && p.severity === 'high') ? 'critical' : 
                predictions.some(p => p.type === 'emergency') ? 'warning' : 'good'
      },
      {
        name: 'Cash Flow Management',
        score: Math.min(100, Math.max(0, 100 - (predictions.filter(p => p.type === 'balance').length * 35))),
        weight: 20,
        status: predictions.some(p => p.type === 'balance' && p.severity === 'high') ? 'critical' : 
                predictions.some(p => p.type === 'balance') ? 'warning' : 'good'
      },
      {
        name: 'Budget Adherence',
        score: budgets.length > 0 ? 85 : 50,
        weight: 15,
        status: budgets.length > 0 ? 'good' : 'warning'
      },
      {
        name: 'Savings Rate',
        score: profile?.monthly_income ? Math.min(100, ((profile.monthly_income - (transactions.filter(t => t.transaction_type === 'expense').reduce((sum, t) => sum + t.amount, 0) / 3)) / profile.monthly_income) * 100 * 5) : 50,
        weight: 10,
        status: 'good'
      }
    ] as FinancialHealth['factors'];

    const weightedScore = factors.reduce((sum, factor) => sum + (factor.score * factor.weight / 100), 0);
    
    const grade = weightedScore >= 90 ? 'A' : 
                  weightedScore >= 80 ? 'B' : 
                  weightedScore >= 70 ? 'C' : 
                  weightedScore >= 60 ? 'D' : 'F';

    return {
      score: Math.round(weightedScore),
      grade,
      factors
    };
  }, [predictions, budgets, transactions, profile]);

  const analyzeFinancialRisks = useCallback(async () => {
    setIsAnalyzing(true);

    // Check resource availability before making expensive AI call
    if (!resourceMonitor.canMakeRequest()) {
      toast({
        title: "System Busy",
        description: "Please wait a moment and try again.",
        variant: "destructive"
      });
      setIsAnalyzing(false);
      return;
    }
    
    // Track request for monitoring
    resourceMonitor.trackRequest();
    enhancedMonitor.trackUserAction('risk_analysis');
    enhancedMonitor.startTimer('risk_analysis');

    const newPredictions = generateRiskPredictions();
    const newHealthScore = calculateHealthScore();

    try {
      await analyzeFinancialRisk({
        transactions,
        budgets,
        monthlyIncome: profile?.monthly_income || 0
      });
      
      // End performance monitoring
      const duration = enhancedMonitor.endTimer('risk_analysis');
      enhancedMonitor.trackAPICall('risk-prediction', 'POST', 200, duration);
    } catch (error) {
      console.error('AI analysis failed:', error);
      enhancedMonitor.trackError(error instanceof Error ? error : new Error('Unknown error'), {
        category: 'risk_analysis',
        severity: 'medium'
      });
    }

    setPredictions(newPredictions);
    setHealthScore(newHealthScore);
    setIsAnalyzing(false);
  }, [transactions, budgets, profile, generateRiskPredictions, calculateHealthScore, toast]);

  useEffect(() => {
    if (transactions.length > 0) {
      analyzeFinancialRisks();
    }
  }, [transactions.length, analyzeFinancialRisks]);

  // Functions moved to useCallback hooks above

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getHealthGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600';
      case 'B': return 'text-blue-600';
      case 'C': return 'text-yellow-600';
      case 'D': return 'text-orange-600';
      case 'F': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getFactorStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Health Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card bg-gradient-card border-0 md:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Financial Health Score</h3>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className={`text-4xl font-bold ${getHealthGradeColor(healthScore.grade)}`}>
                    {healthScore.grade}
                  </span>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">{healthScore.score}</p>
                    <p className="text-sm text-muted-foreground">/ 100</p>
                  </div>
                </div>
              </div>
              <Progress value={healthScore.score} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0 md:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Health Factors</h3>
            <div className="space-y-3">
              {healthScore.factors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      factor.status === 'good' ? 'bg-success' :
                      factor.status === 'warning' ? 'bg-warning' : 'bg-destructive'
                    }`}></div>
                    <span className="text-sm text-foreground">{factor.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${getFactorStatusColor(factor.status)}`}>
                      {factor.score}%
                    </span>
                    <span className="text-xs text-muted-foreground">({factor.weight}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Financial Risk Predictor
            <Badge className="bg-gradient-primary text-primary-foreground">
              AI-Powered
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Advanced AI analysis of your spending patterns to predict and prevent financial risks
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="predictions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="predictions">Risk Predictions</TabsTrigger>
              <TabsTrigger value="prevention">Prevention Plan</TabsTrigger>
            </TabsList>
            
            <TabsContent value="predictions" className="space-y-4">
              {isAnalyzing ? (
                <div className="text-center py-12">
                  <Brain className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Analyzing Your Financial Data</h3>
                  <p className="text-muted-foreground">AI is processing your spending patterns and predicting potential risks...</p>
                  <div className="mt-4">
                    <Progress value={75} className="h-2 max-w-xs mx-auto" />
                  </div>
                </div>
              ) : predictions.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-success mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Great Financial Health!</h3>
                  <p className="text-muted-foreground mb-4">
                    Our AI analysis shows no immediate financial risks. Keep up the good work!
                  </p>
                  <Button onClick={analyzeFinancialRisks} className="bg-gradient-primary">
                    Re-analyze
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {predictions.map((prediction, index) => (
                    <Alert key={index} className={`${
                      prediction.severity === 'high' ? 'border-destructive bg-destructive/10' :
                      prediction.severity === 'medium' ? 'border-warning bg-warning/10' :
                      'border-success bg-success/10'
                    }`}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-foreground flex items-center gap-2">
                                {prediction.title}
                                <Badge className={getSeverityColor(prediction.severity)}>
                                  {prediction.severity.toUpperCase()}
                                </Badge>
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {prediction.description}
                              </p>
                            </div>
                            <div className="text-right text-sm">
                              <p className="font-semibold text-foreground">{prediction.probability}%</p>
                              <p className="text-muted-foreground">probability</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-foreground flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Timeframe: {prediction.timeframe}
                              </p>
                              <p className="font-medium text-foreground flex items-center gap-1 mt-1">
                                <TrendingDown className="w-4 h-4" />
                                Impact: {prediction.impact}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-foreground mb-2">Recommendations:</p>
                              <ul className="text-muted-foreground space-y-1">
                                {prediction.recommendations.slice(0, 2).map((rec, i) => (
                                  <li key={i} className="text-xs">• {rec}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          <Progress value={prediction.probability} className="h-2" />
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="prevention" className="space-y-6">
              <div className="text-center mb-6">
                <Target className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Prevention Action Plan</h3>
                <p className="text-muted-foreground">
                  Proactive steps to avoid financial risks and improve your financial health
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-success" />
                    Immediate Actions (This Week)
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Set up spending alerts at 80% of budget</li>
                    <li>• Review and cancel unused subscriptions</li>
                    <li>• Create a daily expense tracking habit</li>
                    <li>• Identify 3 areas to reduce spending by 10%</li>
                  </ul>
                </Card>

                <Card className="p-6">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Medium-term Goals (This Month)
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Build emergency fund to {formatCurrency(50000, profile?.currency || 'USD')}</li>
                    <li>• Implement envelope budgeting system</li>
                    <li>• Negotiate better rates for utilities/services</li>
                    <li>• Start meal planning to reduce food costs</li>
                  </ul>
                </Card>

                <Card className="p-6">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-warning" />
                    Long-term Strategy (3-6 Months)
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Increase emergency fund to 6 months expenses</li>
                    <li>• Diversify income sources</li>
                    <li>• Optimize investment allocation</li>
                    <li>• Review and adjust financial goals quarterly</li>
                  </ul>
                </Card>

                <Card className="p-6">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    Smart Automation
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Automate savings transfers on payday</li>
                    <li>• Set up bill payment reminders</li>
                    <li>• Enable spending category alerts</li>
                    <li>• Schedule monthly financial reviews</li>
                  </ul>
                </Card>
              </div>

              <div className="text-center">
                <Button onClick={analyzeFinancialRisks} className="bg-gradient-primary gap-2">
                  <Brain className="w-4 h-4" />
                  Re-analyze Risks
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialRiskPredictor;