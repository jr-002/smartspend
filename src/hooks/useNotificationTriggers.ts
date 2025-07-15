import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from './useNotifications';

export const useNotificationTriggers = () => {
  const { user } = useAuth();
  const { createNotification } = useNotifications();

  // Check for budget alerts
  const checkBudgetAlerts = async () => {
    if (!user) return;

    try {
      // Get current month transactions and budgets
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      const [transactionsResult, budgetsResult] = await Promise.all([
        supabase
          .from('transactions')
          .select('category, amount')
          .eq('user_id', user.id)
          .eq('transaction_type', 'expense')
          .gte('date', `${currentMonth}-01`)
          .lt('date', `${currentMonth}-32`),
        
        supabase
          .from('budgets')
          .select('*')
          .eq('user_id', user.id)
      ]);

      if (transactionsResult.error || budgetsResult.error) return;

      const transactions = transactionsResult.data || [];
      const budgets = budgetsResult.data || [];

      // Calculate spending by category
      const categorySpending = transactions.reduce((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>);

      // Check each budget for alerts
      for (const budget of budgets) {
        const spent = categorySpending[budget.category] || 0;
        const percentage = (spent / budget.amount) * 100;

        // Create notification if spending exceeds 90% or 100% of budget
        if (percentage >= 90) {
          const existingNotifications = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', user.id)
            .eq('type', 'budget')
            .gte('created_at', `${currentMonth}-01`)
            .like('title', `%${budget.category}%`);

          // Only create notification if one doesn't already exist for this month
          if (!existingNotifications.data?.length) {
            await createNotification(
              `Budget Alert: ${budget.category}`,
              `You've spent ${spent.toLocaleString()} out of ${budget.amount.toLocaleString()} (${percentage.toFixed(1)}%) in your ${budget.category} budget.`,
              'budget',
              percentage >= 100 ? 'high' : 'medium',
              {
                category: budget.category,
                spent,
                budget: budget.amount,
                percentage
              }
            );
          }
        }
      }
    } catch (error) {
      console.error('Error checking budget alerts:', error);
    }
  };

  // Check for bill due alerts
  const checkBillAlerts = async () => {
    if (!user) return;

    try {
      const today = new Date();
      const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

      const { data: bills, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .gte('due_date', today.toISOString().split('T')[0])
        .lte('due_date', threeDaysFromNow.toISOString().split('T')[0]);

      if (error || !bills) return;

      for (const bill of bills) {
        const dueDate = new Date(bill.due_date);
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Check if notification already exists for this bill
        const existingNotifications = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('type', 'bill')
          .gte('created_at', today.toISOString().split('T')[0])
          .like('title', `%${bill.name}%`);

        if (!existingNotifications.data?.length) {
          await createNotification(
            `Bill Due: ${bill.name}`,
            `Your ${bill.name} bill of ${bill.amount.toLocaleString()} is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}.`,
            'bill',
            daysUntilDue <= 1 ? 'high' : 'medium',
            {
              bill_name: bill.name,
              amount: bill.amount,
              due_date: bill.due_date,
              days_until_due: daysUntilDue
            }
          );
        }
      }
    } catch (error) {
      console.error('Error checking bill alerts:', error);
    }
  };

  // Check for goal achievements
  const checkGoalAlerts = async () => {
    if (!user) return;

    try {
      const { data: goals, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id);

      if (error || !goals) return;

      for (const goal of goals) {
        const percentage = (goal.current_amount / goal.target_amount) * 100;

        // Check for goal completion or milestone achievements
        if (percentage >= 100) {
          // Check if completion notification already exists
          const existingNotifications = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', user.id)
            .eq('type', 'goal')
            .like('title', `Goal Achieved: ${goal.name}`);

          if (!existingNotifications.data?.length) {
            await createNotification(
              `Goal Achieved: ${goal.name}`,
              `Congratulations! You've reached your ${goal.name} goal of ${goal.target_amount.toLocaleString()}!`,
              'goal',
              'high',
              {
                goal_name: goal.name,
                current_amount: goal.current_amount,
                target_amount: goal.target_amount,
                percentage,
                achievement_type: 'completed'
              }
            );
          }
        } else if (percentage >= 75 && percentage < 100) {
          // Check for milestone notification
          const today = new Date().toISOString().split('T')[0];
          const existingNotifications = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', user.id)
            .eq('type', 'goal')
            .gte('created_at', today)
            .like('title', `Goal Progress: ${goal.name}`);

          if (!existingNotifications.data?.length) {
            await createNotification(
              `Goal Progress: ${goal.name}`,
              `Great progress! You're ${percentage.toFixed(1)}% of the way to your ${goal.name} goal.`,
              'goal',
              'medium',
              {
                goal_name: goal.name,
                current_amount: goal.current_amount,
                target_amount: goal.target_amount,
                percentage,
                achievement_type: 'milestone'
              }
            );
          }
        }
      }
    } catch (error) {
      console.error('Error checking goal alerts:', error);
    }
  };

  // Run checks periodically
  useEffect(() => {
    if (!user) return;

    // Initial check
    checkBudgetAlerts();
    checkBillAlerts();
    checkGoalAlerts();

    // Set up periodic checks (every 30 minutes)
    const interval = setInterval(() => {
      checkBudgetAlerts();
      checkBillAlerts();
      checkGoalAlerts();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  return {
    checkBudgetAlerts,
    checkBillAlerts,
    checkGoalAlerts,
  };
};