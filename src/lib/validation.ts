import { z } from "zod";

// Common validation schemas
export const currencyAmountSchema = z
  .number()
  .positive("Amount must be positive")
  .max(999999999, "Amount is too large")
  .refine((val) => Number.isFinite(val), "Amount must be a valid number");

export const categorySchema = z
  .string()
  .min(2, "Category must be at least 2 characters")
  .max(50, "Category must be less than 50 characters")
  .regex(/^[a-zA-Z0-9\s\-_]+$/, "Category contains invalid characters");

export const descriptionSchema = z
  .string()
  .min(2, "Description must be at least 2 characters")
  .max(200, "Description must be less than 200 characters")
  .trim();

// Transaction validation
export const transactionSchema = z.object({
  description: descriptionSchema,
  amount: currencyAmountSchema,
  category: categorySchema,
  transaction_type: z.enum(['income', 'expense']),
  date: z.date().max(new Date(), "Date cannot be in the future"),
});

export const newTransactionSchema = transactionSchema.extend({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

// Budget validation
export const budgetSchema = z.object({
  category: categorySchema,
  amount: currencyAmountSchema,
  period: z.enum(['monthly', 'yearly']),
});

// Savings goal validation
export const savingsGoalSchema = z.object({
  name: z
    .string()
    .min(2, "Goal name must be at least 2 characters")
    .max(100, "Goal name must be less than 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  target_amount: currencyAmountSchema,
  current_amount: z
    .number()
    .min(0, "Current amount cannot be negative")
    .optional()
    .default(0),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .optional()
    .refine((date) => {
      if (!date) return true;
      return new Date(date) > new Date();
    }, "Deadline must be in the future"),
});

// Bill validation
export const billSchema = z.object({
  name: z
    .string()
    .min(2, "Bill name must be at least 2 characters")
    .max(100, "Bill name must be less than 100 characters")
    .trim(),
  provider: z
    .string()
    .min(2, "Provider must be at least 2 characters")
    .max(100, "Provider must be less than 100 characters")
    .trim(),
  amount: currencyAmountSchema,
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  category: categorySchema,
  recurring: z.boolean().optional().default(true),
});

// Investment validation
export const investmentSchema = z.object({
  name: z
    .string()
    .min(2, "Investment name must be at least 2 characters")
    .max(100, "Investment name must be less than 100 characters")
    .trim(),
  type: z
    .string()
    .min(2, "Investment type must be at least 2 characters")
    .max(50, "Investment type must be less than 50 characters")
    .trim(),
  current_value: z
    .number()
    .min(0, "Current value cannot be negative"),
  initial_investment: currencyAmountSchema,
  purchase_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .optional(),
});

// Debt validation
export const debtSchema = z.object({
  name: z
    .string()
    .min(2, "Debt name must be at least 2 characters")
    .max(100, "Debt name must be less than 100 characters")
    .trim(),
  type: z
    .string()
    .min(2, "Debt type must be at least 2 characters")
    .max(50, "Debt type must be less than 50 characters")
    .trim(),
  balance: z
    .number()
    .min(0, "Balance cannot be negative"),
  original_amount: currencyAmountSchema,
  interest_rate: z
    .number()
    .min(0, "Interest rate cannot be negative")
    .max(100, "Interest rate cannot exceed 100%"),
  minimum_payment: currencyAmountSchema,
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
});

// Profile validation
export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  monthly_income: z
    .number()
    .min(0, "Monthly income cannot be negative")
    .optional(),
  currency: z
    .string()
    .length(3, "Currency code must be 3 characters")
    .regex(/^[A-Z]{3}$/, "Currency code must be uppercase letters"),
});

// Input sanitization utilities
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .slice(0, 1000); // Limit length
};

export const sanitizeNumber = (input: number): number => {
  if (!Number.isFinite(input) || Number.isNaN(input)) {
    return 0;
  }
  return Math.max(0, Math.min(input, 999999999)); // Clamp between 0 and reasonable max
};

// Validation error formatter
export const formatValidationErrors = (error: z.ZodError): string[] => {
  return error.errors.map((err) => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });
};