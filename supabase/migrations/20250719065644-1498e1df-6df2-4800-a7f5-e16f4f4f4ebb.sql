-- Add 'weekly' as an allowed period for budgets
ALTER TABLE public.budgets 
DROP CONSTRAINT IF EXISTS budgets_period_check;

-- Add constraint to allow monthly, yearly, and weekly periods
ALTER TABLE public.budgets 
ADD CONSTRAINT budgets_period_check 
CHECK (period IN ('weekly', 'monthly', 'yearly'));