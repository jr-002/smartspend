
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  created_at?: string;
  updated_at?: string;
}

export interface NewBudget {
  category: string;
  amount: number;
  period?: 'weekly' | 'monthly' | 'yearly';
}

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchBudgets = async () => {
    if (!user) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('category', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setBudgets(data || []);
    } catch (err) {
      console.error('Error fetching budgets:', err);
      setError('Failed to load budgets');
      toast({
        title: "Error",
        description: "Failed to load budgets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addBudget = async (newBudget: NewBudget): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add budgets.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          category: newBudget.category,
          amount: newBudget.amount,
          period: newBudget.period || 'monthly',
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setBudgets(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Budget added successfully.",
      });
      return true;
    } catch (err) {
      console.error('Error adding budget:', err);
      toast({
        title: "Error",
        description: "Failed to add budget. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateBudget = async (id: string, updates: Partial<NewBudget>): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update budgets.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error: updateError } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setBudgets(prev => 
        prev.map(budget => 
          budget.id === id ? { ...budget, ...data } : budget
        )
      );

      toast({
        title: "Success",
        description: "Budget updated successfully.",
      });
      return true;
    } catch (err) {
      console.error('Error updating budget:', err);
      toast({
        title: "Error",
        description: "Failed to update budget. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteBudget = async (id: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete budgets.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error: deleteError } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      setBudgets(prev => prev.filter(budget => budget.id !== id));
      toast({
        title: "Success",
        description: "Budget deleted successfully.",
      });
      return true;
    } catch (err) {
      console.error('Error deleting budget:', err);
      toast({
        title: "Error",
        description: "Failed to delete budget. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [user]);

  return {
    budgets,
    loading,
    error,
    addBudget,
    updateBudget,
    deleteBudget,
    refetch: fetchBudgets,
  };
};
