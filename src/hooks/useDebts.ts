
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Debt {
  id: string;
  name: string;
  type: string;
  balance: number;
  original_amount: number;
  interest_rate: number;
  minimum_payment: number;
  due_date: string;
  priority: 'high' | 'medium' | 'low';
  created_at?: string;
  updated_at?: string;
}

export interface NewDebt {
  name: string;
  type: string;
  balance: number;
  original_amount: number;
  interest_rate: number;
  minimum_payment: number;
  due_date: string;
  priority?: 'high' | 'medium' | 'low';
}

export const useDebts = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchDebts = async () => {
    if (!user) {
      setDebts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Add delay to prevent overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 350));

      const { data, error: fetchError } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setDebts((data || []) as Debt[]);
    } catch (err) {
      console.error('Error fetching debts:', err);
      setError('Failed to load debts');
      toast({
        title: "Error",
        description: "Failed to load debts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addDebt = async (newDebt: NewDebt): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add debts.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('debts')
        .insert({
          user_id: user.id,
          name: newDebt.name,
          type: newDebt.type,
          balance: newDebt.balance,
          original_amount: newDebt.original_amount,
          interest_rate: newDebt.interest_rate,
          minimum_payment: newDebt.minimum_payment,
          due_date: newDebt.due_date,
          priority: newDebt.priority || 'medium',
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setDebts(prev => [...prev, data as Debt]);
      toast({
        title: "Success",
        description: "Debt added successfully.",
      });
      return true;
    } catch (err) {
      console.error('Error adding debt:', err);
      toast({
        title: "Error",
        description: "Failed to add debt. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateDebtBalance = async (id: string, newBalance: number): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update debts.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error: updateError } = await supabase
        .from('debts')
        .update({ balance: Math.max(0, newBalance) })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setDebts(prev => 
        prev.map(debt => 
          debt.id === id ? { ...debt, ...(data as Debt) } : debt
        )
      );

      toast({
        title: "Success",
        description: "Debt balance updated successfully.",
      });
      return true;
    } catch (err) {
      console.error('Error updating debt:', err);
      toast({
        title: "Error",
        description: "Failed to update debt. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteDebt = async (id: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete debts.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error: deleteError } = await supabase
        .from('debts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      setDebts(prev => prev.filter(debt => debt.id !== id));
      toast({
        title: "Success",
        description: "Debt deleted successfully.",
      });
      return true;
    } catch (err) {
      console.error('Error deleting debt:', err);
      toast({
        title: "Error",
        description: "Failed to delete debt. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchDebts();
  }, [user, fetchDebts]);

  return {
    debts,
    loading,
    error,
    addDebt,
    updateDebtBalance,
    deleteDebt,
    refetch: fetchDebts,
  };
};
