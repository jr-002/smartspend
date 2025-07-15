import { supabase } from './supabase'
import type { Database } from '../types/supabase'

// Types
type Profile = Database['public']['Tables']['profiles']['Row']
type Transaction = Database['public']['Tables']['transactions']['Row']
type Budget = Database['public']['Tables']['budgets']['Row']
type SavingsGoal = Database['public']['Tables']['savings_goals']['Row']
type Bill = Database['public']['Tables']['bills']['Row']
type Debt = Database['public']['Tables']['debts']['Row']
type Investment = Database['public']['Tables']['investments']['Row']

// Profile functions
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Transaction functions
export async function getTransactions(userId: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  
  if (error) throw error
  return data
}

export async function addTransaction(userId: string, transaction: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) {
  const { data, error } = await supabase
    .from('transactions')
    .insert({ ...transaction, user_id: userId })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Budget functions
export async function getBudgets(userId: string) {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
  
  if (error) throw error
  return data
}

export async function updateBudget(userId: string, budgetId: string, updates: Partial<Budget>) {
  const { data, error } = await supabase
    .from('budgets')
    .update(updates)
    .eq('id', budgetId)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Savings goals functions
export async function getSavingsGoals(userId: string) {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', userId)
  
  if (error) throw error
  return data
}

export async function updateSavingsGoal(userId: string, goalId: string, updates: Partial<SavingsGoal>) {
  const { data, error } = await supabase
    .from('savings_goals')
    .update(updates)
    .eq('id', goalId)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Bills functions
export async function getBills(userId: string) {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true })
  
  if (error) throw error
  return data
}

export async function updateBill(userId: string, billId: string, updates: Partial<Bill>) {
  const { data, error } = await supabase
    .from('bills')
    .update(updates)
    .eq('id', billId)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Debts functions
export async function getDebts(userId: string) {
  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('user_id', userId)
  
  if (error) throw error
  return data
}

export async function updateDebt(userId: string, debtId: string, updates: Partial<Debt>) {
  const { data, error } = await supabase
    .from('debts')
    .update(updates)
    .eq('id', debtId)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Investments functions
export async function getInvestments(userId: string) {
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('user_id', userId)
  
  if (error) throw error
  return data
}

export async function updateInvestment(userId: string, investmentId: string, updates: Partial<Investment>) {
  const { data, error } = await supabase
    .from('investments')
    .update(updates)
    .eq('id', investmentId)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}
