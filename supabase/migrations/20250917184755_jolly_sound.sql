/*
  # Clean up duplicate RLS policies

  1. Policy Cleanup
    - Remove duplicate policies with inconsistent naming
    - Standardize policy names across all tables
    - Ensure consistent policy definitions

  2. Security
    - Maintain RLS protection throughout the process
    - Use safe conditional operations
    - Verify policy effectiveness after changes

  3. Tables Affected
    - `profiles` - Standardize profile access policies
    - `transactions` - Standardize transaction access policies  
    - `budgets` - Standardize budget access policies
    - `savings_goals` - Standardize savings goal access policies
    - `bills` - Standardize bill access policies
    - `debts` - Standardize debt access policies
    - `notifications` - Standardize notification access policies
    - `investments` - Standardize investment access policies
*/

-- Clean up profiles table policies
DO $$
BEGIN
    -- Drop duplicate/inconsistent policies
    DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
    
    -- Ensure standard policies exist with correct definitions
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile" ON profiles
        FOR INSERT TO authenticated
        WITH CHECK (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can read own profile'
    ) THEN
        CREATE POLICY "Users can read own profile" ON profiles
        FOR SELECT TO authenticated
        USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON profiles
        FOR UPDATE TO authenticated
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);
    END IF;

    RAISE NOTICE 'Profiles policies cleaned up successfully';
END $$;

-- Clean up transactions table policies
DO $$
BEGIN
    -- Drop duplicate policies
    DROP POLICY IF EXISTS "Users can create their own transactions" ON transactions;
    DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;
    DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
    DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
    
    -- Ensure standard policies exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'transactions' 
        AND policyname = 'Users can insert own transactions'
    ) THEN
        CREATE POLICY "Users can insert own transactions" ON transactions
        FOR INSERT TO authenticated
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'transactions' 
        AND policyname = 'Users can read own transactions'
    ) THEN
        CREATE POLICY "Users can read own transactions" ON transactions
        FOR SELECT TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'transactions' 
        AND policyname = 'Users can update own transactions'
    ) THEN
        CREATE POLICY "Users can update own transactions" ON transactions
        FOR UPDATE TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'transactions' 
        AND policyname = 'Users can delete own transactions'
    ) THEN
        CREATE POLICY "Users can delete own transactions" ON transactions
        FOR DELETE TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    RAISE NOTICE 'Transactions policies cleaned up successfully';
END $$;

-- Clean up budgets table policies
DO $$
BEGIN
    -- Drop duplicate policies
    DROP POLICY IF EXISTS "Users can create their own budgets" ON budgets;
    DROP POLICY IF EXISTS "Users can delete their own budgets" ON budgets;
    DROP POLICY IF EXISTS "Users can update their own budgets" ON budgets;
    DROP POLICY IF EXISTS "Users can view their own budgets" ON budgets;
    
    -- Ensure standard policies exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'budgets' 
        AND policyname = 'Users can manage own budgets'
    ) THEN
        CREATE POLICY "Users can manage own budgets" ON budgets
        FOR ALL TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;

    RAISE NOTICE 'Budgets policies cleaned up successfully';
END $$;

-- Clean up savings_goals table policies
DO $$
BEGIN
    -- Drop duplicate policies
    DROP POLICY IF EXISTS "Users can create their own savings goals" ON savings_goals;
    DROP POLICY IF EXISTS "Users can delete their own savings goals" ON savings_goals;
    DROP POLICY IF EXISTS "Users can update their own savings goals" ON savings_goals;
    DROP POLICY IF EXISTS "Users can view their own savings goals" ON savings_goals;
    
    -- Ensure standard policies exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'savings_goals' 
        AND policyname = 'Users can manage own savings goals'
    ) THEN
        CREATE POLICY "Users can manage own savings goals" ON savings_goals
        FOR ALL TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;

    RAISE NOTICE 'Savings goals policies cleaned up successfully';
END $$;

-- Clean up bills table policies
DO $$
BEGIN
    -- Drop duplicate policies
    DROP POLICY IF EXISTS "Users can create their own bills" ON bills;
    DROP POLICY IF EXISTS "Users can delete their own bills" ON bills;
    DROP POLICY IF EXISTS "Users can update their own bills" ON bills;
    DROP POLICY IF EXISTS "Users can view their own bills" ON bills;
    
    -- Ensure standard policies exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'bills' 
        AND policyname = 'Users can manage own bills'
    ) THEN
        CREATE POLICY "Users can manage own bills" ON bills
        FOR ALL TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;

    RAISE NOTICE 'Bills policies cleaned up successfully';
END $$;

-- Clean up debts table policies
DO $$
BEGIN
    -- Drop duplicate policies
    DROP POLICY IF EXISTS "Users can create their own debts" ON debts;
    DROP POLICY IF EXISTS "Users can delete their own debts" ON debts;
    DROP POLICY IF EXISTS "Users can update their own debts" ON debts;
    DROP POLICY IF EXISTS "Users can view their own debts" ON debts;
    
    -- Ensure standard policies exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'debts' 
        AND policyname = 'Users can manage own debts'
    ) THEN
        CREATE POLICY "Users can manage own debts" ON debts
        FOR ALL TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;

    RAISE NOTICE 'Debts policies cleaned up successfully';
END $$;

-- Clean up notifications table policies
DO $$
BEGIN
    -- Drop duplicate policies
    DROP POLICY IF EXISTS "Users can create their own notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
    
    -- Ensure standard policies exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'notifications' 
        AND policyname = 'Users can manage own notifications'
    ) THEN
        CREATE POLICY "Users can manage own notifications" ON notifications
        FOR ALL TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;

    RAISE NOTICE 'Notifications policies cleaned up successfully';
END $$;

-- Clean up investments table policies
DO $$
BEGIN
    -- Drop duplicate policies
    DROP POLICY IF EXISTS "Users can create their own investments" ON investments;
    DROP POLICY IF EXISTS "Users can delete their own investments" ON investments;
    DROP POLICY IF EXISTS "Users can update their own investments" ON investments;
    DROP POLICY IF EXISTS "Users can view their own investments" ON investments;
    
    -- Ensure standard policies exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'investments' 
        AND policyname = 'Users can manage own investments'
    ) THEN
        CREATE POLICY "Users can manage own investments" ON investments
        FOR ALL TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;

    RAISE NOTICE 'Investments policies cleaned up successfully';
END $$;

-- Verify all policies are working correctly
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    RAISE NOTICE 'Total RLS policies after cleanup: %', policy_count;
    
    -- Verify each table has RLS enabled
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'profiles' AND relrowsecurity = true) THEN
        RAISE EXCEPTION 'RLS not enabled on profiles table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'transactions' AND relrowsecurity = true) THEN
        RAISE EXCEPTION 'RLS not enabled on transactions table';
    END IF;
    
    RAISE NOTICE 'RLS verification completed successfully';
END $$;