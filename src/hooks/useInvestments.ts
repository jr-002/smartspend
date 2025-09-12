import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Investment {
  id: string;
  name: string;
  type: string;
  current_value: number;
  initial_investment: number;
  purchase_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface NewInvestment {
  name: string;
  type: string;
  current_value: number;
  initial_investment: number;
  purchase_date?: string;
}

export const useInvestments = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchInvestments = async () => {
    if (!user) {
      setInvestments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('purchase_date', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setInvestments((data || []) as Investment[]);
    } catch (err) {
      console.error('Error fetching investments:', err);
      setError('Failed to load investments');
      toast({
        title: "Error",
        description: "Failed to load investments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addInvestment = async (newInvestment: NewInvestment): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add investments.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          name: newInvestment.name,
          type: newInvestment.type,
          current_value: newInvestment.current_value,
          initial_investment: newInvestment.initial_investment,
          purchase_date: newInvestment.purchase_date || new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setInvestments(prev => [data as Investment, ...prev]);
      toast({
        title: "Success",
        description: "Investment added successfully.",
      });
      return true;
    } catch (err) {
      console.error('Error adding investment:', err);
      toast({
        title: "Error",
        description: "Failed to add investment. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateInvestmentValue = async (id: string, currentValue: number): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update investments.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error: updateError } = await supabase
        .from('investments')
        .update({ current_value: currentValue })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setInvestments(prev => 
        prev.map(investment => 
          investment.id === id 
            ? { ...investment, ...(data as Investment) }
            : investment
        )
      );

      toast({
        title: "Success",
        description: "Investment value updated successfully.",
      });
      return true;
    } catch (err) {
      console.error('Error updating investment:', err);
      toast({
        title: "Error",
        description: "Failed to update investment. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteInvestment = async (id: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete investments.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error: deleteError } = await supabase
        .from('investments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      setInvestments(prev => prev.filter(investment => investment.id !== id));
      toast({
        title: "Success",
        description: "Investment deleted successfully.",
      });
      return true;
    } catch (err) {
      console.error('Error deleting investment:', err);
      toast({
        title: "Error",
        description: "Failed to delete investment. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [user, fetchInvestments]);

  return {
    investments,
    loading,
    error,
    addInvestment,
    updateInvestmentValue,
    deleteInvestment,
    refetch: fetchInvestments,
  };
};