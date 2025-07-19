import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/hooks/useTheme'
import { TooltipProvider } from '@/components/ui/tooltip'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light" storageKey="test-theme">
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock data factories
export const createMockTransaction = (overrides = {}) => ({
  id: '1',
  description: 'Test Transaction',
  amount: 100,
  category: 'Food',
  date: '2024-01-15',
  transaction_type: 'expense' as const,
  created_at: '2024-01-15T10:00:00Z',
  ...overrides,
})

export const createMockBudget = (overrides = {}) => ({
  id: '1',
  category: 'Food',
  amount: 500,
  period: 'monthly' as const,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockSavingsGoal = (overrides = {}) => ({
  id: '1',
  name: 'Emergency Fund',
  description: 'Save for emergencies',
  target_amount: 10000,
  current_amount: 2500,
  deadline: '2024-12-31',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockProfile = (overrides = {}) => ({
  id: 'user-1',
  name: 'Test User',
  monthly_income: 5000,
  currency: 'USD',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})