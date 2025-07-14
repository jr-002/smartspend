
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Target, TrendingUp, Brain, Sparkles } from "lucide-react";
import CurrencySelector from "./CurrencySelector";
import { getDefaultCurrency } from "@/utils/currencies";

interface WelcomeScreenProps {
  onComplete: (userData: { name: string; monthlyIncome: number; currency: string }) => void;
}

const WelcomeScreen = ({ onComplete }: WelcomeScreenProps) => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    name: "",
    monthlyIncome: 0,
    currency: getDefaultCurrency().code
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete(userData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card bg-gradient-card border-0">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Welcome to SmartSpend
          </CardTitle>
          <p className="text-muted-foreground">
            Your Global Financial Wellness Assistant
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
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
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">What should we call you?</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={userData.name}
                  onChange={(e) => setUserData({...userData, name: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="currency">Choose Your Currency</Label>
                <CurrencySelector
                  value={userData.currency}
                  onValueChange={(currency) => setUserData({...userData, currency})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="income">Monthly Income (Optional)</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="0"
                  value={userData.monthlyIncome || ""}
                  onChange={(e) => setUserData({...userData, monthlyIncome: parseFloat(e.target.value) || 0})}
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
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button 
              onClick={handleNext}
              disabled={step === 2 && !userData.name.trim()}
              className="ml-auto"
            >
              {step === 3 ? "Get Started" : "Next"}
            </Button>
          </div>

          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeScreen;
