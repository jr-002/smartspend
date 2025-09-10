
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Target, PieChart } from "lucide-react";

interface EmptyStateProps {
  type: "transactions" | "goals" | "bills" | "investments" | "debts" | "budgets";
  onAdd?: () => void;
}

const EmptyState = ({ type, onAdd }: EmptyStateProps) => {
  const configs = {
    transactions: {
      icon: TrendingUp,
      title: "No transactions yet",
      description: "Start by adding your first transaction to track your spending",
      buttonText: "Add Transaction"
    },
    goals: {
      icon: Target,
      title: "No savings goals set",
      description: "Create your first savings goal to start building your future",
      buttonText: "Create Goal"
    },
    bills: {
      icon: PieChart,
      title: "No bills added",
      description: "Add your recurring bills to stay on top of payments",
      buttonText: "Add Bill"
    },
    investments: {
      icon: TrendingUp,
      title: "No investments tracked",
      description: "Start tracking your investment portfolio for better insights",
      buttonText: "Add Investment"
    },
    debts: {
      icon: TrendingUp,
      title: "No debts to manage",
      description: "Add any debts you have to create a payoff strategy",
      buttonText: "Add Debt"
    },
    budgets: {
      icon: PieChart,
      title: "No budgets created",
      description: "Create your first budget to track and control your spending",
      buttonText: "Create Budget"
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <Card className="card-clean">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mb-6">
          <Icon className="w-8 h-8 text-muted-foreground/70" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-3">
          {config.title}
        </h3>
        <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">
          {config.description}
        </p>
        {onAdd && (
          <Button onClick={onAdd} className="gap-2" size="lg">
            <Plus className="w-4 h-4" />
            {config.buttonText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
