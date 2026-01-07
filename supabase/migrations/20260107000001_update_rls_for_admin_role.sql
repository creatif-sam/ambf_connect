-- Update RLS policies to include admin role for dashboard access

-- Drop existing policy for organizers
DROP POLICY IF EXISTS "Organizers can update user status" ON profiles;

-- Allow organizers AND admins to update any user's status
CREATE POLICY "Organizers and admins can update user status"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM event_members
      WHERE event_members.user_id = auth.uid()
      AND event_members.role IN ('organizer', 'admin')
    )
  );
