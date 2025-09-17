/*
  # Create transactions table

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `user_id` (uuid, references profiles.id, not null)
      - `description` (text, not null)
      - `amount` (numeric(10,2), not null)
      - `category` (text, not null)
      - `transaction_type` (text, not null, check: 'income' or 'expense')
      - `date` (date, not null, default CURRENT_DATE)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `transactions` table
    - Add policies for users to manage their own transactions

  3. Indexes
    - Index on user_id for performance
    - Index on date for time-based queries
    - Composite index on user_id and date
*/

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    description text NOT NULL,
    amount numeric(10,2) NOT NULL,
    category text NOT NULL,
    transaction_type text NOT NULL CHECK (transaction_type IN ('income', 'expense')),
    date date NOT NULL DEFAULT CURRENT_DATE,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own transactions"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
    ON transactions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
    ON transactions FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);

-- Add updated_at trigger
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();