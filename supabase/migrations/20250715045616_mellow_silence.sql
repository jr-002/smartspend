/*
  # Create notifications table

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text)
      - `message` (text)
      - `type` (text, 'budget', 'bill', 'goal', 'investment', 'spending', 'system')
      - `priority` (text, 'high', 'medium', 'low')
      - `read` (boolean, default false)
      - `data` (jsonb, optional metadata)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `notifications` table
    - Add policies for users to manage their own notifications

  3. Functions
    - Function to automatically create notifications based on triggers
    - Function to mark notifications as read
    - Function to clean up old notifications
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('budget', 'bill', 'goal', 'investment', 'spending', 'system')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  read boolean NOT NULL DEFAULT false,
  data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Function to create budget exceeded notification
CREATE OR REPLACE FUNCTION create_budget_notification(
  p_user_id uuid,
  p_category text,
  p_spent numeric,
  p_budget numeric
) RETURNS void AS $$
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
$$ LANGUAGE plpgsql;

-- Function to create bill due notification
CREATE OR REPLACE FUNCTION create_bill_notification(
  p_user_id uuid,
  p_bill_name text,
  p_amount numeric,
  p_due_date date,
  p_days_until_due integer
) RETURNS void AS $$
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
$$ LANGUAGE plpgsql;

-- Function to create goal achievement notification
CREATE OR REPLACE FUNCTION create_goal_notification(
  p_user_id uuid,
  p_goal_name text,
  p_current_amount numeric,
  p_target_amount numeric,
  p_achievement_type text
) RETURNS void AS $$
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
$$ LANGUAGE plpgsql;

-- Function to clean up old notifications (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications() RETURNS void AS $$
BEGIN
  DELETE FROM notifications 
  WHERE created_at < NOW() - INTERVAL '30 days' 
  AND read = true;
END;
$$ LANGUAGE plpgsql;