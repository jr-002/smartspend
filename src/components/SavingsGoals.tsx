import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, Trash2, Loader2 } from "lucide-react";
import EmptyState from "./EmptyState";
import { formatCurrency } from "@/utils/currencies";
import { useSavingsGoals, type NewSavingsGoal } from "@/hooks/useSavingsGoals";
import { useAuth } from "@/contexts/AuthContext";

const SavingsGoals = () => {
  const { goals, loading, addGoal, updateGoalProgress, deleteGoal } = useSavingsGoals();
  const { profile } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newGoal, setNewGoal] = useState<NewSavingsGoal>({
    name: "",
    target_amount: 0,
    current_amount: 0,
    deadline: "",
    description: ""
  });

  const handleAddGoal = async () => {
    if (!newGoal.name || !newGoal.target_amount || !newGoal.deadline) {
      return;
    }

    setIsSubmitting(true);
    const success = await addGoal(newGoal);
    
    if (success) {
      setNewGoal({ name: "", target_amount: 0, current_amount: 0, deadline: "", description: "" });
      setIsAddDialogOpen(false);
    }
    
    setIsSubmitting(false);
  };

  const handleDeleteGoal = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this savings goal?")) {
      await deleteGoal(id);
    }
  };

  const handleUpdateProgress = async (id: string, amount: number) => {
    await updateGoalProgress(id, amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Savings Goals</h2>
            <p className="text-muted-foreground">Set and track your financial goals</p>
          </div>
        </div>
        
        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading savings goals...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Savings Goals</h2>
            <p className="text-muted-foreground">Set and track your financial goals</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Savings Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Goal Name</Label>
                  <Input
                    id="name"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                    placeholder="e.g., Emergency Fund"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                    placeholder="Brief description of your goal"
                  />
                </div>
                <div>
                  <Label htmlFor="targetAmount">Target Amount</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    value={newGoal.target_amount || ""}
                    onChange={(e) => setNewGoal({...newGoal, target_amount: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="currentAmount">Current Amount (Optional)</Label>
                  <Input
                    id="currentAmount"
                    type="number"
                    value={newGoal.current_amount || ""}
                    onChange={(e) => setNewGoal({...newGoal, current_amount: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="deadline">Target Date</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                  />
                </div>
                <Button 
                  onClick={handleAddGoal} 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Goal"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <EmptyState type="goals" onAdd={() => setIsAddDialogOpen(true)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Savings Goals</h2>
          <p className="text-muted-foreground">Set and track your financial goals</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Savings Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Goal Name</Label>
                <Input
                  id="name"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                  placeholder="e.g., Emergency Fund"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  placeholder="Brief description of your goal"
                />
              </div>
              <div>
                <Label htmlFor="targetAmount">Target Amount</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  value={newGoal.target_amount || ""}
                  onChange={(e) => setNewGoal({...newGoal, target_amount: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="currentAmount">Current Amount (Optional)</Label>
                <Input
                  id="currentAmount"
                  type="number"
                  value={newGoal.current_amount || ""}
                  onChange={(e) => setNewGoal({...newGoal, current_amount: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="deadline">Target Date</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                />
              </div>
              <Button 
                onClick={handleAddGoal} 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Goal"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const progress = (goal.current_amount / goal.target_amount) * 100;
          const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <Card key={goal.id} className="shadow-card bg-gradient-card border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                      <Target className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{goal.name}</CardTitle>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(goal.current_amount, profile?.currency || "NGN")}</p>
                    <p className="text-sm text-muted-foreground">of {formatCurrency(goal.target_amount, profile?.currency || "NGN")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}</p>
                    <p className="text-xs text-muted-foreground">{goal.deadline}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const amount = parseFloat(prompt("Enter amount to add:") || "0");
                      if (amount > 0) handleUpdateProgress(goal.id, amount);
                    }}
                    className="flex-1"
                  >
                    Add Money
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const amount = parseFloat(prompt("Enter amount to withdraw:") || "0");
                      if (amount > 0) handleUpdateProgress(goal.id, -amount);
                    }}
                    className="flex-1"
                  >
                    Withdraw
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SavingsGoals;
