/*
  # Create savings goals table

  1. New Tables
    - `savings_goals`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `user_id` (uuid, references profiles.id, not null)
      - `name` (text, not null)
      - `description` (text, nullable)
      - `target_amount` (numeric(10,2), not null)
      - `current_amount` (numeric(10,2), not null, default 0)
      - `deadline` (date, nullable)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `savings_goals` table
    - Add policies for users to manage their own savings goals

  3. Indexes
    - Index on user_id for performance
    - Index on deadline for deadline-based queries
*/

-- Create savings_goals table
CREATE TABLE IF NOT EXISTS savings_goals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    target_amount numeric(10,2) NOT NULL,
    current_amount numeric(10,2) NOT NULL DEFAULT 0,
    deadline date,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own savings goals"
    ON savings_goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings goals"
    ON savings_goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings goals"
    ON savings_goals FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings goals"
    ON savings_goals FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_deadline ON savings_goals(deadline);

-- Add updated_at trigger
CREATE TRIGGER update_savings_goals_updated_at
    BEFORE UPDATE ON savings_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();