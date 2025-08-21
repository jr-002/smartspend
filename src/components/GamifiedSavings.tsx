import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Rocket, Bell, Star, Gift, Target, Zap } from "lucide-react";

const GamifiedSavings = () => {
  return (
    <div className="space-y-6">
      {/* Header Stats Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card bg-gradient-primary text-primary-foreground border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Points</p>
                <p className="text-2xl font-bold">Coming Soon</p>
              </div>
              <Star className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-success text-success-foreground border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Level</p>
                <p className="text-2xl font-bold">Coming Soon</p>
              </div>
              <Trophy className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold text-foreground">Coming Soon</p>
              </div>
              <Zap className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rewards</p>
                <p className="text-2xl font-bold text-foreground">Coming Soon</p>
              </div>
              <Gift className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Trophy className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Gamified Savings & Rewards
          </CardTitle>
          <p className="text-muted-foreground">
            Coming Soon - Earn points, complete challenges, and unlock rewards!
          </p>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="max-w-md mx-auto space-y-4">
            <div className="p-6 bg-muted/30 rounded-lg">
              <Rocket className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Exciting Features Coming!</h3>
              <p className="text-sm text-muted-foreground">
                We're building an amazing gamification system to make saving fun and rewarding:
              </p>
            </div>
            
            <div className="grid gap-3 text-left">
              <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Daily, weekly, and monthly savings challenges</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Achievement badges and level progression</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <Gift className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Redeem points for airtime, data, and vouchers</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Savings streaks and multiplier bonuses</span>
              </div>
            </div>
            
            <Button className="bg-gradient-primary gap-2">
              <Bell className="w-4 h-4" />
              Notify Me When Ready
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamifiedSavings;