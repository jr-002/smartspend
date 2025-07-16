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
      {/* Enhanced Header with glass effect */}
      <header className="glass-card border-b border-border/50 sticky top-0 z-50 backdrop-blur-glass">
        <div className="container mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow animate-pulse-glow">
                  <img 
                    src="/Picture1.png" 
                    alt="SmartSpend Logo" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">SmartSpend</h1>
                <p className="text-sm text-muted-foreground font-medium">Financial Wellness Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-card/50 rounded-full border border-border/50">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground max-w-32 truncate">
                  {profile?.name || user?.email}
                </span>
              </div>
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="border-border/50 hover:border-border transition-colors"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Main Content with better spacing */}
      <main className="container mx-auto px-4 lg:px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Enhanced Navigation with better responsive design */}
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide">
              <TabsList className="glass-card inline-flex h-14 items-center justify-start rounded-2xl p-1 min-w-max shadow-floating">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <TabsTrigger 
                      key={item.id} 
                      value={item.id}
                      className={`
                        inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium
                        transition-all duration-200 ease-in-out rounded-xl whitespace-nowrap
                        ${isActive 
                          ? 'bg-primary text-primary-foreground shadow-card transform scale-105' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                      <span className="hidden sm:inline">{item.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
            
            {/* Gradient fade for scroll indication */}
            <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
          </div>

          {/* Enhanced Tab Content with animations */}
          {menuItems.map((item) => (
            <TabsContent 
              key={item.id} 
              value={item.id} 
              className="space-y-8 animate-fade-in focus:outline-none"
            >
              <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center gap-3 pb-2">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                      {item.label}
                    </h2>
                    <p className="text-muted-foreground">
                      {getPageDescription(item.id)}
                    </p>
                  </div>
                </div>
                
                {/* Component Content */}
                <div className="animate-slide-up">
                  <item.component />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );

  function getPageDescription(pageId: string): string {
    const descriptions: Record<string, string> = {
      dashboard: "Overview of your financial health and recent activity",
      transactions: "Track and manage all your financial transactions",
      budgeting: "Smart budgeting tools powered by AI insights",
      goals: "Set and track your savings and financial goals",
      bills: "Manage and automate your bill payments",
      investments: "Track your investment portfolio and performance",
      debts: "Manage and strategize your debt repayment",
      analytics: "Detailed financial analytics and reports",
      "ai-insights": "Personalized AI-powered financial insights",
      education: "Learn about personal finance and investments",
      "ai-coach": "Get personalized financial coaching from AI",
      gamified: "Earn rewards for achieving financial milestones",
      "income-splitter": "Automatically allocate your income efficiently",
      community: "Discover budget templates from the community",
      "risk-predictor": "AI-powered financial risk assessment",
      notifications: "Manage your financial alerts and reminders"
    };
    return descriptions[pageId] || "Manage your financial data";
  }
};

export default Index;