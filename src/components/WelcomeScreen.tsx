import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  Target, 
  TrendingUp, 
  Brain, 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  DollarSign, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Info, 
  Shield, 
  Zap, 
  Globe, 
  Star, 
  Loader2, 
  PieChart, 
  TrendingDown, 
  Plus,
  ArrowRight,
  Check
} from "lucide-react";
import CurrencySelector from "./CurrencySelector";
import { getDefaultCurrency } from "@/utils/currencies";
import { useAuth } from "@/contexts/AuthContext";
import { passwordSchema, emailSchema, nameSchema, currencyCodeSchema } from "@/utils/validation";

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Check Your Email
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-300">
              We've sent you a verification link
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <Mail className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Verification Email Sent!</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  We've sent a verification link to:
                </p>
                <p className="font-medium text-slate-900 dark:text-white">{formData.email}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Please check your email and click the verification link to activate your account.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {step === 1 ? (
        // Landing Page
        <>
          {/* Header */}
          <header className="border-b border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 px-4 sm:px-6">
            <div className="container mx-auto py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <img 
                      src="/Picture1.png" 
                      alt="SmartSpend Logo" 
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<span class="text-white font-bold text-lg">S</span>';
                      }}
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">SmartSpend</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-300 hidden sm:block">Financial Intelligence</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsLogin(true);
                    setStep(2);
                  }}
                  className="border-slate-300 dark:border-slate-600"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <section className="relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-24">
              <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                <div className="space-y-8">
                  <div className="space-y-6">
                    <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700">
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI-Powered Financial Assistant
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
                      Your Intelligent
                      <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent block">
                        Financial
                      </span>
                      Wellness Assistant
                    </h2>
                    <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed">
                      Track, predict, and optimize your spending habits with AI-powered insights. 
                      Make every dollar count with SmartSpend.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
                      onClick={() => {
                        setIsLogin(false);
                        setStep(2);
                      }}
                    >
                      Get Started Free
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => {
                        setIsLogin(true);
                        setStep(2);
                      }}
                      className="border-slate-300 dark:border-slate-600 px-8 py-3"
                    >
                      Sign In
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">50K+</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Active Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">$2.5B+</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Money Tracked</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">4.9★</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">App Rating</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700">
                    {/* Mock Dashboard Preview */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Financial Overview</h3>
                        <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">Live</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm text-slate-600 dark:text-slate-300">Balance</span>
                          </div>
                          <div className="text-xl font-bold text-slate-900 dark:text-white">$12,543</div>
                          <div className="text-xs text-emerald-600">+12.5%</div>
                        </div>
                        
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-slate-600 dark:text-slate-300">Savings</span>
                          </div>
                          <div className="text-xl font-bold text-slate-900 dark:text-white">$3,200</div>
                          <div className="text-xs text-blue-600">Goal: 85%</div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">AI Insight</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          You're on track to save $500 more this month by reducing dining out expenses.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating elements */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-emerald-500 rounded-full animate-pulse"></div>
                  <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-500 rounded-full animate-pulse delay-1000"></div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 lg:py-24 bg-white/50 dark:bg-slate-800/50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                  Why Choose SmartSpend?
                </h3>
                <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                  Powered by AI and designed for modern financial management
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {[
                  {
                    icon: Wallet,
                    title: "Smart Expense Tracking",
                    description: "Automatically categorize and analyze your spending patterns with AI",
                    color: "from-emerald-500 to-emerald-600"
                  },
                  {
                    icon: Target,
                    title: "Goal Achievement",
                    description: "Set and reach your financial milestones faster with smart insights",
                    color: "from-blue-500 to-blue-600"
                  },
                  {
                    icon: Brain,
                    title: "AI Financial Coach",
                    description: "Get personalized advice and insights tailored to your habits",
                    color: "from-purple-500 to-purple-600"
                  },
                  {
                    icon: Globe,
                    title: "Global Currency Support",
                    description: "Manage finances in any currency worldwide with real-time rates",
                    color: "from-orange-500 to-orange-600"
                  }
                ].map((feature, index) => (
                  <div key={index} className="group">
                    <div className="flex flex-col items-center gap-4 sm:gap-6 p-6 sm:p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-center">
                        <h4 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2 sm:mb-3">{feature.title}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Dashboard Preview */}
          <section className="py-16 lg:py-24">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                  Experience Smart Financial Management
                </h3>
                <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                  Get real-time insights into your spending patterns with our beautiful, intuitive dashboard
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
                {[
                  { label: "Current Balance", value: "₦125,430", change: "+12.5%", icon: TrendingUp, positive: true },
                  { label: "This Month Spent", value: "₦45,280", change: "85% of budget", icon: TrendingDown, positive: false },
                  { label: "Budget Goal", value: "₦53,000", change: "On track", icon: Target, positive: true },
                  { label: "Top Category", value: "Food", change: "₦18,500 (41%)", icon: PieChart, positive: null }
                ].map((stat, index) => (
                  <Card key={index} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-3">
                        <stat.icon className={`w-5 h-5 ${
                          stat.positive === true ? 'text-emerald-600' : 
                          stat.positive === false ? 'text-red-500' : 'text-blue-600'
                        }`} />
                        <span className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</span>
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</div>
                      <div className={`text-sm ${
                        stat.positive === true ? 'text-emerald-600' : 
                        stat.positive === false ? 'text-orange-600' : 'text-slate-600 dark:text-slate-300'
                      }`}>
                        {stat.change}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center space-y-6">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
                  onClick={() => {
                    setIsLogin(false);
                    setStep(2);
                  }}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Start Tracking Today
                </Button>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Bank-level security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>Real-time insights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    <span>50k+ happy users</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-8">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center space-x-3 mb-4 md:mb-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <img 
                      src="/Picture1.png" 
                      alt="SmartSpend Logo" 
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<span class="text-white font-bold text-sm">S</span>';
                      }}
                    />
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">SmartSpend</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  © 2025 JR Digital Insights. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </>
      ) : (
        // Authentication Flow (Steps 2-4)
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-sm sm:max-w-md shadow-xl border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <img 
                  src="/Picture1.png" 
                  alt="SmartSpend Logo" 
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<span class="text-white font-bold text-2xl">S</span>';
                  }}
                />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome to SmartSpend
              </CardTitle>
              <p className="text-slate-600 dark:text-slate-300">
                Your AI-Powered Financial Assistant
              </p>
              
              {/* Progress indicator */}
              <div className="flex justify-center mt-6">
                <div className="flex space-x-2">
                  {[2, 3, 4].map((stepNum) => (
                    <div
                      key={stepNum}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        step >= stepNum 
                          ? 'bg-emerald-500' 
                          : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {isLogin ? "Welcome back!" : "Create your account"}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      {isLogin ? "Sign in to continue" : "Join thousands managing their finances"}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
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
                        className="mt-2 border-slate-300 dark:border-slate-600"
                      />
                      {emailError && (
                        <p className="text-xs text-red-500 mt-1">{emailError}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="password" className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                        <Lock className="w-4 h-4" />
                        Password
                      </Label>
                      <div className="relative mt-2">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a secure password"
                          value={formData.password}
                          onChange={(e) => {
                            setFormData({...formData, password: e.target.value});
                            if (!isLogin) validatePassword(e.target.value);
                            setError(null);
                          }}
                          className="pr-10 border-slate-300 dark:border-slate-600 text-sm sm:text-base"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-slate-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-slate-400" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {!isLogin && (
                      <>
                        <div>
                          <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                            <Lock className="w-4 h-4" />
                            Confirm Password
                          </Label>
                          <div className="relative mt-2">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                              className="pr-10 border-slate-300 dark:border-slate-600 text-sm sm:text-base"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-slate-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-slate-400" />
                              )}
                            </Button>
                          </div>
                          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                          )}
                        </div>

                        {/* Password Requirements */}
                        {!isLogin && formData.password && (
                          <div className={`p-4 rounded-lg border ${
                            passwordErrors.length === 0 
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700' 
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600'
                          }`}>
                            <div className="flex items-start gap-3">
                              <Info className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                passwordErrors.length === 0 
                                  ? 'text-emerald-600 dark:text-emerald-400' 
                                  : 'text-slate-500 dark:text-slate-400'
                              }`} />
                              <div className="space-y-2">
                                <p className={`text-sm font-medium ${
                                  passwordErrors.length === 0 
                                    ? 'text-emerald-700 dark:text-emerald-300' 
                                    : 'text-slate-700 dark:text-slate-200'
                                }`}>
                                  Password requirements:
                                </p>
                                <div className="grid grid-cols-1 gap-1 text-xs sm:text-sm">
                                  {[
                                    { check: 'At least 6 characters', valid: formData.password?.length >= 6 },
                                    { check: 'One lowercase letter', valid: /[a-z]/.test(formData.password || '') },
                                    { check: 'One uppercase letter', valid: /[A-Z]/.test(formData.password || '') },
                                    { check: 'One number', valid: /\d/.test(formData.password || '') },
                                    { check: 'One special character', valid: /[!@#$%^&*()_+=[\]{}|;':",.<>/?`~-]/.test(formData.password || '') }
                                  ].map((requirement, index) => (
                                    <div key={index} className={`flex items-center gap-2 ${
                                      requirement.valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                                    }`}>
                                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                        requirement.valid ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-100 dark:bg-slate-700'
                                      }`}>
                                        {requirement.valid && <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />}
                                      </div>
                                      {requirement.check}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="space-y-4">
                    {isLogin ? (
                      <Button
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
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
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                        onClick={handleNext}
                        disabled={!canProceed()}
                      >
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
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
                        className="text-slate-600 dark:text-slate-300"
                      >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-slate-600 dark:text-slate-300"
                      onClick={() => setStep(1)}
                    >
                      ← Back to Home
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && !isLogin && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Tell us about yourself</h3>
                    <p className="text-slate-600 dark:text-slate-300">Help us personalize your experience</p>
                  </div>

                  <div>
                    <Label htmlFor="name" className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <User className="w-4 h-4" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="mt-2 border-slate-300 dark:border-slate-600 text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-4">
                    <Button
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                      onClick={handleNext}
                      disabled={!canProceed()}
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-slate-600 dark:text-slate-300"
                      onClick={handleBack}
                    >
                      ← Back
                    </Button>
                  </div>
                </div>
              )}

              {step === 4 && !isLogin && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Financial Setup</h3>
                    <p className="text-slate-600 dark:text-slate-300">Set up your currency and income (optional)</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                        <Globe className="w-4 h-4" />
                        Preferred Currency
                      </Label>
                      <div className="mt-2">
                        <CurrencySelector
                          value={formData.currency}
                          onValueChange={(currency) => setFormData({...formData, currency})}
                          className="border-slate-300 dark:border-slate-600"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="income" className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
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
                        className="mt-2 border-slate-300 dark:border-slate-600 text-sm sm:text-base"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        This helps us provide better budgeting recommendations
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                      onClick={handleAuth}
                      disabled={loading || !canProceed()}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <Check className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-slate-600 dark:text-slate-300"
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