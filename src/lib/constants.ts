// Application constants and configuration

export const APP_CONFIG = {
  name: 'FinAssist SmartSpend',
  version: '1.0.0',
  description: 'Personal Finance Management Application',
  author: 'JR Digital Insights',
  
  // API Configuration
  api: {
    timeout: 10000, // 10 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
  
  // Rate Limiting
  rateLimits: {
    aiInsights: { requests: 5, windowMs: 60000 }, // 5 per minute
    budgetAI: { requests: 3, windowMs: 300000 }, // 3 per 5 minutes
    financialCoach: { requests: 10, windowMs: 60000 }, // 10 per minute
    riskPrediction: { requests: 2, windowMs: 300000 }, // 2 per 5 minutes
  },
  
  // UI Configuration
  ui: {
    animationDuration: 300,
    debounceDelay: 500,
    throttleDelay: 100,
    toastDuration: 5000,
  },
  
  // Data Limits
  limits: {
    maxTransactions: 10000,
    maxBudgets: 50,
    maxSavingsGoals: 20,
    maxBills: 100,
    maxInvestments: 100,
    maxDebts: 50,
    maxDescriptionLength: 200,
    maxCategoryLength: 50,
    maxAmount: 999999999,
  },
  
  // Default Values
  defaults: {
    currency: 'USD',
    budgetPeriod: 'monthly',
    transactionType: 'expense',
    savingsRate: 20, // 20%
    emergencyFundMonths: 6,
  },
  
  // Feature Flags
  features: {
    aiInsights: true,
    budgetAI: true,
    financialCoach: true,
    riskPrediction: true,
    gamification: true,
    communityTemplates: false, // Not implemented yet
    investmentTracking: true,
    debtManagement: true,
    billReminders: true,
    notifications: true,
  },
} as const;

// Common categories for transactions and budgets
export const TRANSACTION_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Groceries',
  'Gas',
  'Insurance',
  'Rent/Mortgage',
  'Salary',
  'Freelance',
  'Investment',
  'Gift',
  'Other',
] as const;

export const BILL_CATEGORIES = [
  'Utilities',
  'Internet',
  'Mobile',
  'Insurance',
  'Rent',
  'Mortgage',
  'Subscription',
  'Healthcare',
  'Education',
  'Other',
] as const;

export const INVESTMENT_TYPES = [
  'Stocks',
  'Bonds',
  'Mutual Funds',
  'ETFs',
  'Real Estate',
  'Cryptocurrency',
  'Commodities',
  'Savings Account',
  'Fixed Deposit',
  'Other',
] as const;

export const DEBT_TYPES = [
  'Credit Card',
  'Personal Loan',
  'Student Loan',
  'Mortgage',
  'Auto Loan',
  'Business Loan',
  'Other',
] as const;

// Error messages
export const ERROR_MESSAGES = {
  network: 'Network error. Please check your connection and try again.',
  authentication: 'Authentication required. Please sign in to continue.',
  validation: 'Please check your input and try again.',
  server: 'Server error. Please try again later.',
  notFound: 'The requested resource was not found.',
  rateLimit: 'Too many requests. Please wait before trying again.',
  generic: 'An unexpected error occurred. Please try again.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  transactionAdded: 'Transaction added successfully.',
  transactionUpdated: 'Transaction updated successfully.',
  transactionDeleted: 'Transaction deleted successfully.',
  budgetCreated: 'Budget created successfully.',
  budgetUpdated: 'Budget updated successfully.',
  budgetDeleted: 'Budget deleted successfully.',
  goalCreated: 'Savings goal created successfully.',
  goalUpdated: 'Savings goal updated successfully.',
  goalDeleted: 'Savings goal deleted successfully.',
  profileUpdated: 'Profile updated successfully.',
  signUpSuccess: 'Account created successfully. Please check your email for verification.',
  signInSuccess: 'Welcome back!',
} as const;