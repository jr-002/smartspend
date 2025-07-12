import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, Calendar, TrendingUp } from "lucide-react";

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  color: string;
}

const SavingsGoals = () => {
  const [goals] = useState<SavingsGoal[]>([
    {
      id: "1",
      name: "Vacation to Dubai",
      targetAmount: 500000,
      currentAmount: 180000,
      deadline: "2025-12-31",
      category: "Travel",
      color: "bg-blue-500"
    },
    {
      id: "2",
      name: "New Car Deposit",
      targetAmount: 1000000,
      currentAmount: 650000,
      deadline: "2025-08-15",
      category: "Transportation",
      color: "bg-green-500"
    },
    {
      id: "3",
      name: "Emergency Fund",
      targetAmount: 300000,
      currentAmount: 120000,
      deadline: "2025-06-30",
      category: "Emergency",
      color: "bg-red-500"
    },
    {
      id: "4",
      name: "New Laptop",
      targetAmount: 150000,
      currentAmount: 95000,
      deadline: "2025-03-31",
      category: "Technology",
      color: "bg-purple-500"
    }
  ]);

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getMonthlyTarget = (goal: SavingsGoal) => {
    const remaining = goal.targetAmount - goal.currentAmount;
    const daysRemaining = getDaysRemaining(goal.deadline);
    const monthsRemaining = Math.max(daysRemaining / 30, 1);
    return Math.ceil(remaining / monthsRemaining);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Target className="w-6 h-6" />
              Savings Goals
            </CardTitle>
            <Button className="bg-gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-6">
            {goals.map((goal) => {
              const progressPercentage = getProgressPercentage(goal.currentAmount, goal.targetAmount);
              const daysRemaining = getDaysRemaining(goal.deadline);
              const monthlyTarget = getMonthlyTarget(goal);
              
              return (
                <div key={goal.id} className="p-6 border rounded-lg bg-card/50 hover:bg-card transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${goal.color}`}></div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{goal.name}</h3>
                        <Badge variant="outline" className="mt-1">
                          {goal.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">
                        ₦{goal.currentAmount.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        of ₦{goal.targetAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-foreground">
                        {progressPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Due: {new Date(goal.deadline).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            ₦{monthlyTarget.toLocaleString()}/month
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Recommended saving
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Edit
                        </Button>
                        <Button size="sm" className="flex-1 bg-gradient-primary">
                          Add Money
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SavingsGoals;