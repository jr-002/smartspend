import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  Star,
  Gift,
  Target,
  Zap,
  Lock,
  CheckCircle2,
  Plus,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const GamifiedSavings = () => {
  const { user } = useAuth();
  const {
    gamificationData,
    achievements,
    challenges,
    allAchievements,
    currentLevel,
    levelProgress,
    loading,
    updateStreak,
    createChallenge,
  } = useGamification();

  // Update streak on component mount
  useEffect(() => {
    if (user?.id && gamificationData) {
      updateStreak();
    }
  }, [user?.id, gamificationData?.id]);

  if (!user) {
    return (
      <Card className="shadow-card bg-gradient-card border-0">
        <CardContent className="p-8 text-center">
          <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Sign in to Start Earning!
          </h3>
          <p className="text-muted-foreground">
            Track your progress, earn points, and unlock achievements.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-card">
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const earnedAchievementIds = achievements.map((a) => a.achievement_id);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Points Card */}
        <Card className="shadow-card bg-gradient-primary text-primary-foreground border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Points</p>
                <p className="text-3xl font-bold">
                  {gamificationData?.total_points || 0}
                </p>
              </div>
              <Star className="w-10 h-10 opacity-80" />
            </div>
          </CardContent>
        </Card>

        {/* Level Card */}
        <Card className="shadow-card bg-gradient-success text-success-foreground border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm opacity-90">Level {currentLevel.level}</p>
                <p className="text-xl font-bold">{currentLevel.name}</p>
              </div>
              <span className="text-3xl">{currentLevel.icon}</span>
            </div>
            <Progress
              value={levelProgress.percentage}
              className="h-2 bg-white/20"
            />
            <p className="text-xs mt-1 opacity-80">
              {levelProgress.current} / {levelProgress.required} to next level
            </p>
          </CardContent>
        </Card>

        {/* Streak Card */}
        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-3xl font-bold text-foreground">
                  {gamificationData?.current_streak || 0}
                  <span className="text-lg ml-1">days</span>
                </p>
              </div>
              <Zap className="w-10 h-10 text-orange-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Best: {gamificationData?.longest_streak || 0} days
            </p>
          </CardContent>
        </Card>

        {/* Achievements Card */}
        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Achievements</p>
                <p className="text-3xl font-bold text-foreground">
                  {achievements.length}
                  <span className="text-lg text-muted-foreground ml-1">
                    / {allAchievements.length}
                  </span>
                </p>
              </div>
              <Trophy className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Challenges */}
      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Active Challenges
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => createChallenge("daily")}
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              Daily
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => createChallenge("weekly")}
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              Weekly
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {challenges.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No active challenges</p>
              <p className="text-sm text-muted-foreground">
                Create a challenge to start earning bonus points!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {challenges.map((challenge) => {
                const progress =
                  (challenge.current_amount / challenge.target_amount) * 100;
                return (
                  <div
                    key={challenge.id}
                    className="p-4 bg-muted/30 rounded-lg border border-border/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge
                          variant={
                            challenge.challenge_type === "daily"
                              ? "default"
                              : challenge.challenge_type === "weekly"
                              ? "secondary"
                              : "outline"
                          }
                          className="mb-2"
                        >
                          {challenge.challenge_type}
                        </Badge>
                        <h4 className="font-semibold text-foreground">
                          {challenge.title}
                        </h4>
                      </div>
                      <div className="text-right">
                        <Gift className="w-5 h-5 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          +{challenge.points_reward}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {challenge.description}
                    </p>
                    <Progress value={progress} className="h-2 mb-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {challenge.current_amount} / {challenge.target_amount}
                      </span>
                      <span>Ends: {challenge.end_date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allAchievements.map((achievement) => {
              const isEarned = earnedAchievementIds.includes(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={cn(
                    "p-4 rounded-lg border text-center transition-all",
                    isEarned
                      ? "bg-primary/10 border-primary/30"
                      : "bg-muted/20 border-border/30 opacity-60"
                  )}
                >
                  <div className="relative inline-block mb-2">
                    <span className="text-3xl">{achievement.icon}</span>
                    {isEarned ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 absolute -bottom-1 -right-1" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground absolute -bottom-1 -right-1" />
                    )}
                  </div>
                  <h4 className="font-semibold text-foreground text-sm">
                    {achievement.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {achievement.description}
                  </p>
                  <Badge
                    variant={isEarned ? "default" : "secondary"}
                    className="mt-2"
                  >
                    +{achievement.points} pts
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Points History Hint */}
      <Card className="shadow-card bg-gradient-card border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">
                Keep Growing Your Wealth!
              </h4>
              <p className="text-sm text-muted-foreground">
                Log transactions, reach savings goals, and maintain your streak
                to earn more points and unlock achievements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamifiedSavings;
