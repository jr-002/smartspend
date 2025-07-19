import { describe, it, expect } from 'vitest'
import { 
  transactionSchema, 
  budgetSchema, 
  sanitizeString, 
  sanitizeNumber,
  formatValidationErrors 
} from '../validation'
import { z } from 'zod'

describe('Validation schemas', () => {
  describe('transactionSchema', () => {
    it('validates correct transaction data', () => {
      const validTransaction = {
        description: 'Test transaction',
        amount: 100,
        category: 'Food',
        transaction_type: 'expense' as const,
        date: new Date('2024-01-15'),
      }

      expect(() => transactionSchema.parse(validTransaction)).not.toThrow()
    })

    it('rejects invalid transaction data', () => {
      const invalidTransaction = {
        description: 'A', // Too short
        amount: -100, // Negative
        category: 'Food',
        transaction_type: 'invalid' as any,
        date: new Date('2025-01-15'), // Future date
      }

      expect(() => transactionSchema.parse(invalidTransaction)).toThrow()
    })
  })

  describe('budgetSchema', () => {
    it('validates correct budget data', () => {
      const validBudget = {
        category: 'Food',
        amount: 500,
        period: 'monthly' as const,
      }

      expect(() => budgetSchema.parse(validBudget)).not.toThrow()
    })

    it('rejects weekly period (not supported)', () => {
      const invalidBudget = {
        category: 'Food',
        amount: 500,
        period: 'weekly' as any,
      }

      expect(() => budgetSchema.parse(invalidBudget)).toThrow()
    })
  })
})

describe('Sanitization utilities', () => {
  describe('sanitizeString', () => {
    it('removes HTML tags', () => {
      expect(sanitizeString('<script>alert("xss")</script>test')).toBe('alert("xss")test')
    })

    it('removes javascript protocols', () => {
      expect(sanitizeString('javascript:alert("xss")')).toBe('alert("xss")')
    })

    it('trims whitespace', () => {
      expect(sanitizeString('  test  ')).toBe('test')
    })

    it('limits length', () => {
      const longString = 'a'.repeat(2000)
      expect(sanitizeString(longString)).toHaveLength(1000)
    })
  })

  describe('sanitizeNumber', () => {
    it('handles valid numbers', () => {
      expect(sanitizeNumber(123.45)).toBe(123.45)
    })

    it('handles invalid numbers', () => {
      expect(sanitizeNumber(NaN)).toBe(0)
      expect(sanitizeNumber(Infinity)).toBe(0)
    })

    it('clamps to reasonable range', () => {
      expect(sanitizeNumber(-100)).toBe(0)
      expect(sanitizeNumber(1000000000)).toBe(999999999)
    })
  })
})

describe('formatValidationErrors', () => {
  it('formats Zod errors correctly', () => {
    try {
      transactionSchema.parse({
        description: 'A',
        amount: -100,
        category: '',
        transaction_type: 'invalid',
        date: new Date('2025-01-15'),
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formatted = formatValidationErrors(error)
        expect(formatted).toBeInstanceOf(Array)
        expect(formatted.length).toBeGreaterThan(0)
        expect(formatted[0]).toContain(':')
      }
    }
  })
})