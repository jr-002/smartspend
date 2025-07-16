import { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Since investments table doesn't exist, we'll use mock data for now
  const fetchInvestments = async () => {
    if (!user) {
      setInvestments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Mock data for investments until table is created
      const mockInvestments: Investment[] = [
        {
          id: '1',
          name: 'S&P 500 Index Fund',
          type: 'Index Fund',
          current_value: 10500,
          initial_investment: 10000,
          purchase_date: '2024-01-15',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Tesla Stock',
          type: 'Stock',
          current_value: 2800,
          initial_investment: 3000,
          purchase_date: '2024-02-01',
          created_at: '2024-02-01T10:00:00Z',
          updated_at: '2024-02-01T10:00:00Z'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setInvestments(mockInvestments);
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
      // Mock adding investment
      const mockInvestment: Investment = {
        id: Date.now().toString(),
        name: newInvestment.name,
        type: newInvestment.type,
        current_value: newInvestment.current_value,
        initial_investment: newInvestment.initial_investment,
        purchase_date: newInvestment.purchase_date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setInvestments(prev => [mockInvestment, ...prev]);
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
      setInvestments(prev => 
        prev.map(investment => 
          investment.id === id 
            ? { ...investment, current_value: currentValue, updated_at: new Date().toISOString() }
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
  }, [user]);

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