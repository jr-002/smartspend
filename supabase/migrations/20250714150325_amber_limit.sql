/*
  # Create debts table

  1. New Tables
    - `debts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `type` (text)
      - `balance` (numeric)
      - `original_amount` (numeric)
      - `interest_rate` (numeric)
      - `minimum_payment` (numeric)
      - `due_date` (date)
      - `priority` (text, 'high', 'medium', 'low')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `debts` table
    - Add policies for users to manage their own debts
*/

CREATE TABLE IF NOT EXISTS debts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  balance numeric NOT NULL CHECK (balance >= 0),
  original_amount numeric NOT NULL CHECK (original_amount > 0),
  interest_rate numeric NOT NULL CHECK (interest_rate >= 0),
  minimum_payment numeric NOT NULL CHECK (minimum_payment > 0),
  due_date date NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own debts"
  ON debts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own debts"
  ON debts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own debts"
  ON debts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own debts"
  ON debts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_debts_updated_at
  BEFORE UPDATE ON debts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_priority ON debts(priority);
CREATE INDEX IF NOT EXISTS idx_debts_due_date ON debts(due_date);