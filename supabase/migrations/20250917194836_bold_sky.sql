/*
  # Create debts table

  1. New Tables
    - `debts`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `user_id` (uuid, references profiles.id, not null)
      - `name` (text, not null)
      - `type` (text, not null)
      - `balance` (numeric(10,2), not null)
      - `original_amount` (numeric(10,2), not null)
      - `interest_rate` (numeric(5,2), not null)
      - `minimum_payment` (numeric(10,2), not null)
      - `due_date` (date, not null)
      - `priority` (text, not null, default 'medium', check: 'high', 'medium', or 'low')
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `debts` table
    - Add policies for users to manage their own debts

  3. Indexes
    - Index on user_id for performance
    - Index on priority for filtering
    - Index on due_date for date-based queries
*/

-- Create debts table
CREATE TABLE IF NOT EXISTS debts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    type text NOT NULL,
    balance numeric(10,2) NOT NULL,
    original_amount numeric(10,2) NOT NULL,
    interest_rate numeric(5,2) NOT NULL,
    minimum_payment numeric(10,2) NOT NULL,
    due_date date NOT NULL,
    priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own debts"
    ON debts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts"
    ON debts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts"
    ON debts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts"
    ON debts FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_priority ON debts(priority);
CREATE INDEX IF NOT EXISTS idx_debts_due_date ON debts(due_date);
CREATE INDEX IF NOT EXISTS idx_debts_user_priority ON debts(user_id, priority);

-- Add updated_at trigger
CREATE TRIGGER update_debts_updated_at
    BEFORE UPDATE ON debts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();