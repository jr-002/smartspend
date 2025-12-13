import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface DebtPayment {
  id: string;
  debt_id: string;
  user_id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
  created_at: string;
}

export interface NewDebtPayment {
  debt_id: string;
  amount: number;
  payment_date?: string;
  notes?: string;
}

export const useDebtPayments = (debtId?: string) => {
  const [payments, setPayments] = useState<DebtPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPayments = useCallback(async () => {
    if (!user) {
      setPayments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('debt_payments')
        .select('*')
        .eq('user_id', user.id)
        .order('payment_date', { ascending: false });

      if (debtId) {
        query = query.eq('debt_id', debtId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setPayments((data || []) as DebtPayment[]);
    } catch (err) {
      console.error('Error fetching debt payments:', err);
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [user, debtId]);

  const addPayment = async (newPayment: NewDebtPayment): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add payments.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('debt_payments')
        .insert({
          user_id: user.id,
          debt_id: newPayment.debt_id,
          amount: newPayment.amount,
          payment_date: newPayment.payment_date || new Date().toISOString().split('T')[0],
          notes: newPayment.notes || null,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setPayments(prev => [data as DebtPayment, ...prev]);
      toast({
        title: "Success",
        description: "Payment recorded successfully.",
      });
      return true;
    } catch (err) {
      console.error('Error adding payment:', err);
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deletePayment = async (id: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete payments.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error: deleteError } = await supabase
        .from('debt_payments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      setPayments(prev => prev.filter(payment => payment.id !== id));
      toast({
        title: "Success",
        description: "Payment deleted successfully.",
      });
      return true;
    } catch (err) {
      console.error('Error deleting payment:', err);
      toast({
        title: "Error",
        description: "Failed to delete payment. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getTotalPayments = (forDebtId?: string): number => {
    const filtered = forDebtId 
      ? payments.filter(p => p.debt_id === forDebtId)
      : payments;
    return filtered.reduce((sum, p) => sum + p.amount, 0);
  };

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    loading,
    error,
    addPayment,
    deletePayment,
    getTotalPayments,
    refetch: fetchPayments,
  };
};
