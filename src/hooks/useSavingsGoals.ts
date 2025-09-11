import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface SavingsGoal {
  id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  created_at?: string;
  updated_at?: string;
}

export interface NewSavingsGoal {
  name: string;
  description?: string;
  target_amount: number;
  current_amount?: number;
  deadline?: string;
}

export const useSavingsGoals = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchGoals = async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('deadline', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setGoals(data || []);
    } catch (err) {
      console.error('Error fetching savings goals:', err);
      setError('Failed to load savings goals');
      toast({
        title: "Error",
        description: "Failed to load savings goals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (newGoal: NewSavingsGoal): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add savings goals.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('savings_goals')
        .insert({
          user_id: user.id,
          name: newGoal.name,
          description: newGoal.description,
          target_amount: newGoal.target_amount,
          current_amount: newGoal.current_amount || 0,
          deadline: newGoal.deadline || null,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setGoals(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Savings goal created successfully.",
      });
      return true;
    } catch (err) {
      console.error('Error adding savings goal:', err);
      toast({
        title: "Error",
        description: "Failed to create savings goal. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateGoalProgress = async (id: string, amount: number): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update savings goals.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const goal = goals.find(g => g.id === id);
      if (!goal) {
        throw new Error('Goal not found');
      }

      const newAmount = Math.max(0, goal.current_amount + amount);

      const { data, error: updateError } = await supabase
        .from('savings_goals')
        .update({ current_amount: newAmount })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setGoals(prev => 
        prev.map(goal => 
          goal.id === id ? { ...goal, ...data } : goal
        )
      );

      toast({
        title: "Success",
        description: "Savings goal updated successfully.",
      });
      return true;
    } catch (err) {
      console.error('Error updating savings goal:', err);
      toast({
        title: "Error",
        description: "Failed to update savings goal. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteGoal = async (id: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete savings goals.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error: deleteError } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      setGoals(prev => prev.filter(goal => goal.id !== id));
      toast({
        title: "Success",
        description: "Savings goal deleted successfully.",
      });
      return true;
    } catch (err) {
      console.error('Error deleting savings goal:', err);
      toast({
        title: "Error",
        description: "Failed to delete savings goal. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user, fetchGoals]);

  return {
    goals,
    loading,
    error,
    addGoal,
    updateGoalProgress,
    deleteGoal,
    refetch: fetchGoals,
  };
};