import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from "recharts";

interface Investment {
  id: string;
  name: string;
  type: string;
  currentValue: number;
  initialInvestment: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

const InvestmentTracking = () => {
  const [investments] = useState<Investment[]>([
    {
      id: "1",
      name: "Nigerian Stock Exchange",
      type: "Stocks",
      currentValue: 450000,
      initialInvestment: 400000,
      change: 50000,
      changePercent: 12.5,
      lastUpdated: "2025-01-15"
    },
    {
      id: "2",
      name: "Treasury Bills",
      type: "Government Bonds",
      currentValue: 520000,
      initialInvestment: 500000,
      change: 20000,
      changePercent: 4.0,
      lastUpdated: "2025-01-15"
    },
    {
      id: "3",
      name: "Mutual Funds",
      type: "Mutual Funds",
      currentValue: 180000,
      initialInvestment: 200000,
      change: -20000,
      changePercent: -10.0,
      lastUpdated: "2025-01-15"
    },
    {
      id: "4",
      name: "Real Estate Investment",
      type: "Real Estate",
      currentValue: 2500000,
      initialInvestment: 2200000,
      change: 300000,
      changePercent: 13.6,
      lastUpdated: "2025-01-15"
    }
  ]);

  const portfolioData = [
    { month: 'Jul', value: 3200000 },
    { month: 'Aug', value: 3350000 },
    { month: 'Sep', value: 3180000 },
    { month: 'Oct', value: 3420000 },
    { month: 'Nov', value: 3580000 },
    { month: 'Dec', value: 3650000 },
    { month: 'Jan', value: 3650000 },
  ];

  const allocationData = [
    { name: 'Real Estate', value: 2500000, color: '#10B981' },
    { name: 'Treasury Bills', value: 520000, color: '#3B82F6' },
    { name: 'Stocks', value: 450000, color: '#8B5CF6' },
    { name: 'Mutual Funds', value: 180000, color: '#F59E0B' },
  ];

  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalInvestment = investments.reduce((sum, inv) => sum + inv.initialInvestment, 0);
  const totalGain = totalValue - totalInvestment;
  const totalGainPercent = (totalGain / totalInvestment) * 100;

  const chartConfig = {
    value: {
      label: "Portfolio Value",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Portfolio</p>
                <p className="text-2xl font-bold text-foreground">₦{totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="text-2xl font-bold text-foreground">₦{totalInvestment.toLocaleString()}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Gain/Loss</p>
                <p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {totalGain >= 0 ? '+' : ''}₦{totalGain.toLocaleString()}
                </p>
              </div>
              {totalGain >= 0 ? 
                <TrendingUp className="w-8 h-8 text-success" /> : 
                <TrendingDown className="w-8 h-8 text-destructive" />
              }
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Return Rate</p>
                <p className={`text-2xl font-bold ${totalGainPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(1)}%
                </p>
              </div>
              <PieChart className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={portfolioData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <RechartsPieChart data={allocationData} cx="50%" cy="50%" outerRadius={80}>
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsPieChart>
                </RechartsPieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 space-y-2">
              {allocationData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">₦{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment List */}
      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-foreground">Investment Holdings</CardTitle>
            <Button className="bg-gradient-primary">
              Add Investment
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {investments.map((investment) => (
              <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <h3 className="font-semibold text-foreground">{investment.name}</h3>
                  <Badge variant="outline" className="mt-1">
                    {investment.type}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    Last updated: {new Date(investment.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-xl font-bold text-foreground">
                    ₦{investment.currentValue.toLocaleString()}
                  </p>
                  <div className={`flex items-center gap-1 ${
                    investment.change >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {investment.change >= 0 ? 
                      <TrendingUp className="w-4 h-4" /> : 
                      <TrendingDown className="w-4 h-4" />
                    }
                    <span className="text-sm font-medium">
                      {investment.change >= 0 ? '+' : ''}₦{Math.abs(investment.change).toLocaleString()} 
                      ({investment.changePercent >= 0 ? '+' : ''}{investment.changePercent}%)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestmentTracking;