import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, TrendingDown, Target, PieChart, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import TransactionHistory from "./TransactionHistory";
import BillPayments from "./BillPayments";
import SavingsGoals from "./SavingsGoals";
import InvestmentTracking from "./InvestmentTracking";
import DebtManagement from "./DebtManagement";
import FinancialEducation from "./FinancialEducation";

const EnhancedDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

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
    </div>
  );

  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₦125,430</div>
            <div className="flex items-center text-sm text-success mt-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              +12.5% from last month
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
            <div className="text-2xl font-bold text-foreground">₦45,280</div>
            <div className="flex items-center text-sm text-warning mt-1">
              <TrendingDown className="w-4 h-4 mr-1" />
              85% of budget used
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
            <div className="text-2xl font-bold text-foreground">₦825,000</div>
            <div className="flex items-center text-sm text-success mt-1">
              <Target className="w-4 h-4 mr-1" />
              4 active goals
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
            <div className="text-2xl font-bold text-foreground">₦3,650,000</div>
            <div className="flex items-center text-sm text-success mt-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              +8.2% this year
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
            <Button className="h-20 flex-col gap-2 bg-gradient-primary">
              <Plus className="w-6 h-6" />
              Add Transaction
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Target className="w-6 h-6" />
              New Goal
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <TrendingUp className="w-6 h-6" />
              Invest
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <PieChart className="w-6 h-6" />
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Preview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Grocery Shopping</p>
                  <p className="text-sm text-muted-foreground">Today</p>
                </div>
                <span className="font-semibold text-destructive">-₦15,420</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Salary Payment</p>
                  <p className="text-sm text-muted-foreground">Yesterday</p>
                </div>
                <span className="font-semibold text-success">+₦250,000</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Uber Ride</p>
                  <p className="text-sm text-muted-foreground">2 days ago</p>
                </div>
                <span className="font-semibold text-destructive">-₦2,500</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab("transactions")}>
              View All Transactions
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader>
            <CardTitle>Upcoming Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Electricity Bill</p>
                  <p className="text-sm text-muted-foreground">Due in 5 days</p>
                </div>
                <span className="font-semibold">₦12,500</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Internet Subscription</p>
                  <p className="text-sm text-muted-foreground">Due in 3 days</p>
                </div>
                <span className="font-semibold">₦8,000</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Car Insurance</p>
                  <p className="text-sm text-muted-foreground">Due in 10 days</p>
                </div>
                <span className="font-semibold">₦45,000</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab("bills")}>
              Manage Bills
            </Button>
          </CardContent>
        </Card>
      </div>
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
                <p className="text-sm text-muted-foreground">Financial Wellness Assistant</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Profile
            </Button>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;