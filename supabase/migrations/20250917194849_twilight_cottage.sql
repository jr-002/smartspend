/*
  # Create notifications table with enums

  1. New Enums
    - `notification_type` (budget, bill, goal, investment, spending, system)
    - `notification_priority` (high, medium, low)

  2. New Tables
    - `notifications`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `user_id` (uuid, references profiles.id, not null)
      - `title` (text, not null)
      - `message` (text, not null)
      - `type` (notification_type, not null)
      - `priority` (notification_priority, not null, default 'medium')
      - `read` (boolean, not null, default false)
      - `data` (jsonb, nullable)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  3. Security
    - Enable RLS on `notifications` table
    - Add policies for users to manage their own notifications

  4. Indexes
    - Index on user_id for performance
    - Index on read status for filtering
    - Index on type for filtering
    - Index on created_at for time-based queries
*/

-- Create notification enums
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('budget', 'bill', 'goal', 'investment', 'spending', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_priority AS ENUM ('high', 'medium', 'low');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type notification_type NOT NULL,
    priority notification_priority NOT NULL DEFAULT 'medium',
    read boolean NOT NULL DEFAULT false,
    data jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
    ON notifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
    ON notifications FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);