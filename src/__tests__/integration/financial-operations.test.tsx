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
    
    fireEvent.click(screen.getByText('Add Transaction'));
    
    await waitFor(() => {
      expect(screen.getByText('Add Transaction')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Description')).toBeInTheDocument();
    });
  });

  it('filters transactions by type', async () => {
    render(<TransactionHistory />, { wrapper: createWrapper() });
    
    // Find and click the filter dropdown
    const filterButton = screen.getByRole('combobox');
    fireEvent.click(filterButton);
    
    await waitFor(() => {
      expect(screen.getByText('Income')).toBeInTheDocument();
    });
  });
});