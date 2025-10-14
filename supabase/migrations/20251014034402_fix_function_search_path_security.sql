/*
  # Fix Function Search Path Security Issues

  This migration addresses Supabase security linter warnings by adding
  immutable search_path settings to all database functions.

  ## Security Enhancement
  
  Setting `search_path` to a fixed value prevents potential SQL injection
  attacks through search_path manipulation. All functions are updated to:
  - Use `SET search_path = 'public'` to lock the schema
  - Maintain `SECURITY DEFINER` for proper privilege execution
  - Preserve all existing function logic

  ## Functions Updated
  1. `create_budget_notification` - Creates budget alert notifications
  2. `create_bill_notification` - Creates bill due notifications  
  3. `create_goal_notification` - Creates savings goal notifications
  4. `cleanup_old_notifications` - Removes old read notifications
  5. `update_updated_at_column` - Already secured in previous migration
  6. `handle_new_user` - Already secured in previous migration

  ## Important Notes
  - Functions are recreated with identical logic
  - No data changes or behavioral modifications
  - Only security configuration is enhanced
  - All parameters and return types remain unchanged
*/

-- Fix create_budget_notification function
CREATE OR REPLACE FUNCTION public.create_budget_notification(
  p_user_id uuid, 
  p_category text, 
  p_spent numeric, 
  p_budget numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message, type, priority, data)
  VALUES (
    p_user_id,
    'Budget Alert: ' || p_category,
    'You have spent ' || p_spent || ' out of ' || p_budget || ' in your ' || p_category || ' budget.',
    'budget',
    CASE 
      WHEN p_spent > p_budget THEN 'high'
      WHEN p_spent > p_budget * 0.9 THEN 'medium'
      ELSE 'low'
    END,
    jsonb_build_object(
      'category', p_category,
      'spent', p_spent,
      'budget', p_budget,
      'percentage', (p_spent / p_budget * 100)
    )
  );
END;
$$;

-- Fix create_bill_notification function
CREATE OR REPLACE FUNCTION public.create_bill_notification(
  p_user_id uuid, 
  p_bill_name text, 
  p_amount numeric, 
  p_due_date date, 
  p_days_until_due integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message, type, priority, data)
  VALUES (
    p_user_id,
    'Bill Due: ' || p_bill_name,
    'Your ' || p_bill_name || ' bill of ' || p_amount || ' is due in ' || p_days_until_due || ' days.',
    'bill',
    CASE 
      WHEN p_days_until_due <= 1 THEN 'high'
      WHEN p_days_until_due <= 3 THEN 'medium'
      ELSE 'low'
    END,
    jsonb_build_object(
      'bill_name', p_bill_name,
      'amount', p_amount,
      'due_date', p_due_date,
      'days_until_due', p_days_until_due
    )
  );
END;
$$;

-- Fix create_goal_notification function
CREATE OR REPLACE FUNCTION public.create_goal_notification(
  p_user_id uuid, 
  p_goal_name text, 
  p_current_amount numeric, 
  p_target_amount numeric, 
  p_achievement_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message, type, priority, data)
  VALUES (
    p_user_id,
    CASE 
      WHEN p_achievement_type = 'completed' THEN 'Goal Achieved: ' || p_goal_name
      ELSE 'Goal Progress: ' || p_goal_name
    END,
    CASE 
      WHEN p_achievement_type = 'completed' THEN 'Congratulations! You have reached your ' || p_goal_name || ' goal of ' || p_target_amount || '!'
      ELSE 'Great progress on your ' || p_goal_name || ' goal! You are ' || ROUND((p_current_amount / p_target_amount * 100)::numeric, 1) || '% complete.'
    END,
    'goal',
    CASE 
      WHEN p_achievement_type = 'completed' THEN 'high'
      ELSE 'medium'
    END,
    jsonb_build_object(
      'goal_name', p_goal_name,
      'current_amount', p_current_amount,
      'target_amount', p_target_amount,
      'percentage', (p_current_amount / p_target_amount * 100),
      'achievement_type', p_achievement_type
    )
  );
END;
$$;

-- Fix cleanup_old_notifications function
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM notifications 
  WHERE created_at < NOW() - INTERVAL '30 days' 
  AND read = true;
END;
$$;

-- Verification query to confirm all functions have search_path set
DO $$
DECLARE
  func_record RECORD;
  func_count INTEGER := 0;
BEGIN
  FOR func_record IN 
    SELECT 
      p.proname as function_name,
      CASE 
        WHEN pg_get_functiondef(p.oid) LIKE '%SET search_path%' THEN 'SECURED'
        ELSE 'NEEDS FIX'
      END as security_status
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname IN (
      'create_budget_notification', 
      'create_bill_notification', 
      'create_goal_notification', 
      'cleanup_old_notifications',
      'update_updated_at_column',
      'handle_new_user'
    )
  LOOP
    func_count := func_count + 1;
    RAISE NOTICE 'Function: % - Status: %', func_record.function_name, func_record.security_status;
  END LOOP;
  
  RAISE NOTICE 'Security fix applied to % functions', func_count;
END $$;
