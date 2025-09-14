
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  transaction_type: "income" | "expense";
  created_at?: string;
}

export interface NewTransaction {
  description: string;
  amount: number;
  category: string;
  transaction_type: "income" | "expense";
  date: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(100);

      if (fetchError) {
        throw fetchError;
      }

      // Ensure we always have an array and validate data structure
      const validatedData: Transaction[] = Array.isArray(data) ? data
        .filter(item => item && typeof item === 'object')
        .map(item => ({
          id: item.id || '',
          description: item.description || '',
          amount: Number(item.amount) || 0,
          category: item.category || 'Other',
          date: item.date || new Date().toISOString().split('T')[0],
          transaction_type: (item.transaction_type === 'income' || item.transaction_type === 'expense') 
            ? item.transaction_type 
            : 'expense',
          created_at: item.created_at,
        })) : [];

      setTransactions(validatedData);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions');
      setTransactions([]); // Set empty array on error
      toast({
        title: "Error",
        description: "Failed to load transactions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addTransaction = async (newTransaction: NewTransaction): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add transactions.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          description: newTransaction.description,
          amount: newTransaction.amount,
          category: newTransaction.category,
          transaction_type: newTransaction.transaction_type,
          date: newTransaction.date,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Transform the returned data to ensure proper typing
      const transformedTransaction: Transaction = {
        id: data.id,
        description: data.description,
        amount: data.amount,
        category: data.category,
        date: data.date,
        transaction_type: data.transaction_type as "income" | "expense",
        created_at: data.created_at,
      };

      setTransactions(prev => [transformedTransaction, ...prev]);
      toast({
        title: "Success",
        description: "Transaction added successfully.",
      });
      return true;
    } catch (err) {
      console.error('Error adding transaction:', err);
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<NewTransaction>): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update transactions.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error: updateError } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Transform the returned data to ensure proper typing
      const transformedTransaction: Transaction = {
        id: data.id,
        description: data.description,
        amount: data.amount,
        category: data.category,
        date: data.date,
        transaction_type: data.transaction_type as "income" | "expense",
        created_at: data.created_at,
      };

      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === id ? { ...transaction, ...transformedTransaction } : transaction
        )
      );

      toast({
        title: "Success",
        description: "Transaction updated successfully.",
      });
      return true;
    } catch (err) {
      console.error('Error updating transaction:', err);
      toast({
        title: "Error",
        description: "Failed to update transaction. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteTransaction = async (id: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete transactions.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
      toast({
        title: "Success",
        description: "Transaction deleted successfully.",
      });
      return true;
    } catch (err) {
      console.error('Error deleting transaction:', err);
      toast({
        title: "Error",
        description: "Failed to delete transaction. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  };
};
