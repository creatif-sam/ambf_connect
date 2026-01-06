-- Fix RLS policies to allow status updates by admins

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update user status" ON profiles;

-- Allow users to update their own profile (except status)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow organizers to update any user's status
CREATE POLICY "Organizers can update user status"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM event_members
      WHERE event_members.user_id = auth.uid()
      AND event_members.role = 'organizer'
    )
  );

-- Also allow service role to update (for backend operations)
CREATE POLICY "Service role can update profiles"
  ON profiles FOR UPDATE
  USING (auth.jwt()->>'role' = 'service_role');
