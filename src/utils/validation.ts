// Input validation utilities
import { z } from 'zod';

// Sanitization functions
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  
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

export const sanitizeAmount = (input: number): number => {
  const sanitized = sanitizeNumber(input);
  // Round to 2 decimal places for currency
  return Math.round(sanitized * 100) / 100;
};

// Validation schemas
export const emailSchema = z
  .string()
  .email("Invalid email format")
  .min(5, "Email must be at least 5 characters")
  .max(254, "Email must be less than 254 characters");

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(128, "Password must be less than 128 characters")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number");

export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be less than 100 characters")
  .regex(/^[a-zA-Z\s\-'\.]+$/, "Name contains invalid characters");

export const currencyCodeSchema = z
  .string()
  .length(3, "Currency code must be exactly 3 characters")
  .regex(/^[A-Z]{3}$/, "Currency code must be uppercase letters");

export const amountSchema = z
  .number()
  .positive("Amount must be positive")
  .max(999999999, "Amount is too large")
  .refine((val) => Number.isFinite(val), "Amount must be a valid number");

export const categorySchema = z
  .string()
  .min(2, "Category must be at least 2 characters")
  .max(50, "Category must be less than 50 characters")
  .regex(/^[a-zA-Z0-9\s\-_&]+$/, "Category contains invalid characters");

export const descriptionSchema = z
  .string()
  .min(2, "Description must be at least 2 characters")
  .max(200, "Description must be less than 200 characters");

// Form validation schemas
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  name: nameSchema,
  currency: currencyCodeSchema,
  monthlyIncome: z.number().min(0).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const transactionSchema = z.object({
  description: descriptionSchema,
  amount: amountSchema,
  category: categorySchema,
  transaction_type: z.enum(['income', 'expense']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

export const budgetSchema = z.object({
  category: categorySchema,
  amount: amountSchema,
  period: z.enum(['weekly', 'monthly', 'yearly']),
});

export const savingsGoalSchema = z.object({
  name: z.string().min(2, "Goal name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
  target_amount: amountSchema,
  current_amount: z.number().min(0).optional().default(0),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
});

export const billSchema = z.object({
  name: z.string().min(2, "Bill name must be at least 2 characters").max(100),
  provider: z.string().min(2, "Provider must be at least 2 characters").max(100),
  amount: amountSchema,
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  category: categorySchema,
  recurring: z.boolean().optional().default(true),
});

// Validation helper functions
export const validateAndSanitizeTransaction = (data: any) => {
  const sanitized = {
    description: sanitizeString(data.description),
    amount: sanitizeAmount(data.amount),
    category: sanitizeString(data.category),
    transaction_type: data.transaction_type,
    date: data.date,
  };
  
  return transactionSchema.parse(sanitized);
};

export const validateAndSanitizeBudget = (data: any) => {
  const sanitized = {
    category: sanitizeString(data.category),
    amount: sanitizeAmount(data.amount),
    period: data.period,
  };
  
  return budgetSchema.parse(sanitized);
};

export const formatValidationErrors = (error: z.ZodError): string[] => {
  return error.issues.map((err) => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });
};