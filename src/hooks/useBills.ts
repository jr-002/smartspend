
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Bill {
  id: string;
  name: string;
  provider: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
  category: string;
  recurring: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface NewBill {
  name: string;
  provider: string;
  amount: number;
  due_date: string;
  category: string;
  recurring?: boolean;
}

export const useBills = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchBills = useCallback(async () => {
    if (!user) {
      setBills([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setBills((data || []) as Bill[]);
    } catch (err) {
      console.error('Error fetching bills:', err);
      
      // Provide more specific error messages
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        console.error('Network error: Unable to connect to Supabase. Please check:');
        console.error('1. Your internet connection');
        console.error('2. Supabase project URL and API key');
        console.error('3. CORS settings in your Supabase project');
      }
      
      setError('Failed to load bills');
      toast({
        title: "Error",
        description: "Failed to load bills. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addBill = async (newBill: NewBill): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add bills.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('bills')
        .insert({
          user_id: user.id,
          name: newBill.name,
          provider: newBill.provider,
          amount: newBill.amount,
          due_date: newBill.due_date,
          category: newBill.category,
          recurring: newBill.recurring ?? true,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setBills(prev => [...prev, data as Bill]);
      toast({
        title: "Success",
        description: "Bill added successfully.",
      });
      return true;
    } catch (err) {
      console.error('Error adding bill:', err);
      toast({
        title: "Error",
        description: "Failed to add bill. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateBillStatus = async (id: string, status: 'paid' | 'pending' | 'overdue'): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update bills.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error: updateError } = await supabase
        .from('bills')
        .update({ status })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setBills(prev => 
        prev.map(bill => 
          bill.id === id ? { ...bill, ...(data as Bill) } : bill
        )
      );

      toast({
        title: "Success",
        description: `Bill marked as ${status}.`,
      });
      return true;
    } catch (err) {
      console.error('Error updating bill:', err);
      toast({
        title: "Error",
        description: "Failed to update bill. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteBill = async (id: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete bills.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error: deleteError } = await supabase
        .from('bills')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      setBills(prev => prev.filter(bill => bill.id !== id));
      toast({
        title: "Success",
        description: "Bill deleted successfully.",
      });
      return true;
    } catch (err) {
      console.error('Error deleting bill:', err);
      toast({
        title: "Error",
        description: "Failed to delete bill. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchBills();
    }
  }, [user, fetchBills]);

  return {
    bills,
    loading,
    error,
    addBill,
    updateBillStatus,
    deleteBill,
    refetch: fetchBills,
  };
};
