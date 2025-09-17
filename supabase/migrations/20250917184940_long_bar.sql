/*
  # Fix Duplicate RLS Policies

  1. Problem
    - Multiple policies with similar names exist (e.g., "Users can read own profile" vs "Users can view their own profile")
    - This creates confusion and potential security gaps
    - Some policies may have inconsistent conditions

  2. Solution
    - Drop all existing policies safely using IF EXISTS
    - Create standardized policies with consistent naming
    - Ensure all CRUD operations are properly covered
    - Maintain security with proper auth.uid() checks

  3. Security
    - All policies use auth.uid() for user identification
    - RLS remains enabled throughout the process
    - Policies cover SELECT, INSERT, UPDATE, DELETE operations
*/

-- Profiles table policy cleanup
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create standardized policies for profiles
CREATE POLICY "profiles_select_own" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Bills table policy cleanup
DROP POLICY IF EXISTS "Users can create their own bills" ON bills;
DROP POLICY IF EXISTS "Users can insert own bills" ON bills;
DROP POLICY IF EXISTS "Users can read own bills" ON bills;
DROP POLICY IF EXISTS "Users can view their own bills" ON bills;
DROP POLICY IF EXISTS "Users can update own bills" ON bills;
DROP POLICY IF EXISTS "Users can update their own bills" ON bills;
DROP POLICY IF EXISTS "Users can delete own bills" ON bills;
DROP POLICY IF EXISTS "Users can delete their own bills" ON bills;

-- Create standardized policies for bills
CREATE POLICY "bills_select_own" ON bills
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "bills_insert_own" ON bills
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bills_update_own" ON bills
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bills_delete_own" ON bills
FOR DELETE USING (auth.uid() = user_id);

-- Transactions table policy cleanup
DROP POLICY IF EXISTS "Users can create their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can read own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;

-- Create standardized policies for transactions
CREATE POLICY "transactions_select_own" ON transactions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert_own" ON transactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_update_own" ON transactions
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_delete_own" ON transactions
FOR DELETE USING (auth.uid() = user_id);

-- Budgets table policy cleanup
DROP POLICY IF EXISTS "Users can create their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can view their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete their own budgets" ON budgets;

-- Create standardized policies for budgets
CREATE POLICY "budgets_select_own" ON budgets
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "budgets_insert_own" ON budgets
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budgets_update_own" ON budgets
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budgets_delete_own" ON budgets
FOR DELETE USING (auth.uid() = user_id);

-- Savings goals table policy cleanup
DROP POLICY IF EXISTS "Users can create their own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can insert own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can read own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can view their own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can update own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can update their own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can delete own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can delete their own savings goals" ON savings_goals;

-- Create standardized policies for savings goals
CREATE POLICY "savings_goals_select_own" ON savings_goals
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "savings_goals_insert_own" ON savings_goals
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "savings_goals_update_own" ON savings_goals
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "savings_goals_delete_own" ON savings_goals
FOR DELETE USING (auth.uid() = user_id);

-- Debts table policy cleanup
DROP POLICY IF EXISTS "Users can create their own debts" ON debts;
DROP POLICY IF EXISTS "Users can insert own debts" ON debts;
DROP POLICY IF EXISTS "Users can read own debts" ON debts;
DROP POLICY IF EXISTS "Users can view their own debts" ON debts;
DROP POLICY IF EXISTS "Users can update own debts" ON debts;
DROP POLICY IF EXISTS "Users can update their own debts" ON debts;
DROP POLICY IF EXISTS "Users can delete own debts" ON debts;
DROP POLICY IF EXISTS "Users can delete their own debts" ON debts;

-- Create standardized policies for debts
CREATE POLICY "debts_select_own" ON debts
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "debts_insert_own" ON debts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "debts_update_own" ON debts
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "debts_delete_own" ON debts
FOR DELETE USING (auth.uid() = user_id);

-- Investments table policy cleanup
DROP POLICY IF EXISTS "Users can create their own investments" ON investments;
DROP POLICY IF EXISTS "Users can insert own investments" ON investments;
DROP POLICY IF EXISTS "Users can read own investments" ON investments;
DROP POLICY IF EXISTS "Users can view their own investments" ON investments;
DROP POLICY IF EXISTS "Users can update own investments" ON investments;
DROP POLICY IF EXISTS "Users can update their own investments" ON investments;
DROP POLICY IF EXISTS "Users can delete own investments" ON investments;
DROP POLICY IF EXISTS "Users can delete their own investments" ON investments;

-- Create standardized policies for investments
CREATE POLICY "investments_select_own" ON investments
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "investments_insert_own" ON investments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "investments_update_own" ON investments
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "investments_delete_own" ON investments
FOR DELETE USING (auth.uid() = user_id);

-- Notifications table policy cleanup
DROP POLICY IF EXISTS "Users can create their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;

-- Create standardized policies for notifications
CREATE POLICY "notifications_select_own" ON notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_own" ON notifications
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON notifications
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own" ON notifications
FOR DELETE USING (auth.uid() = user_id);

-- Verify RLS is still enabled on all tables
DO $$
DECLARE
    table_name text;
    tables text[] := ARRAY['profiles', 'bills', 'transactions', 'budgets', 'savings_goals', 'debts', 'investments', 'notifications'];
BEGIN
    FOREACH table_name IN ARRAY tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = table_name
            AND n.nspname = 'public'
            AND c.relrowsecurity = true
        ) THEN
            EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
            RAISE NOTICE 'Enabled RLS on table: %', table_name;
        ELSE
            RAISE NOTICE 'RLS already enabled on table: %', table_name;
        END IF;
    END LOOP;
END $$;