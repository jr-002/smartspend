import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, Target, PieChart, Menu, Brain, Bell, Calculator, Sparkles, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./ThemeToggle";
import TransactionHistory from "./TransactionHistory";
import BillPayments from "./BillPayments";
import SavingsGoals from "./SavingsGoals";
import InvestmentTracking from "./InvestmentTracking";
import DebtManagement from "./DebtManagement";
import FinancialEducation from "./FinancialEducation";
import AIInsights from "./AIInsights";
import SmartBudgeting from "./SmartBudgeting";
import NotificationCenter from "./NotificationCenter";
import { formatCurrency, getCurrencyByCode } from "@/utils/currencies";
import { useAuth } from "@/contexts/AuthContext";

const EnhancedDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error("Sign out error:", error);
    }
  };

  const selectedCurrency = getCurrencyByCode(profile?.currency || "NGN");

  const NavigationMenu = () => (
    <div className="space-y-2">
      <Button
        variant={activeTab === "overview" ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => setActiveTab("overview")}
      >
        <PieChart className="w-4 h-4 mr-2" />
        Overview
      </Button>
      <Button
        variant={activeTab === "transactions" ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => setActiveTab("transactions")}
      >
        <TrendingUp className="w-4 h-4 mr-2" />
        Transactions
      </Button>
      <Button
        variant={activeTab === "bills" ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => setActiveTab("bills")}
      >
        <Target className="w-4 h-4 mr-2" />
        Bills & Payments
      </Button>
      <Button
        variant={activeTab === "savings" ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => setActiveTab("savings")}
      >
        <Target className="w-4 h-4 mr-2" />
        Savings Goals
      </Button>
      <Button
        variant={activeTab === "investments" ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => setActiveTab("investments")}
      >
        <TrendingUp className="w-4 h-4 mr-2" />
        Investments
      </Button>
      <Button
        variant={activeTab === "debt" ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => setActiveTab("debt")}
      >
        <TrendingDown className="w-4 h-4 mr-2" />
        Debt Management
      </Button>
      <Button
        variant={activeTab === "education" ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => setActiveTab("education")}
      >
        <Target className="w-4 h-4 mr-2" />
        Financial Education
      </Button>
      <Button
        variant={activeTab === "insights" ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => setActiveTab("insights")}
      >
        <Brain className="w-4 h-4 mr-2" />
        AI Insights
      </Button>
      <Button
        variant={activeTab === "budgeting" ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => setActiveTab("budgeting")}
      >
        <Calculator className="w-4 h-4 mr-2" />
        Smart Budgeting
      </Button>
      <Button
        variant={activeTab === "notifications" ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => setActiveTab("notifications")}
      >
        <Bell className="w-4 h-4 mr-2" />
        Notifications
      </Button>
    </div>
  );

  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Welcome Message */}
      <Card className="shadow-card bg-gradient-primary text-primary-foreground border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {profile?.name}!
              </h2>
              <p className="opacity-90">
                Ready to take control of your finances today?
              </p>
              {selectedCurrency && (
                <div className="flex items-center gap-2 mt-2 opacity-90">
                  <span className="text-lg">{selectedCurrency.flag}</span>
                  <span className="text-sm">Using {selectedCurrency.name} ({selectedCurrency.code})</span>
                </div>
              )}
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats - Empty State */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(0, profile?.currency || "NGN")}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Add transactions to see your balance
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(0, profile?.currency || "NGN")}</div>
            <div className="text-sm text-muted-foreground mt-1">
              No expenses tracked yet
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Savings Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">0</div>
            <div className="text-sm text-muted-foreground mt-1">
              No goals set yet
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Investment Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(0, profile?.currency || "NGN")}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Start investing for your future
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              className="h-20 flex-col gap-2 bg-gradient-primary"
              onClick={() => setActiveTab("transactions")}
            >
              <Plus className="w-6 h-6" />
              Add Transaction
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => setActiveTab("savings")}
            >
              <Target className="w-6 h-6" />
              New Goal
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => setActiveTab("investments")}
            >
              <TrendingUp className="w-6 h-6" />
              Invest
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => setActiveTab("insights")}
            >
              <PieChart className="w-6 h-6" />
              View Insights
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started Tips */}
      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Getting Started Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">1. Track Your First Transaction</h4>
              <p className="text-sm text-muted-foreground">
                Start by adding a recent expense to see how SmartSpend categorizes and tracks your spending.
              </p>
            </div>
            <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">2. Set Your First Savings Goal</h4>
              <p className="text-sm text-muted-foreground">
                Whether it's an emergency fund or vacation, setting goals helps you stay motivated.
              </p>
            </div>
            <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">3. Create a Budget</h4>
              <p className="text-sm text-muted-foreground">
                Use our Smart Budgeting feature to create a personalized budget based on your income.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <div className="py-4">
                    <h2 className="text-lg font-semibold mb-4">Navigation</h2>
                    <NavigationMenu />
                  </div>
                </SheetContent>
              </Sheet>
              
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">SmartSpend</h1>
                <p className="text-sm text-muted-foreground">Global Financial Wellness Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation - Hidden on mobile */}
          <div className="hidden md:block w-64 space-y-2">
            <Card className="shadow-card bg-gradient-card border-0 p-4">
              <NavigationMenu />
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "overview" && <OverviewContent />}
            {activeTab === "transactions" && <TransactionHistory />}
            {activeTab === "bills" && <BillPayments />}
            {activeTab === "savings" && <SavingsGoals />}
            {activeTab === "investments" && <InvestmentTracking />}
            {activeTab === "debt" && <DebtManagement />}
            {activeTab === "education" && <FinancialEducation />}
            {activeTab === "insights" && <AIInsights />}
            {activeTab === "budgeting" && <SmartBudgeting />}
            {activeTab === "notifications" && <NotificationCenter />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;