-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'message', 'event', 'announcement', 'system'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- URL to navigate when clicked
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Add RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System can insert notifications
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE notifications IS 'User notifications for messages, events, and announcements';
