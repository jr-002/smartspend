import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Calculator, 
  Target, 
  CreditCard, 
  TrendingUp, 
  PieChart, 
  Brain, 
  BookOpen,
  Bell,
  Settings,
  User,
  MessageCircle,
  Trophy,
  Users,
  AlertTriangle
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

// Import all components
import EnhancedDashboard from "@/components/EnhancedDashboard";
import SmartBudgeting from "@/components/SmartBudgeting";
import SavingsGoals from "@/components/SavingsGoals";
import BillPayments from "@/components/BillPayments";
import InvestmentTracking from "@/components/InvestmentTracking";
import AnalyticsReports from "@/components/AnalyticsReports";
import AIInsights from "@/components/AIInsights";
import FinancialEducation from "@/components/FinancialEducation";
import NotificationCenter from "@/components/NotificationCenter";
import TransactionHistory from "@/components/TransactionHistory";
import DebtManagement from "@/components/DebtManagement";
import AIFinancialCoach from "@/components/AIFinancialCoach";
import GamifiedSavings from "@/components/GamifiedSavings";
import SmartIncomeSplitter from "@/components/SmartIncomeSplitter";
import CommunityBudgetTemplates from "@/components/CommunityBudgetTemplates";
import FinancialRiskPredictor from "@/components/FinancialRiskPredictor";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, component: EnhancedDashboard },
    { id: "transactions", label: "Transactions", icon: CreditCard, component: TransactionHistory },
    { id: "budgeting", label: "Smart Budgeting", icon: Calculator, component: SmartBudgeting },
    { id: "goals", label: "Savings Goals", icon: Target, component: SavingsGoals },
    { id: "bills", label: "Bill Payments", icon: CreditCard, component: BillPayments },
    { id: "investments", label: "Investments", icon: TrendingUp, component: InvestmentTracking },
    { id: "debts", label: "Debt Management", icon: CreditCard, component: DebtManagement },
    { id: "analytics", label: "Analytics", icon: PieChart, component: AnalyticsReports },
    { id: "ai-insights", label: "AI Insights", icon: Brain, component: AIInsights },
    { id: "education", label: "Education", icon: BookOpen, component: FinancialEducation },
    { id: "ai-coach", label: "AI Coach", icon: MessageCircle, component: AIFinancialCoach },
    { id: "gamified", label: "Rewards", icon: Trophy, component: GamifiedSavings },
    { id: "income-splitter", label: "Income Splitter", icon: Calculator, component: SmartIncomeSplitter },
    { id: "community", label: "Community", icon: Users, component: CommunityBudgetTemplates },
    { id: "risk-predictor", label: "Risk Predictor", icon: AlertTriangle, component: FinancialRiskPredictor },
    { id: "notifications", label: "Notifications", icon: Bell, component: NotificationCenter },
  ];

  const ActiveComponent = menuItems.find(item => item.id === activeTab)?.component || EnhancedDashboard;

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <img 
                  src="/Picture1.png" 
                  alt="SmartSpend Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">SmartSpend</h1>
                <p className="text-sm text-muted-foreground">Financial Wellness Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{profile?.name || user?.email}</span>
              </div>
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation Tabs */}
          <div className="overflow-x-auto">
            <TabsList className="grid grid-cols-16 w-full min-w-max bg-card/50 backdrop-blur-sm">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <TabsTrigger 
                    key={item.id} 
                    value={item.id}
                    className="flex items-center gap-2 px-3 py-2 text-sm whitespace-nowrap"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Tab Content */}
          {menuItems.map((item) => (
            <TabsContent key={item.id} value={item.id} className="space-y-6">
              <item.component />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Index;