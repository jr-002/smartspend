import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, Target, PieChart } from "lucide-react";
import heroImage from "@/assets/hero-finance.jpg";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">SmartSpend</h1>
                <p className="text-sm text-muted-foreground">by JR Digital Insights</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  Your Intelligent
                  <span className="bg-gradient-primary bg-clip-text text-transparent"> Financial</span>
                  <br />Wellness Assistant
                </h2>
                <p className="text-lg text-muted-foreground max-w-md">
                  Track, predict, and optimize your spending habits with AI-powered insights. 
                  Make every naira count with SmartSpend.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-primary shadow-glow">
                  Get Started Free
                </Button>
                <Button variant="outline" size="lg">
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-6 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">50K+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">₦2.5B+</div>
                  <div className="text-sm text-muted-foreground">Money Tracked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">4.9★</div>
                  <div className="text-sm text-muted-foreground">App Rating</div>
                </div>
              </div>
            </div>

            <div className="relative animate-slide-up">
              <img 
                src={heroImage} 
                alt="SmartSpend Dashboard Preview" 
                className="rounded-2xl shadow-floating w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Experience Smart Financial Management
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get real-time insights into your spending patterns with our beautiful, intuitive dashboard
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Balance Card */}
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

            {/* Spending Card */}
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

            {/* Budget Card */}
            <Card className="shadow-card bg-gradient-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Budget Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">₦53,000</div>
                <div className="flex items-center text-sm text-success mt-1">
                  <Target className="w-4 h-4 mr-1" />
                  On track to save ₦7,720
                </div>
              </CardContent>
            </Card>

            {/* Categories Card */}
            <Card className="shadow-card bg-gradient-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Top Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">Food</div>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <PieChart className="w-4 h-4 mr-1" />
                  ₦18,500 (41%)
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" className="bg-gradient-primary shadow-glow">
              <Plus className="w-5 h-5 mr-2" />
              Start Tracking Today
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Why Choose SmartSpend?
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powered by AI and designed for the modern Nigerian lifestyle
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto shadow-glow">
                <span className="text-2xl text-primary-foreground">🧠</span>
              </div>
              <h4 className="text-xl font-semibold text-foreground">AI-Powered Insights</h4>
              <p className="text-muted-foreground">
                Get personalized spending recommendations and automatic transaction categorization
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-success rounded-2xl flex items-center justify-center mx-auto shadow-glow">
                <span className="text-2xl text-success-foreground">📱</span>
              </div>
              <h4 className="text-xl font-semibold text-foreground">Smart Notifications</h4>
              <p className="text-muted-foreground">
                Real-time alerts for budget limits, bill reminders, and spending patterns
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto shadow-glow">
                <span className="text-2xl text-primary-foreground">🔒</span>
              </div>
              <h4 className="text-xl font-semibold text-foreground">Bank-Level Security</h4>
              <p className="text-muted-foreground">
                Your financial data is protected with enterprise-grade encryption
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">S</span>
              </div>
              <span className="font-semibold text-foreground">SmartSpend</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 JR Digital Insights. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;