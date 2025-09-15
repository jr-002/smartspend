import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/hooks/useTheme';
import WelcomeScreen from '@/components/WelcomeScreen';

// Mock Supabase
const mockSignUp = vi.fn();
const mockSignIn = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    loading: false,
    signUp: mockSignUp,
    signIn: mockSignIn,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children
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
      <ThemeProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders welcome screen with sign up option', () => {
    render(<WelcomeScreen />, { wrapper: createWrapper() });
    
    expect(screen.getByText('SmartSpend')).toBeInTheDocument();
    expect(screen.getByText('Get Started Free')).toBeInTheDocument();
  });

  it('navigates through sign up flow', async () => {
    render(<WelcomeScreen />, { wrapper: createWrapper() });
    
    // Click get started
    fireEvent.click(screen.getByText('Get Started Free'));
    
    await waitFor(() => {
      expect(screen.getByText('Create your account')).toBeInTheDocument();
    });
  });

  it('validates email input', async () => {
    render(<WelcomeScreen />, { wrapper: createWrapper() });
    
    fireEvent.click(screen.getByText('Get Started Free'));
    
    await waitFor(() => {
      const emailInput = screen.getByPlaceholderText('you@example.com');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);
    });

    await waitFor(() => {
      expect(screen.getByText(/Invalid email format/)).toBeInTheDocument();
    });
  });

  it('validates password requirements', async () => {
    render(<WelcomeScreen />, { wrapper: createWrapper() });
    
    fireEvent.click(screen.getByText('Get Started Free'));
    
    await waitFor(() => {
      const passwordInput = screen.getByPlaceholderText('Create a secure password');
      fireEvent.change(passwordInput, { target: { value: 'weak' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Password requirements:')).toBeInTheDocument();
    });
  });
});