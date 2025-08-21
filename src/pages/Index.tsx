import React, { useEffect, useMemo, useState, Suspense, lazy } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import ProfileSettings from "@/components/ProfileSettings";
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
  User,
  MessageCircle,
  Trophy,
  Users,
  AlertTriangle,
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar, { SidebarCategory } from "@/components/AppSidebar";

// Lazy-load all heavy feature components
const EnhancedDashboard = lazy(() => import("@/components/EnhancedDashboard"));
const SmartBudgeting = lazy(() => import("@/components/SmartBudgeting"));
const SavingsGoals = lazy(() => import("@/components/SavingsGoals"));
const BillPayments = lazy(() => import("@/components/BillPayments"));
const InvestmentTracking = lazy(() => import("@/components/InvestmentTracking"));
const AnalyticsReports = lazy(() => import("@/components/AnalyticsReports"));
const AIInsights = lazy(() => import("@/components/AIInsights"));
const FinancialEducation = lazy(() => import("@/components/FinancialEducation"));
const NotificationCenter = lazy(() => import("@/components/NotificationCenter"));
const TransactionHistory = lazy(() => import("@/components/TransactionHistory"));
const DebtManagement = lazy(() => import("@/components/DebtManagement"));
const AIFinancialCoach = lazy(() => import("@/components/AIFinancialCoach"));
const GamifiedSavings = lazy(() => import("@/components/GamifiedSavings"));
const SmartIncomeSplitter = lazy(() => import("@/components/SmartIncomeSplitter"));
const CommunityBudgetTemplates = lazy(() => import("@/components/CommunityBudgetTemplates"));
const FinancialRiskPredictor = lazy(() => import("@/components/FinancialRiskPredictor"));

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const sidebarCategories = useMemo((): SidebarCategory[] => [
    {
      id: "essentials",
      label: "Essentials",
      defaultOpen: true,
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, component: EnhancedDashboard },
        { id: "budgeting", label: "Budgeting", icon: Calculator, component: SmartBudgeting },
        { id: "transactions", label: "Transactions", icon: CreditCard, component: TransactionHistory },
      ]
    },
    {
      id: "financial-goals",
      label: "Financial Goals",
      defaultOpen: true,
      items: [
        { id: "goals", label: "Savings Goals", icon: Target, component: SavingsGoals },
        { id: "bills", label: "Bills & Payments", icon: CreditCard, component: BillPayments },
        { id: "debts", label: "Debt Management", icon: CreditCard, component: DebtManagement },
      ]
    },
    {
      id: "ai-tools",
      label: "AI & Insights",
      defaultOpen: false,
      items: [
        { id: "ai-coach", label: "AI Coach", icon: MessageCircle, component: AIFinancialCoach },
        { id: "ai-insights", label: "AI Insights", icon: Brain, component: AIInsights },
        { id: "risk-predictor", label: "Risk Predictor", icon: AlertTriangle, component: FinancialRiskPredictor },
      ]
    },
    {
      id: "advanced",
      label: "Advanced Tools",
      defaultOpen: false,
      items: [
        { id: "investments", label: "Investments", icon: TrendingUp, component: InvestmentTracking },
        { id: "income-splitter", label: "Income Splitter", icon: Calculator, component: SmartIncomeSplitter },
        { id: "analytics", label: "Reports", icon: PieChart, component: AnalyticsReports },
      ]
    },
    {
      id: "community",
      label: "Learn & Connect",
      defaultOpen: false,
      items: [
        { id: "education", label: "Education", icon: BookOpen, component: FinancialEducation },
        { id: "community", label: "Community", icon: Users, component: CommunityBudgetTemplates },
        { id: "gamified", label: "Rewards", icon: Trophy, component: GamifiedSavings },
        { id: "notifications", label: "Notifications", icon: Bell, component: NotificationCenter },
      ]
    }
  ], []);

  const allItems = sidebarCategories.flatMap(category => category.items);
  const activeItem = allItems.find((item) => item.id === activeTab) || allItems[0];
  const ActiveComponent = activeItem.component;

  // Lightweight SEO updates per section
  useEffect(() => {
    const title = `${activeItem.label} • SmartSpend`;
    document.title = title;

    const desc = getPageDescription(activeItem.id);
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);
  }, [activeItem]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-background">
        <AppSidebar categories={sidebarCategories} activeId={activeTab} onSelect={setActiveTab} />

        <div className="flex-1 flex flex-col">
          {/* App Header */}
          <header className="glass-card border-b border-border/50 sticky top-0 z-50 backdrop-blur-glass">
            <div className="px-4 lg:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="lg:hidden" />
                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                  <img
                    src="/Picture1.png"
                    alt="SmartSpend logo"
                    className="w-6 h-6 object-contain"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground leading-tight">{activeItem.label}</h1>
                  <p className="text-xs text-muted-foreground">{getPageDescription(activeItem.id)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 lg:gap-4">
                <ProfileSettings>
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-card/50 rounded-full border border-border/50 hover:bg-card/80 transition-colors cursor-pointer">
                    <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground max-w-32 truncate">
                      {profile?.name || user?.email}
                    </span>
                  </div>
                </ProfileSettings>
                <ThemeToggle />
                <Button variant="outline" size="sm" onClick={handleSignOut} className="border-border/50">
                  Sign Out
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="px-4 lg:px-6 py-6">
            <div className="animate-fade-in">
              <Suspense
                fallback={
                  <div className="space-y-4">
                    <div className="h-7 w-40 bg-muted rounded-md" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="h-32 bg-card rounded-xl border border-border/50" />
                      <div className="h-32 bg-card rounded-xl border border-border/50" />
                      <div className="h-32 bg-card rounded-xl border border-border/50" />
                    </div>
                  </div>
                }
              >
                <ActiveComponent />
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
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
      notifications: "Manage your financial alerts and reminders",
    };
    return descriptions[pageId] || "Manage your financial data";
  }
};

export default Index;
