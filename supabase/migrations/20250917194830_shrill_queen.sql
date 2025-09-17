/*
  # Create bills table

  1. New Tables
    - `bills`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `user_id` (uuid, references profiles.id, not null)
      - `name` (text, not null)
      - `provider` (text, not null)
      - `amount` (numeric(10,2), not null)
      - `due_date` (date, not null)
      - `status` (text, not null, default 'pending', check: 'paid', 'pending', or 'overdue')
      - `category` (text, not null)
      - `recurring` (boolean, not null, default true)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `bills` table
    - Add policies for users to manage their own bills

  3. Indexes
    - Index on user_id for performance
    - Index on due_date for date-based queries
    - Index on status for filtering
*/

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    provider text NOT NULL,
    amount numeric(10,2) NOT NULL,
    due_date date NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
    category text NOT NULL,
    recurring boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own bills"
    ON bills FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bills"
    ON bills FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bills"
    ON bills FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bills"
    ON bills FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_user_due_date ON bills(user_id, due_date);

-- Add updated_at trigger
CREATE TRIGGER update_bills_updated_at
    BEFORE UPDATE ON bills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();