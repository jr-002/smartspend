
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet, Target, TrendingUp, Brain, Sparkles, Mail, Lock, User, DollarSign, CheckCircle, Eye, EyeOff, Info } from "lucide-react";
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
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    monthlyIncome: 0,
    currency: getDefaultCurrency().code
  });

  const { signUp, signIn } = useAuth();

  const handleNext = () => {
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

        // Validate email format
        try {
          emailSchema.parse(formData.email);
        } catch (err: any) {
          setError(err.issues?.[0]?.message || "Please enter a valid email address");
          setLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        try {
          passwordSchema.parse(formData.password);
        } catch (err: any) {
          setError(err.issues?.[0]?.message || "Password does not meet requirements");
          setLoading(false);
          return;
        }

        try {
          nameSchema.parse(formData.name.trim());
        } catch (err: any) {
          setError(err.issues?.[0]?.message || "Please enter a valid name");
          setLoading(false);
          return;
        }

        // Validate currency
        try {
          currencyCodeSchema.parse(formData.currency);
        } catch (err: any) {
          setError(err.issues?.[0]?.message || "Please select a valid currency");
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
        return formData.email && formData.password && (!isLogin ? formData.confirmPassword : true);
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
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card bg-gradient-card border-0">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
            <img 
              src="/Picture1.png" 
              alt="SmartSpend Logo" 
              className="w-12 h-12 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Welcome to SmartSpend
          </CardTitle>
          <p className="text-muted-foreground">
            Your Global Financial Wellness Assistant
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-destructive bg-destructive/10">
              <AlertDescription className="text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Let's get started!</h3>
                <p className="text-sm text-muted-foreground">
                  SmartSpend helps you track expenses, manage budgets, and achieve your financial goals globally.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <Wallet className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">Track Expenses</p>
                </div>
                <div className="text-center p-4 bg-success/5 rounded-lg border border-success/20">
                  <Target className="w-8 h-8 text-success mx-auto mb-2" />
                  <p className="text-sm font-medium">Set Goals</p>
                </div>
                <div className="text-center p-4 bg-warning/5 rounded-lg border border-warning/20">
                  <TrendingUp className="w-8 h-8 text-warning mx-auto mb-2" />
                  <p className="text-sm font-medium">Invest Wisely</p>
                </div>
                <div className="text-center p-4 bg-purple-500/5 rounded-lg border border-purple-500/20">
                  <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm font-medium">AI Insights</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsLogin(true);
                    setStep(2);
                  }}
                >
                  Sign In
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setIsLogin(false);
                    setStep(2);
                  }}
                >
                  Sign Up
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">
                  {isLogin ? "Welcome back!" : "Create your account"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isLogin ? "Sign in to continue" : "Join thousands of users managing their finances"}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="mt-1"
                  />
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
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
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
                  {!isLogin && formData.password && (
                    <div className="mt-2 p-3 bg-muted/30 rounded-lg border border-border/50">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-muted-foreground">
                          <p className="font-medium mb-1">Password Requirements:</p>
                          <p>Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {!isLogin && (
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
                  </div>
                )}
              </div>

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
            </div>
          )}

          {step === 3 && !isLogin && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Tell us about yourself</h3>
                <p className="text-sm text-muted-foreground">
                  This helps us personalize your experience
                </p>
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
            </div>
          )}

          {step === 4 && !isLogin && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Financial preferences</h3>
                <p className="text-sm text-muted-foreground">
                  Help us provide better recommendations
                </p>
              </div>

              <div>
                <Label htmlFor="currency">Preferred Currency</Label>
                <CurrencySelector
                  value={formData.currency}
                  onValueChange={(currency) => setFormData({...formData, currency})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="income" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Monthly Income (Optional)
                </Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="0"
                  value={formData.monthlyIncome || ""}
                  onChange={(e) => setFormData({...formData, monthlyIncome: parseFloat(e.target.value) || 0})}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This helps us provide better budget recommendations
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} disabled={loading}>
                Back
              </Button>
            )}
            
            {(step === 2 && isLogin) || (step === 4 && !isLogin) ? (
              <Button 
                onClick={handleAuth}
                disabled={!canProceed() || loading}
                className="ml-auto"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </Button>
            ) : (
              step < 4 && (
                <Button 
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="ml-auto"
                >
                  Next
                </Button>
              )
            )}
          </div>

          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === step ? "bg-primary" : "bg-muted"
                } ${isLogin && i > 2 ? "hidden" : ""}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeScreen;
