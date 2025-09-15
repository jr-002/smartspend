import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTransactions } from '@/hooks/useTransactions';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              then: vi.fn()
            }))
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn()
      }))
    }))
  }
}));

// Mock auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
    profile: { currency: 'USD' }
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
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
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('useTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty transactions array', () => {
    const { result } = renderHook(() => useTransactions(), {
      wrapper: createWrapper()
    });

    expect(result.current.transactions).toEqual([]);
    expect(result.current.loading).toBe(true);
  });

  it('provides transaction management functions', () => {
    const { result } = renderHook(() => useTransactions(), {
      wrapper: createWrapper()
    });

    expect(typeof result.current.addTransaction).toBe('function');
    expect(typeof result.current.updateTransaction).toBe('function');
    expect(typeof result.current.deleteTransaction).toBe('function');
    expect(typeof result.current.refetch).toBe('function');
  });
});