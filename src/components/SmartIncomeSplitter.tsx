import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { DollarSign, Calculator, Target, Lightbulb, TrendingUp, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/utils/currencies";

interface BudgetAllocation {
  category: string;
  percentage: number;
  amount: number;
  color: string;
  description: string;
}

const SmartIncomeSplitter = () => {
  const { profile } = useAuth();
  const [income, setIncome] = useState(profile?.monthly_income || 0);
  const [needsPercentage, setNeedsPercentage] = useState([50]);
  const [wantsPercentage, setWantsPercentage] = useState([30]);
  const [savingsPercentage, setSavingsPercentage] = useState([20]);
  const [customMode, setCustomMode] = useState(false);

  const [allocations, setAllocations] = useState<BudgetAllocation[]>([]);

  useEffect(() => {
    // Ensure percentages add up to 100%
    const total = needsPercentage[0] + wantsPercentage[0] + savingsPercentage[0];
    if (total !== 100 && !customMode) {
      const adjustment = (100 - total) / 3;
      setNeedsPercentage([needsPercentage[0] + adjustment]);
      setWantsPercentage([wantsPercentage[0] + adjustment]);
      setSavingsPercentage([savingsPercentage[0] + adjustment]);
    }
  }, [needsPercentage, wantsPercentage, savingsPercentage, customMode]);

  useEffect(() => {
    const newAllocations: BudgetAllocation[] = [
      {
        category: "Needs",
        percentage: needsPercentage[0],
        amount: (income * needsPercentage[0]) / 100,
        color: "#EF4444",
        description: "Rent, utilities, groceries, transportation, minimum debt payments"
      },
      {
        category: "Wants",
        percentage: wantsPercentage[0],
        amount: (income * wantsPercentage[0]) / 100,
        color: "#3B82F6",
        description: "Entertainment, dining out, hobbies, non-essential shopping"
      },
      {
        category: "Savings & Investments",
        percentage: savingsPercentage[0],
        amount: (income * savingsPercentage[0]) / 100,
        color: "#10B981",
        description: "Emergency fund, retirement, investments, extra debt payments"
      }
    ];
    setAllocations(newAllocations);
  }, [income, needsPercentage, wantsPercentage, savingsPercentage]);

  const handleNeedsChange = (value: number[]) => {
    setNeedsPercentage(value);
    if (!customMode) {
      const remaining = 100 - value[0];
      const wantsRatio = wantsPercentage[0] / (wantsPercentage[0] + savingsPercentage[0]);
      setWantsPercentage([remaining * wantsRatio]);
      setSavingsPercentage([remaining * (1 - wantsRatio)]);
    }
  };

  const handleWantsChange = (value: number[]) => {
    setWantsPercentage(value);
    if (!customMode) {
      const remaining = 100 - needsPercentage[0] - value[0];
      setSavingsPercentage([remaining]);
    }
  };

  const handleSavingsChange = (value: number[]) => {
    setSavingsPercentage(value);
    if (!customMode) {
      const remaining = 100 - needsPercentage[0] - value[0];
      setWantsPercentage([remaining]);
    }
  };

  const resetToDefault = () => {
    setNeedsPercentage([50]);
    setWantsPercentage([30]);
    setSavingsPercentage([20]);
    setCustomMode(false);
  };

  const applyRecommendation = (type: 'conservative' | 'balanced' | 'aggressive') => {
    switch (type) {
      case 'conservative':
        setNeedsPercentage([60]);
        setWantsPercentage([20]);
        setSavingsPercentage([20]);
        break;
      case 'balanced':
        setNeedsPercentage([50]);
        setWantsPercentage([30]);
        setSavingsPercentage([20]);
        break;
      case 'aggressive':
        setNeedsPercentage([45]);
        setWantsPercentage([25]);
        setSavingsPercentage([30]);
        break;
    }
    setCustomMode(false);
  };

  const getRecommendation = () => {
    const savingsRate = savingsPercentage[0];
    if (savingsRate < 15) {
      return {
        type: 'warning',
        message: 'Consider increasing your savings rate to at least 15% for better financial security.',
        icon: '⚠️'
      };
    } else if (savingsRate >= 25) {
      return {
        type: 'excellent',
        message: 'Excellent savings rate! You\'re building wealth effectively.',
        icon: '🎉'
      };
    } else {
      return {
        type: 'good',
        message: 'Good savings rate! You\'re on track for financial stability.',
        icon: '👍'
      };
    }
  };

  const totalPercentage = needsPercentage[0] + wantsPercentage[0] + savingsPercentage[0];
  const recommendation = getRecommendation();

  return (
    <div className="space-y-6">
      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="w-6 h-6 text-primary" />
            Smart Income Splitter
          </CardTitle>
          <p className="text-muted-foreground">
            Automatically divide your income using the proven 50/30/20 rule or customize your own allocation
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Income Input */}
          <div className="space-y-2">
            <Label htmlFor="income" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Monthly Income
            </Label>
            <Input
              id="income"
              type="number"
              value={income || ""}
              onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
              placeholder="Enter your monthly income"
              className="text-lg font-semibold"
            />
          </div>

          {income > 0 && (
            <>
              {/* Quick Recommendations */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  Quick Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => applyRecommendation('conservative')}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <span className="font-semibold">Conservative</span>
                    <span className="text-xs text-muted-foreground">60% / 20% / 20%</span>
                    <span className="text-xs">Higher needs allocation</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => applyRecommendation('balanced')}
                    className="flex flex-col items-center p-4 h-auto border-primary"
                  >
                    <span className="font-semibold">Balanced (Recommended)</span>
                    <span className="text-xs text-muted-foreground">50% / 30% / 20%</span>
                    <span className="text-xs">Classic 50/30/20 rule</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => applyRecommendation('aggressive')}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <span className="font-semibold">Aggressive</span>
                    <span className="text-xs text-muted-foreground">45% / 25% / 30%</span>
                    <span className="text-xs">Higher savings rate</span>
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Custom Allocation */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Custom Allocation</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={totalPercentage === 100 ? "default" : "destructive"}>
                        Total: {totalPercentage.toFixed(0)}%
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={resetToDefault}>
                        Reset
                      </Button>
                    </div>
                  </div>

                  {/* Needs Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        Needs
                      </Label>
                      <span className="font-semibold">{needsPercentage[0].toFixed(0)}%</span>
                    </div>
                    <Slider
                      value={needsPercentage}
                      onValueChange={handleNeedsChange}
                      max={80}
                      min={30}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(allocations[0]?.amount || 0, profile?.currency || 'USD')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {allocations[0]?.description}
                    </p>
                  </div>

                  {/* Wants Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        Wants
                      </Label>
                      <span className="font-semibold">{wantsPercentage[0].toFixed(0)}%</span>
                    </div>
                    <Slider
                      value={wantsPercentage}
                      onValueChange={handleWantsChange}
                      max={50}
                      min={10}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(allocations[1]?.amount || 0, profile?.currency || 'USD')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {allocations[1]?.description}
                    </p>
                  </div>

                  {/* Savings Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        Savings & Investments
                      </Label>
                      <span className="font-semibold">{savingsPercentage[0].toFixed(0)}%</span>
                    </div>
                    <Slider
                      value={savingsPercentage}
                      onValueChange={handleSavingsChange}
                      max={50}
                      min={10}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(allocations[2]?.amount || 0, profile?.currency || 'USD')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {allocations[2]?.description}
                    </p>
                  </div>
                </div>

                {/* Visualization */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground text-center">Budget Visualization</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={allocations}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="amount"
                          label={({ category, percentage }) => `${category}: ${percentage.toFixed(0)}%`}
                        >
                          {allocations.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => formatCurrency(Number(value), profile?.currency || 'USD')}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-3 gap-2">
                    {allocations.map((allocation, index) => (
                      <div key={index} className="text-center p-3 border rounded-lg">
                        <div 
                          className="w-4 h-4 rounded mx-auto mb-1"
                          style={{ backgroundColor: allocation.color }}
                        ></div>
                        <p className="text-xs font-medium">{allocation.category}</p>
                        <p className="text-sm font-bold">
                          {formatCurrency(allocation.amount, profile?.currency || 'USD')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className={`p-4 rounded-lg border ${
                recommendation.type === 'warning' ? 'bg-warning/10 border-warning/20' :
                recommendation.type === 'excellent' ? 'bg-success/10 border-success/20' :
                'bg-primary/10 border-primary/20'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{recommendation.icon}</span>
                  <div>
                    <h4 className="font-semibold text-foreground">AI Recommendation</h4>
                    <p className="text-sm text-muted-foreground">{recommendation.message}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button className="flex-1 bg-gradient-primary gap-2">
                  <Save className="w-4 h-4" />
                  Save This Allocation
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <Target className="w-4 h-4" />
                  Create Budget Categories
                </Button>
              </div>

              {/* Tips */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Pro Tips
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Start with the 50/30/20 rule and adjust based on your lifestyle</li>
                  <li>• Prioritize building an emergency fund before aggressive investing</li>
                  <li>• Review and adjust your allocation every 3-6 months</li>
                  <li>• Consider increasing savings percentage with salary increases</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartIncomeSplitter;