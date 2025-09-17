/*
  # Database Cleanup - Step 1
  
  This migration cleans up all existing conflicts before applying the main schema fix.
  
  1. Cleanup Tasks
     - Drop all existing triggers (all naming variations)
     - Drop all existing policies using dynamic SQL
     - Drop conflicting functions
  
  2. Safety Features
     - Uses IF EXISTS to prevent errors
     - Dynamic policy cleanup to catch all variations
     - Comprehensive trigger cleanup
*/

-- Step 1: Cleanup existing conflicts
-- Run this first, then run the main schema fix

-- Drop all existing triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
DROP TRIGGER IF EXISTS update_budgets_updated_at ON public.budgets;
DROP TRIGGER IF EXISTS update_savings_goals_updated_at ON public.savings_goals;
DROP TRIGGER IF EXISTS update_bills_updated_at ON public.bills;
DROP TRIGGER IF EXISTS update_debts_updated_at ON public.debts;
DROP TRIGGER IF EXISTS update_investments_updated_at ON public.investments;
DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;

-- Handle any other trigger naming variations
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS handle_updated_at ON public.transactions;
DROP TRIGGER IF EXISTS handle_updated_at ON public.budgets;
DROP TRIGGER IF EXISTS handle_updated_at ON public.savings_goals;
DROP TRIGGER IF EXISTS handle_updated_at ON public.bills;
DROP TRIGGER IF EXISTS handle_updated_at ON public.debts;
DROP TRIGGER IF EXISTS handle_updated_at ON public.investments;
DROP TRIGGER IF EXISTS handle_updated_at ON public.notifications;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop all existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname 
              FROM pg_policies 
              WHERE schemaname = 'public' 
              AND tablename IN ('profiles', 'transactions', 'budgets', 'savings_goals', 'bills', 'debts', 'investments', 'notifications'))
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Drop conflicting functions
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Cleanup completed. Now run the main schema fix migration.';
END $$;