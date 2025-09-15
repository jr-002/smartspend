import { describe, it, expect } from 'vitest';
import { 
  sanitizeString, 
  sanitizeNumber, 
  sanitizeAmount,
  emailSchema,
  passwordSchema,
  nameSchema,
  currencyCodeSchema,
  transactionSchema
} from '@/utils/validation';

describe('Validation Utils', () => {
  describe('sanitizeString', () => {
    it('removes HTML tags', () => {
      expect(sanitizeString('<script>alert("xss")</script>Hello')).toBe('Hello');
    });

    it('removes javascript protocols', () => {
      expect(sanitizeString('javascript:alert("xss")')).toBe('alert("xss")');
    });

    it('trims whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('limits length', () => {
      const longString = 'a'.repeat(2000);
      expect(sanitizeString(longString).length).toBeLessThanOrEqual(1000);
    });
  });

  describe('sanitizeNumber', () => {
    it('handles valid numbers', () => {
      expect(sanitizeNumber(123.45)).toBe(123.45);
    });

    it('handles invalid numbers', () => {
      expect(sanitizeNumber(NaN)).toBe(0);
      expect(sanitizeNumber(Infinity)).toBe(0);
    });

    it('clamps large numbers', () => {
      expect(sanitizeNumber(1000000000)).toBe(999999999);
    });

    it('ensures non-negative', () => {
      expect(sanitizeNumber(-100)).toBe(0);
    });
  });

  describe('sanitizeAmount', () => {
    it('rounds to 2 decimal places', () => {
      expect(sanitizeAmount(123.456)).toBe(123.46);
    });
  });

  describe('validation schemas', () => {
    it('validates email correctly', () => {
      expect(emailSchema.safeParse('test@example.com').success).toBe(true);
      expect(emailSchema.safeParse('invalid-email').success).toBe(false);
    });

    it('validates password correctly', () => {
      expect(passwordSchema.safeParse('Password123!').success).toBe(true);
      expect(passwordSchema.safeParse('weak').success).toBe(false);
    });

    it('validates name correctly', () => {
      expect(nameSchema.safeParse('John Doe').success).toBe(true);
      expect(nameSchema.safeParse('J').success).toBe(false);
      expect(nameSchema.safeParse('John123').success).toBe(false);
    });

    it('validates currency code correctly', () => {
      expect(currencyCodeSchema.safeParse('USD').success).toBe(true);
      expect(currencyCodeSchema.safeParse('usd').success).toBe(false);
      expect(currencyCodeSchema.safeParse('USDD').success).toBe(false);
    });

    it('validates transaction correctly', () => {
      const validTransaction = {
        description: 'Test transaction',
        amount: 100,
        category: 'Food',
        transaction_type: 'expense' as const,
        date: '2025-01-15'
      };
      expect(transactionSchema.safeParse(validTransaction).success).toBe(true);
    });
  });
});