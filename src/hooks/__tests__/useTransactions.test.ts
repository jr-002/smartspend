import { renderHook, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useTransactions } from '../useTransactions'
import { createMockTransaction } from '@/test/utils/test-utils'

// Mock the auth context
const mockUser = { id: 'user-1', email: 'test@example.com' }
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}))

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}))

// Mock Supabase client
const mockSupabaseResponse = {
  data: [createMockTransaction()],
  error: null,
}

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(mockSupabaseResponse),
    })),
  },
}))

describe('useTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch transactions on mount', async () => {
    const { result } = renderHook(() => useTransactions())

    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.transactions).toHaveLength(1)
    expect(result.current.error).toBeNull()
  })

  it('should handle add transaction', async () => {
    const { result } = renderHook(() => useTransactions())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const newTransaction = {
      description: 'New Transaction',
      amount: 200,
      category: 'Shopping',
      transaction_type: 'expense' as const,
      date: '2024-01-16',
    }

    const success = await result.current.addTransaction(newTransaction)
    expect(success).toBe(true)
  })

  it('should handle errors gracefully', async () => {
    // Mock error response
    vi.mocked(mockSupabaseResponse).error = new Error('Database error')

    const { result } = renderHook(() => useTransactions())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to load transactions')
  })
})