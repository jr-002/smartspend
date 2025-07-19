import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import TransactionHistory from '../TransactionHistory'
import { createMockTransaction, createMockProfile } from '@/test/utils/test-utils'

// Mock the hooks
vi.mock('@/hooks/useTransactions', () => ({
  useTransactions: () => ({
    transactions: [
      createMockTransaction({ id: '1', description: 'Grocery Shopping', amount: 50 }),
      createMockTransaction({ id: '2', description: 'Salary', amount: 3000, transaction_type: 'income' }),
    ],
    loading: false,
    error: null,
    addTransaction: vi.fn().mockResolvedValue(true),
    updateTransaction: vi.fn().mockResolvedValue(true),
    deleteTransaction: vi.fn().mockResolvedValue(true),
    refetch: vi.fn(),
  }),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
    profile: createMockProfile(),
  }),
}))

describe('TransactionHistory', () => {
  it('renders transaction list correctly', () => {
    render(<TransactionHistory />)
    
    expect(screen.getByText('Transaction History')).toBeInTheDocument()
    expect(screen.getByText('Grocery Shopping')).toBeInTheDocument()
    expect(screen.getByText('Salary')).toBeInTheDocument()
  })

  it('opens add transaction dialog when button is clicked', async () => {
    render(<TransactionHistory />)
    
    const addButton = screen.getByText('Add Transaction')
    fireEvent.click(addButton)
    
    await waitFor(() => {
      expect(screen.getByText('Add Transaction')).toBeInTheDocument()
    })
  })

  it('filters transactions by search term', async () => {
    render(<TransactionHistory />)
    
    const searchInput = screen.getByPlaceholderText('Search transactions...')
    fireEvent.change(searchInput, { target: { value: 'Grocery' } })
    
    await waitFor(() => {
      expect(screen.getByText('Grocery Shopping')).toBeInTheDocument()
      expect(screen.queryByText('Salary')).not.toBeInTheDocument()
    })
  })

  it('displays correct total income and expenses', () => {
    render(<TransactionHistory />)
    
    expect(screen.getByText(/Total Income:/)).toBeInTheDocument()
    expect(screen.getByText(/Total Expenses:/)).toBeInTheDocument()
  })
})