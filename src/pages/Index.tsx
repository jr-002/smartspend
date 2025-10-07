import { useEffect, useMemo, useState, Suspense, lazy } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import ProfileSettings from "@/components/ProfileSettings";
import { resourceMonitor } from "@/lib/resource-monitor";
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
  Activity,
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar, { SidebarCategory } from "@/components/AppSidebar";
import LoadingFallback from "@/components/LoadingFallback";
import ResourceMonitor from "@/components/ResourceMonitor";

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
const ProductionMonitoringDashboard = lazy(() => import("@/components/ProductionMonitoringDashboard"));

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, profile, signOut } = useAuth();

  // Prevent multiple simultaneous component loads
  const [loadedComponents, setLoadedComponents] = useState(new Set(['dashboard']));
  const [resourceStatus, setResourceStatus] = useState(resourceMonitor.getResourceStatus());
  
  const handleTabChange = (tabId: string) => {
    // Check resources before switching tabs
    if (!resourceMonitor.canMakeRequest()) {
      console.warn('Deferring tab change due to resource constraints');
      setTimeout(() => setActiveTab(tabId), 1000);
      return;
    }
    
    setActiveTab(tabId);
  };

  // Monitor resource usage
  useEffect(() => {
    const interval = setInterval(() => {
      setResourceStatus(resourceMonitor.getResourceStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resourceMonitor.cleanup();
    };
  }, []);
  const handleSignOut = async () => {
    resourceMonitor.cleanup();
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
    },
    {
      id: "admin",
      label: "System",
      defaultOpen: false,
      items: [
        { id: "monitoring", label: "Monitoring", icon: Activity, component: ProductionMonitoringDashboard },
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
          <header className="bg-background/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50 px-4 sm:px-6 lg:px-8">
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="lg:hidden" />
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                  <img
                    src="/Picture1.png"
                    alt="SmartSpend logo"
                    className="w-6 h-6 object-contain"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground tracking-tight">{activeItem.label}</h1>
                  <p className="text-xs text-muted-foreground max-w-md hidden md:block">{getPageDescription(activeItem.id)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <ProfileSettings>
                  <div className="hidden lg:flex items-center gap-3 px-3 py-2 bg-muted/30 rounded-lg hover:bg-muted/50 transition-all duration-200 cursor-pointer border border-border/30">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-foreground">
                      {profile?.name || user?.email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {profile?.currency || 'USD'}
                      </span>
                    </div>
                  </div>
                </ProfileSettings>
                <ThemeToggle />
                <Button variant="outline" size="sm" onClick={handleSignOut} className="px-2 sm:px-3">
                  Sign Out
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto">
              <ResourceMonitor />
              <Suspense
                fallback={
                  <LoadingFallback 
                    message={`Loading ${activeItem.label}...`}
                    showResourceWarning={!resourceStatus.canMakeRequest}
                  />
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
