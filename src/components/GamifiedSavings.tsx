import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Star, Target, Zap, Gift, Calendar, Flame, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/utils/currencies";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  points: number;
  progress: number;
  target: number;
  deadline: string;
  completed: boolean;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: 'airtime' | 'data' | 'voucher' | 'cashback';
  available: boolean;
}

const GamifiedSavings = () => {
  const { profile } = useAuth();
  const [userPoints, setUserPoints] = useState(1250);
  const [currentStreak, setCurrentStreak] = useState(7);
  const [level, setLevel] = useState(3);
  const [levelProgress, setLevelProgress] = useState(65);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first savings goal',
      icon: '🎯',
      points: 100,
      unlocked: true,
      progress: 1,
      maxProgress: 1
    },
    {
      id: '2',
      title: 'Budget Master',
      description: 'Stay within budget for 7 consecutive days',
      icon: '💰',
      points: 200,
      unlocked: true,
      progress: 7,
      maxProgress: 7
    },
    {
      id: '3',
      title: 'Savings Streak',
      description: 'Save money for 30 consecutive days',
      icon: '🔥',
      points: 500,
      unlocked: false,
      progress: 7,
      maxProgress: 30
    },
    {
      id: '4',
      title: 'Investment Pioneer',
      description: 'Make your first investment',
      icon: '📈',
      points: 300,
      unlocked: false,
      progress: 0,
      maxProgress: 1
    },
    {
      id: '5',
      title: 'Debt Destroyer',
      description: 'Pay off a debt completely',
      icon: '⚡',
      points: 400,
      unlocked: false,
      progress: 0,
      maxProgress: 1
    }
  ]);

  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'No Spend Day',
      description: 'Go a full day without any non-essential spending',
      type: 'daily',
      points: 50,
      progress: 0,
      target: 1,
      deadline: 'Today',
      completed: false
    },
    {
      id: '2',
      title: '₦1,000 Challenge',
      description: 'Save ₦1,000 this week through small cuts',
      type: 'weekly',
      points: 150,
      progress: 650,
      target: 1000,
      deadline: '3 days left',
      completed: false
    },
    {
      id: '3',
      title: 'Cook at Home',
      description: 'Prepare meals at home for 5 days this week',
      type: 'weekly',
      points: 100,
      progress: 3,
      target: 5,
      deadline: '4 days left',
      completed: false
    },
    {
      id: '4',
      title: 'Emergency Fund Builder',
      description: 'Add ₦5,000 to your emergency fund this month',
      type: 'monthly',
      points: 300,
      progress: 2000,
      target: 5000,
      deadline: '12 days left',
      completed: false
    }
  ]);

  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: '1',
      title: '₦100 Airtime',
      description: 'Get ₦100 airtime for any network',
      cost: 200,
      category: 'airtime',
      available: true
    },
    {
      id: '2',
      title: '1GB Data Bundle',
      description: '1GB data for MTN, Airtel, Glo, or 9mobile',
      cost: 300,
      category: 'data',
      available: true
    },
    {
      id: '3',
      title: 'Netflix Voucher',
      description: '1-month Netflix subscription voucher',
      cost: 800,
      category: 'voucher',
      available: true
    },
    {
      id: '4',
      title: '₦500 Cashback',
      description: 'Direct cashback to your account',
      cost: 1000,
      category: 'cashback',
      available: true
    },
    {
      id: '5',
      title: 'Spotify Premium',
      description: '3-month Spotify Premium subscription',
      cost: 1200,
      category: 'voucher',
      available: userPoints >= 1200
    }
  ]);

  const completeChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => {
      if (challenge.id === challengeId && !challenge.completed) {
        setUserPoints(points => points + challenge.points);
        return { ...challenge, completed: true, progress: challenge.target };
      }
      return challenge;
    }));
  };

  const redeemReward = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (reward && userPoints >= reward.cost) {
      setUserPoints(prev => prev - reward.cost);
      // In a real app, this would trigger the reward fulfillment
      alert(`🎉 Congratulations! Your ${reward.title} has been processed and will be delivered shortly.`);
    }
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Calendar className="w-4 h-4" />;
      case 'weekly': return <Target className="w-4 h-4" />;
      case 'monthly': return <Trophy className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getRewardIcon = (category: string) => {
    switch (category) {
      case 'airtime': return '📞';
      case 'data': return '📱';
      case 'voucher': return '🎫';
      case 'cashback': return '💰';
      default: return '🎁';
    }
  };

  return (
    <div className="space-y-6">
      {/* User Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card bg-gradient-primary text-primary-foreground border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Points</p>
                <p className="text-2xl font-bold">{userPoints.toLocaleString()}</p>
              </div>
              <Star className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-success text-success-foreground border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Current Level</p>
                <p className="text-2xl font-bold">Level {level}</p>
              </div>
              <Trophy className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Savings Streak</p>
                <p className="text-2xl font-bold text-foreground flex items-center gap-1">
                  <Flame className="w-6 h-6 text-orange-500" />
                  {currentStreak} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Level Progress</p>
                <p className="text-sm font-medium text-foreground">{levelProgress}%</p>
              </div>
              <Progress value={levelProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {1000 - (levelProgress * 10)} points to Level {level + 1}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Gamified Savings & Rewards
          </CardTitle>
          <p className="text-muted-foreground">
            Complete challenges, earn points, unlock achievements, and redeem amazing rewards!
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="challenges" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="challenges">Active Challenges</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="rewards">Rewards Store</TabsTrigger>
            </TabsList>
            
            <TabsContent value="challenges" className="space-y-4">
              <div className="grid gap-4">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="p-6 border rounded-lg bg-card/50 hover:bg-card transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          {getChallengeIcon(challenge.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">{challenge.title}</h3>
                          <p className="text-sm text-muted-foreground">{challenge.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={`${
                              challenge.type === 'daily' ? 'bg-blue-100 text-blue-800' :
                              challenge.type === 'weekly' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {challenge.type}
                            </Badge>
                            <Badge variant="outline">
                              <Star className="w-3 h-3 mr-1" />
                              {challenge.points} points
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{challenge.deadline}</p>
                        {challenge.completed ? (
                          <Badge className="bg-success text-success-foreground mt-2">
                            <Award className="w-3 h-3 mr-1" />
                            Completed!
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => completeChallenge(challenge.id)}
                            className="mt-2 bg-gradient-primary"
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold text-foreground">
                          {challenge.type === 'weekly' && challenge.id === '2' 
                            ? formatCurrency(challenge.progress, profile?.currency || 'USD')
                            : challenge.progress
                          } / {
                            challenge.type === 'weekly' && challenge.id === '2'
                              ? formatCurrency(challenge.target, profile?.currency || 'USD')
                              : challenge.target
                          }
                        </span>
                      </div>
                      <Progress 
                        value={(challenge.progress / challenge.target) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="achievements" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`p-6 border rounded-lg transition-colors ${
                    achievement.unlocked 
                      ? 'bg-success/10 border-success/20' 
                      : 'bg-card/50 hover:bg-card'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`text-4xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`font-semibold ${
                            achievement.unlocked ? 'text-success' : 'text-foreground'
                          }`}>
                            {achievement.title}
                          </h3>
                          {achievement.unlocked && (
                            <Badge className="bg-success text-success-foreground">
                              <Award className="w-3 h-3 mr-1" />
                              Unlocked
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {achievement.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            <Star className="w-3 h-3 mr-1" />
                            {achievement.points} points
                          </Badge>
                          {!achievement.unlocked && (
                            <span className="text-xs text-muted-foreground">
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          )}
                        </div>
                        {!achievement.unlocked && (
                          <Progress 
                            value={(achievement.progress / achievement.maxProgress) * 100} 
                            className="h-1 mt-2" 
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="rewards" className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.map((reward) => (
                  <div key={reward.id} className={`p-6 border rounded-lg transition-colors ${
                    reward.available && userPoints >= reward.cost
                      ? 'bg-card hover:bg-card/80 border-primary/20'
                      : 'bg-muted/30 border-muted'
                  }`}>
                    <div className="text-center space-y-3">
                      <div className="text-4xl">{getRewardIcon(reward.category)}</div>
                      <div>
                        <h3 className={`font-semibold ${
                          reward.available && userPoints >= reward.cost
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }`}>
                          {reward.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {reward.description}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Badge className={`${
                          userPoints >= reward.cost
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <Star className="w-3 h-3 mr-1" />
                          {reward.cost} points
                        </Badge>
                        <Button
                          onClick={() => redeemReward(reward.id)}
                          disabled={!reward.available || userPoints < reward.cost}
                          className="w-full bg-gradient-primary"
                          size="sm"
                        >
                          {userPoints >= reward.cost ? 'Redeem' : 'Not enough points'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center p-6 bg-muted/30 rounded-lg">
                <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">More Rewards Coming Soon!</h3>
                <p className="text-sm text-muted-foreground">
                  Keep completing challenges and earning points. We're adding new rewards weekly!
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamifiedSavings;