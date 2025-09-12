import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Wallet, Target, TrendingUp, Brain, Sparkles, Mail, Lock, User, DollarSign, CheckCircle, Eye, EyeOff, Info, Shield, Zap, Globe, Star, Loader2, PieChart, TrendingDown, Plus } from "lucide-react";
import CurrencySelector from "./CurrencySelector";
import { getDefaultCurrency } from "@/utils/currencies";
import { useAuth } from "@/contexts/AuthContext";
import { passwordSchema, emailSchema, nameSchema, currencyCodeSchema } from "@/utils/validation";
import heroImage from "@/assets/hero-finance.jpg";

const WelcomeScreen = () => {
  const [step, setStep] = useState(1);
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [emailError, setEmailError] = useState<string>('');
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    monthlyIncome: 0,
    currency: getDefaultCurrency().code
  });

  const { signUp, signIn } = useAuth();

  // Real-time password validation
  const validatePassword = (password: string) => {
    const errors: string[] = [];
    
    if (!password) {
      setPasswordErrors([]);
      return false;
    }
    
    if (password.length < 6) {
      errors.push("At least 6 characters");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("One lowercase letter");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("One uppercase letter");
    }
    if (!/\d/.test(password)) {
      errors.push("One number");
    }
    if (!/[!@#$%^&*()_+=[\]{}|;':",.<>/?`~-]/.test(password)) {
      errors.push("One special character");
    }
    
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  // Real-time email validation
  const validateEmail = (email: string) => {
    try {
      emailSchema.parse(email);
      setEmailError('');
      return true;
    } catch (err: unknown) {
      const error = err as { issues?: Array<{ message: string }> };
      setEmailError(error.issues?.[0]?.message || "Invalid email format");
      return false;
    }
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (step === 2 && !isLogin) {
      // Validate email and password before proceeding
      const isEmailValid = validateEmail(formData.email);
      const isPasswordValid = validatePassword(formData.password);
      const passwordsMatch = formData.password === formData.confirmPassword;
      
      if (!isEmailValid || !isPasswordValid || !passwordsMatch) {
        if (!passwordsMatch) {
          setError("Passwords do not match");
        }
        return;
      }
    }
    
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    setShowVerificationMessage(false);

    try {
      if (isLogin) {
        // Validate login form
        if (!formData.email?.trim() || !formData.password) {
          setError("Please enter both email and password");
          setLoading(false);
          return;
        }

        // Validate email format for login
        if (!validateEmail(formData.email)) {
          setLoading(false);
          return;
        }

        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error.message);
        }
      } else {
        // Validate form data before signup
        if (!formData.email?.trim() || !formData.password || !formData.name?.trim()) {
          setError("Please fill in all required fields");
          setLoading(false);
          return;
        }

        // Final validation before signup
        const isEmailValid = validateEmail(formData.email);
        const isPasswordValid = validatePassword(formData.password);

        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        if (!isEmailValid || !isPasswordValid) {
          setError("Please fix the validation errors before proceeding");
          setLoading(false);
          return;
        }

        try {
          nameSchema.parse(formData.name.trim());
        } catch (err: unknown) {
          const error = err as { issues?: Array<{ message: string }> };
          setError(error.issues?.[0]?.message || "Please enter a valid name");
          setLoading(false);
          return;
        }

        // Validate currency
        try {
          currencyCodeSchema.parse(formData.currency);
        } catch (err: unknown) {
          const error = err as { issues?: Array<{ message: string }> };
          setError(error.issues?.[0]?.message || "Please select a valid currency");
          setLoading(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, {
          name: formData.name.trim(),
          monthlyIncome: formData.monthlyIncome,
          currency: formData.currency
        });

        if (error) {
          setError(error.message);
        } else {
          // Show verification message on successful signup
          setShowVerificationMessage(true);
          setError(null);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Auth error:", err);
    }

    setLoading(false);
  };

  const canProceed = () => {
    switch (step) {
      case 2:
        if (isLogin) {
          return formData.email && formData.password && !emailError;
        } else {
          const isEmailValid = formData.email && !emailError;
          const isPasswordValid = formData.password && passwordErrors.length === 0;
          const isConfirmPasswordValid = formData.confirmPassword && formData.password === formData.confirmPassword;
          
          return isEmailValid && isPasswordValid && isConfirmPasswordValid;
        }
      case 3:
        return !isLogin ? formData.name.trim() : true;
      case 4:
        return !isLogin ? formData.currency : true;
      default:
        return true;
    }
  };

  // Show verification message screen
  if (showVerificationMessage) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card bg-gradient-card border-0">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-success rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Check Your Email
            </CardTitle>
            <p className="text-muted-foreground">
              We've sent you a verification link
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                <Mail className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="text-sm font-medium text-success">Verification Email Sent!</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  We've sent a verification link to:
                </p>
                <p className="font-medium text-foreground">{formData.email}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Please check your email and click the verification link to activate your account.
                </p>
                <p className="text-xs text-muted-foreground">
                  Don't see the email? Check your spam folder or wait a few minutes.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowVerificationMessage(false);
                  setIsLogin(true);
                  setStep(2);
                }}
              >
                Back to Sign In
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setShowVerificationMessage(false);
                  setStep(1);
                }}
              >
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background">
      {step === 1 ? (
        // Comprehensive Welcome/Landing Page
        <>
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
                    <p className="text-sm text-muted-foreground">by JR Digital Insights</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsLogin(true);
                    setStep(2);
                  }}
                >
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
                    <Badge variant="secondary" className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary border-primary/20">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI-Powered Financial Assistant
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                      Your Intelligent
                      <span className="bg-gradient-primary bg-clip-text text-transparent"> Financial</span>
                      <br />Wellness Assistant
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-md">
                      Track, predict, and optimize your spending habits with AI-powered insights. 
                      Make every dollar count with SmartSpend.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      size="lg" 
                      className="bg-gradient-primary shadow-glow"
                      onClick={() => {
                        setIsLogin(false);
                        setStep(2);
                      }}
                    >
                      Get Started Free
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => {
                        setIsLogin(true);
                        setStep(2);
                      }}
                    >
                      Sign In
                    </Button>
                  </div>

                  <div className="flex items-center space-x-6 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">50K+</div>
                      <div className="text-sm text-muted-foreground">Active Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">$2.5B+</div>
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
                    onError={(e) => {
                      // Hide image if it fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent rounded-2xl"></div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-foreground mb-4">
                  Why Choose SmartSpend?
                </h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Powered by AI and designed for modern financial management
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg shadow-card border border-border/50">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                    <Wallet className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-foreground mb-2">Smart Expense Tracking</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically categorize and analyze your spending patterns with AI
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg shadow-card border border-border/50">
                  <div className="w-16 h-16 bg-gradient-success rounded-2xl flex items-center justify-center shadow-glow">
                    <Target className="w-8 h-8 text-success-foreground" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-foreground mb-2">Goal Achievement</h4>
                    <p className="text-sm text-muted-foreground">
                      Set and reach your financial milestones faster with smart insights
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg shadow-card border border-border/50">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                    <Brain className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-foreground mb-2">AI Financial Coach</h4>
                    <p className="text-sm text-muted-foreground">
                      Get personalized advice and insights tailored to your habits
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg shadow-card border border-border/50">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                    <Globe className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-foreground mb-2">Global Currency Support</h4>
                    <p className="text-sm text-muted-foreground">
                      Manage finances in any currency worldwide with real-time rates
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Dashboard Preview */}
          <section className="py-16">
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

              <div className="text-center space-y-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary shadow-glow"
                  onClick={() => {
                    setIsLogin(false);
                    setStep(2);
                  }}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Start Tracking Today
                </Button>
                <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>Bank-level security</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>Real-time insights</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    <span>50k+ happy users</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Additional Features */}
          <section className="py-16 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-foreground mb-4">
                  Everything You Need for Financial Success
                </h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Comprehensive tools and insights to help you achieve your financial goals
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
                    <img 
                      src="/Picture1.png" 
                      alt="SmartSpend Logo" 
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                  <span className="font-semibold text-foreground">SmartSpend</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  © 2025 JR Digital Insights. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </>
      ) : (
        // Authentication Flow (Steps 2-4)
        <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md card-clean">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6">
                <img 
                  src="/Picture1.png" 
                  alt="SmartSpend Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground mb-2">
                Welcome to SmartSpend
              </CardTitle>
              <p className="text-muted-foreground">
                Your AI-Powered Global Financial Assistant
              </p>
            </CardHeader>

            <CardContent className="card-spacing">
              {error && (
                <Alert className="border-destructive bg-destructive/10">
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {step === 2 && (
                <div className="card-spacing">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      {isLogin ? "Welcome back!" : "Create your account"}
                    </h3>
                    <p className="text-subtle">
                      {isLogin ? "Sign in to continue" : "Join thousands of users managing their finances"}
                    </p>
                  </div>

                  <div className="card-spacing">
                    <div>
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({...formData, email: e.target.value});
                          if (e.target.value) validateEmail(e.target.value);
                        }}
                        className="mt-1"
                      />
                      {emailError && (
                        <p className="text-xs text-destructive mt-1">{emailError}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="password" className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Password
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a secure password"
                          value={formData.password}
                          onChange={(e) => {
                            setFormData({...formData, password: e.target.value});
                            if (!isLogin) validatePassword(e.target.value);
                            setError(null); // Clear any previous errors
                          }}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {!isLogin && (
                      <>
                        <div>
                          <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Confirm Password
                          </Label>
                          <div className="relative mt-1">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                            <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                          )}
                        </div>

                        {/* Password Requirements - Always show for signup */}
                        {!isLogin && (
                          <div className={`p-3 rounded-lg border ${
                            formData.password && passwordErrors.length === 0 
                              ? 'bg-success/10 border-success/20' 
                              : 'bg-muted/50 border-border'
                          }`}>
                            <div className="flex items-start gap-2">
                              <Info className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                formData.password && passwordErrors.length === 0 
                                  ? 'text-success' 
                                  : 'text-muted-foreground'
                              }`} />
                              <div className="space-y-1">
                                <p className={`text-sm font-medium ${
                                  formData.password && passwordErrors.length === 0 
                                    ? 'text-success' 
                                    : 'text-muted-foreground'
                                }`}>
                                  Password requirements:
                                </p>
                                <ul className="text-xs space-y-0.5">
                                  {[
                                    { check: 'At least 6 characters', valid: formData.password?.length >= 6 },
                                    { check: 'One lowercase letter', valid: /[a-z]/.test(formData.password || '') },
                                    { check: 'One uppercase letter', valid: /[A-Z]/.test(formData.password || '') },
                                    { check: 'One number', valid: /\d/.test(formData.password || '') },
                                    { check: 'One special character', valid: /[!@#$%^&*()_+=[\]{}|;':",.<>/?`~-]/.test(formData.password || '') }
                                  ].map((requirement, index) => (
                                    <li key={index} className={`flex items-center gap-2 ${
                                      requirement.valid ? 'text-success' : 'text-muted-foreground'
                                    }`}>
                                      <span className={`w-1 h-1 rounded-full ${
                                        requirement.valid ? 'bg-success' : 'bg-muted-foreground'
                                      }`}></span>
                                      {requirement.check}
                                      {requirement.valid && <CheckCircle className="w-3 h-3 text-success ml-auto" />}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="space-y-3">
                    {isLogin ? (
                      <Button
                        className="w-full"
                        onClick={handleAuth}
                        disabled={loading || !canProceed()}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Signing In...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    ) : (
                    <Button
                      className="w-full"
                      onClick={handleNext}
                      disabled={!canProceed()}
                    >
                      {!canProceed() && !isLogin && formData.password && passwordErrors.length > 0 
                        ? "Complete password requirements to continue" 
                        : "Continue"}
                    </Button>
                    )}

                    <div className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsLogin(!isLogin);
                          setError(null);
                        }}
                      >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => setStep(1)}
                    >
                      ← Back to Home
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && !isLogin && (
                <div className="card-spacing">
                  <div className="text-center mb-6">
                    <User className="w-12 h-12 text-primary mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-foreground">Tell us about yourself</h3>
                    <p className="text-subtle">Help us personalize your experience</p>
                  </div>

                  <div>
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="mt-1"
                    />
                  </div>

                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      onClick={handleNext}
                      disabled={!canProceed()}
                    >
                      Continue
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={handleBack}
                    >
                      ← Back
                    </Button>
                  </div>
                </div>
              )}

              {step === 4 && !isLogin && (
                <div className="card-spacing">
                  <div className="text-center mb-6">
                    <DollarSign className="w-12 h-12 text-primary mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-foreground">Financial Setup</h3>
                    <p className="text-subtle">Set up your currency and income (optional)</p>
                  </div>

                  <div className="card-spacing">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Preferred Currency
                      </Label>
                      <div className="mt-1">
                        <CurrencySelector
                          value={formData.currency}
                          onValueChange={(currency) => setFormData({...formData, currency})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="income" className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Monthly Income (Optional)
                      </Label>
                      <Input
                        id="income"
                        type="number"
                        placeholder="Enter your monthly income"
                        value={formData.monthlyIncome || ""}
                        onChange={(e) => setFormData({
                          ...formData, 
                          monthlyIncome: parseFloat(e.target.value) || 0
                        })}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        This helps us provide better budgeting recommendations
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      onClick={handleAuth}
                      disabled={loading || !canProceed()}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={handleBack}
                    >
                      ← Back
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WelcomeScreen;