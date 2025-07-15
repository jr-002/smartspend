import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, BarChart3, PieChart, TrendingUp, TrendingDown, DollarSign, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Tooltip } from "recharts";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/utils/currencies";

const AnalyticsReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("3months");
  const [selectedReport, setSelectedReport] = useState("spending");
  const { profile } = useAuth();
  
  const { analyticsData, loading, error } = useAnalytics(selectedPeriod);

  if (loading) {
    return (
      <Card className="shadow-card bg-gradient-card border-0">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-muted-foreground">Loading analytics data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analyticsData) {
    return (
      <Card className="shadow-card bg-gradient-card border-0">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Failed to load analytics data</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderSpendingReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(analyticsData.keyMetrics.totalSpent, profile?.currency || "USD")}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
            <div className="flex items-center text-sm mt-2">
              {analyticsData.keyMetrics.monthlyChange >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1 text-destructive" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1 text-success" />
              )}
              <span className={analyticsData.keyMetrics.monthlyChange >= 0 ? "text-destructive" : "text-success"}>
                {Math.abs(analyticsData.keyMetrics.monthlyChange).toFixed(1)}% vs last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Savings Rate</p>
                <p className="text-2xl font-bold text-success">{analyticsData.savingsRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
            <div className="flex items-center text-sm mt-2">
              <span className="text-muted-foreground">
                {formatCurrency(analyticsData.currentBalance, profile?.currency || "USD")} saved
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily Average</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(analyticsData.keyMetrics.avgDailySpending, profile?.currency || "USD")}
                </p>
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
                <p className="text-lg font-bold text-foreground">{analyticsData.keyMetrics.biggestExpense.category}</p>
              </div>
              <PieChart className="w-8 h-8 text-primary" />
            </div>
            <div className="flex items-center text-sm mt-2">
              <span className="text-muted-foreground">
                {formatCurrency(analyticsData.keyMetrics.biggestExpense.amount, profile?.currency || "USD")}
              </span>
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
                <LineChart data={analyticsData.monthlySpending}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value), profile?.currency || "USD")} />
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
                    data={analyticsData.categoryBreakdown} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80}
                    dataKey="value"
                  >
                    {analyticsData.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsPieChart>
                  <Tooltip formatter={(value) => formatCurrency(Number(value), profile?.currency || "USD")} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {analyticsData.categoryBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {formatCurrency(item.value, profile?.currency || "USD")}
                    </span>
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
              <BarChart data={analyticsData.incomeVsExpenses}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value), profile?.currency || "USD")} />
                <Bar dataKey="income" fill="#10B981" name="Income" />
                <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                <Bar dataKey="savings" fill="#3B82F6" name="Savings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Additional Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(analyticsData.totalIncome, profile?.currency || "USD")}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(analyticsData.totalExpenses, profile?.currency || "USD")}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Balance</p>
                <p className={`text-2xl font-bold ${analyticsData.currentBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(analyticsData.currentBalance, profile?.currency || "USD")}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
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