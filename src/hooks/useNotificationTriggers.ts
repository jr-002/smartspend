import { useEffect } from 'react';
import { useNotifications } from './useNotifications';
import { useTransactions } from './useTransactions';
import { useBills } from './useBills';
import { useBudgets } from './useBudgets';
import { useSavingsGoals } from './useSavingsGoals';
import { useAuth } from '@/contexts/AuthContext';

export const useNotificationTriggers = () => {
  const { addNotification, settings } = useNotifications();
  const { transactions } = useTransactions();
  const { bills } = useBills();
  const { budgets } = useBudgets();
  const { goals: savingsGoals } = useSavingsGoals();
  const { user, profile } = useAuth();

  // Check for budget overruns
  useEffect(() => {
    if (!user || !settings.budgetAlerts || !transactions.length || !budgets.length) return;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthTransactions = transactions.filter(t => 
      t.date.startsWith(currentMonth) && t.transaction_type === 'expense'
    );

    const categorySpending: Record<string, number> = {};
    currentMonthTransactions.forEach(transaction => {
      categorySpending[transaction.category] = (categorySpending[transaction.category] || 0) + transaction.amount;
    });

    budgets.forEach(budget => {
      const spent = categorySpending[budget.category] || 0;
      const percentage = (spent / budget.amount) * 100;

      if (percentage >= 100) {
        addNotification({
          title: 'Budget Exceeded',
          message: `You have exceeded your ${budget.category} budget by ${((spent - budget.amount) / budget.amount * 100).toFixed(1)}%`,
          type: 'budget',
          priority: 'high',
          read: false,
          data: { category: budget.category, spent, budgeted: budget.amount }
        });
      } else if (percentage >= 80) {
        addNotification({
          title: 'Budget Alert',
          message: `You have used ${percentage.toFixed(1)}% of your ${budget.category} budget`,
          type: 'budget',
          priority: 'medium',
          read: false,
          data: { category: budget.category, spent, budgeted: budget.amount, percentage }
        });
      }
    });
  }, [transactions, budgets, user, settings.budgetAlerts, addNotification]);

  // Check for upcoming bill due dates
  useEffect(() => {
    if (!user || !settings.billReminders || !bills.length) return;

    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    bills.forEach(bill => {
      if (bill.status === 'pending') {
        const dueDate = new Date(bill.due_date);
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

        if (daysUntilDue <= 3 && daysUntilDue >= 0) {
          const priority = daysUntilDue === 0 ? 'high' : daysUntilDue === 1 ? 'high' : 'medium';
          addNotification({
            title: 'Bill Due Soon',
            message: `${bill.name} is due ${daysUntilDue === 0 ? 'today' : `in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`}`,
            type: 'bill',
            priority,
            read: false,
            data: { billId: bill.id, dueDate: bill.due_date, amount: bill.amount }
          });
        } else if (daysUntilDue < 0) {
          addNotification({
            title: 'Overdue Bill',
            message: `${bill.name} was due ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) > 1 ? 's' : ''} ago`,
            type: 'bill',
            priority: 'high',
            read: false,
            data: { billId: bill.id, dueDate: bill.due_date, amount: bill.amount, overdue: true }
          });
        }
      }
    });
  }, [bills, user, settings.billReminders, addNotification]);

  // Check for savings goal progress
  useEffect(() => {
    if (!user || !settings.goalUpdates || !savingsGoals.length) return;

    savingsGoals.forEach(goal => {
      const progress = (goal.current_amount / goal.target_amount) * 100;
      
      // Notify at 25%, 50%, 75%, and 100% milestones
      const milestones = [25, 50, 75, 100];
      milestones.forEach(milestone => {
        if (progress >= milestone && progress < milestone + 5) { // Small range to avoid duplicate notifications
          addNotification({
            title: 'Savings Milestone',
            message: `You've reached ${milestone}% of your ${goal.name} savings goal!`,
            type: 'goal',
            priority: milestone === 100 ? 'high' : 'low',
            read: false,
            data: { goalId: goal.id, progress, milestone, currentAmount: goal.current_amount }
          });
        }
      });
    });
  }, [savingsGoals, user, settings.goalUpdates, addNotification]);

  // Check for unusual spending patterns
  useEffect(() => {
    if (!user || !settings.spendingAlerts || !transactions.length) return;

    const lastThirtyDays = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentTransactions = transactions.filter(t => 
      new Date(t.date) >= lastThirtyDays && t.transaction_type === 'expense'
    );

    const dailySpending: Record<string, number> = {};
    recentTransactions.forEach(transaction => {
      const date = transaction.date;
      dailySpending[date] = (dailySpending[date] || 0) + transaction.amount;
    });

    const averageDailySpending = Object.values(dailySpending).reduce((sum, amount) => sum + amount, 0) / Object.keys(dailySpending).length;
    const today = new Date().toISOString().split('T')[0];
    const todaySpending = dailySpending[today] || 0;

    // Alert if today's spending is 200% above average
    if (todaySpending > averageDailySpending * 2 && averageDailySpending > 0) {
      addNotification({
        title: 'High Spending Alert',
        message: `Today's spending is significantly higher than your average daily spending`,
        type: 'spending',
        priority: 'medium',
        read: false,
        data: { todaySpending, averageDailySpending }
      });
    }
  }, [transactions, user, settings.spendingAlerts, addNotification]);
};