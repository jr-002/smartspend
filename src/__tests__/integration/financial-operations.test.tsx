import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TransactionHistory from '@/components/TransactionHistory';

// Mock hooks
vi.mock('@/hooks/useTransactions', () => ({
  useTransactions: () => ({
    transactions: [
      {
        id: '1',
        description: 'Test Transaction',
        amount: 100,
        category: 'Food',
        transaction_type: 'expense',
        date: '2025-01-15',
        created_at: '2025-01-15T10:00:00Z'
      }
    ],
    loading: false,
    addTransaction: vi.fn().mockResolvedValue(true),
    updateTransaction: vi.fn().mockResolvedValue(true),
    deleteTransaction: vi.fn().mockResolvedValue(true),
  })
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user' },
    profile: { currency: 'USD' }
  })
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  }),
  toast: vi.fn()
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Financial Operations Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays transaction history', () => {
    render(<TransactionHistory />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Transaction History')).toBeInTheDocument();
    expect(screen.getByText('Test Transaction')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
  });

  it('opens add transaction dialog', async () => {
    render(<TransactionHistory />, { wrapper: createWrapper() });
    
    const addButton = screen.getByRole('button', {
      name: /add transaction/i,
    });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Add Transaction')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Description')).toBeInTheDocument();
    });
  });

  it('filters transactions by type', async () => {
    render(<TransactionHistory />, { wrapper: createWrapper() });
    
    // Find and click the transaction type filter dropdown (first combobox)
    const filterComboboxes = screen.getAllByRole('combobox');
    const typeFilter = filterComboboxes[0]; // First one is the type filter
    fireEvent.click(typeFilter);
    
    // Wait for the dropdown to appear and select 'Income'
    await waitFor(() => {
      const incomeOption = screen.getByText('Income');
      expect(incomeOption).toBeInTheDocument();
      fireEvent.click(incomeOption);
    });

    // Verify that filtering works by checking the transaction type badge
    await waitFor(() => {
      const expenseBadge = screen.queryByText('Expense');
      expect(expenseBadge).not.toBeInTheDocument();
    });
  });
});