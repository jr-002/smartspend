import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, BarChart3, PieChart, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Tooltip } from "recharts";

const AnalyticsReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("3months");
  const [selectedReport, setSelectedReport] = useState("spending");

  const spendingData = [
    { month: 'Oct', amount: 180000, budget: 200000 },
    { month: 'Nov', amount: 195000, budget: 200000 },
    { month: 'Dec', amount: 220000, budget: 200000 },
    { month: 'Jan', amount: 174000, budget: 200000 },
  ];

  const categoryData = [
    { name: 'Food & Dining', value: 45200, color: '#3B82F6', percentage: 26 },
    { name: 'Transportation', value: 32500, color: '#10B981', percentage: 19 },
    { name: 'Shopping', value: 28900, color: '#F59E0B', percentage: 17 },
    { name: 'Bills & Utilities', value: 25400, color: '#EF4444', percentage: 15 },
    { name: 'Entertainment', value: 18600, color: '#8B5CF6', percentage: 11 },
    { name: 'Others', value: 23400, color: '#6B7280', percentage: 12 },
  ];

  const incomeVsExpenses = [
    { month: 'Oct', income: 280000, expenses: 180000, savings: 100000 },
    { month: 'Nov', income: 280000, expenses: 195000, savings: 85000 },
    { month: 'Dec', income: 320000, expenses: 220000, savings: 100000 },
    { month: 'Jan', income: 280000, expenses: 174000, savings: 106000 },
  ];

  const keyMetrics = {
    totalSpent: 174000,
    totalIncome: 280000,
    savingsRate: 37.9,
    budgetVariance: -26000,
    monthlyChange: -8.5,
    categoriesCount: 8,
    avgDailySpending: 5613,
    biggestExpense: { category: 'Food & Dining', amount: 45200 }
  };

  const renderSpendingReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-foreground">₦{keyMetrics.totalSpent.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
            <div className="flex items-center text-sm mt-2">
              <TrendingDown className="w-4 h-4 mr-1 text-success" />
              <span className="text-success">{Math.abs(keyMetrics.monthlyChange)}% less than last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Savings Rate</p>
                <p className="text-2xl font-bold text-success">{keyMetrics.savingsRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
            <div className="flex items-center text-sm mt-2">
              <span className="text-muted-foreground">₦{(keyMetrics.totalIncome - keyMetrics.totalSpent).toLocaleString()} saved</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily Average</p>
                <p className="text-2xl font-bold text-foreground">₦{keyMetrics.avgDailySpending.toLocaleString()}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <div className="flex items-center text-sm mt-2">
              <span className="text-muted-foreground">This month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Biggest Category</p>
                <p className="text-lg font-bold text-foreground">{keyMetrics.biggestExpense.category}</p>
              </div>
              <PieChart className="w-8 h-8 text-primary" />
            </div>
            <div className="flex items-center text-sm mt-2">
              <span className="text-muted-foreground">₦{keyMetrics.biggestExpense.amount.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader>
            <CardTitle>Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spendingData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₦${Number(value).toLocaleString()}`} />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Spent"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="budget" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="5 5"
                    name="Budget"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <RechartsPieChart 
                    data={categoryData} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsPieChart>
                  <Tooltip formatter={(value) => `₦${Number(value).toLocaleString()}`} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">₦{item.value.toLocaleString()}</span>
                    <Badge variant="outline">{item.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderIncomeReport = () => (
    <div className="space-y-6">
      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader>
          <CardTitle>Income vs Expenses vs Savings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpenses}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₦${Number(value).toLocaleString()}`} />
                <Bar dataKey="income" fill="#10B981" name="Income" />
                <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                <Bar dataKey="savings" fill="#3B82F6" name="Savings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Card className="shadow-card bg-gradient-card border-0">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Analytics & Reports
          </CardTitle>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button
            variant={selectedReport === "spending" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedReport("spending")}
          >
            Spending Analysis
          </Button>
          <Button
            variant={selectedReport === "income" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedReport("income")}
          >
            Income vs Expenses
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {selectedReport === "spending" && renderSpendingReport()}
        {selectedReport === "income" && renderIncomeReport()}
      </CardContent>
    </Card>
  );
};

export default AnalyticsReports;