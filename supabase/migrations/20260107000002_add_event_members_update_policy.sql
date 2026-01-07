-- Add RLS policy to allow organizers and admins to update event member roles

-- Drop any existing update policies
DROP POLICY IF EXISTS "Organizers and admins can update member roles" ON event_members;

-- Allow organizers and admins to update any member in their events
CREATE POLICY "Organizers and admins can update member roles"
  ON event_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM event_members em
      WHERE em.event_id = event_members.event_id
      AND em.user_id = auth.uid()
      AND em.role IN ('organizer', 'admin')
    )
  );

-- Also ensure organizers/admins can read all members
DROP POLICY IF EXISTS "Organizers and admins can read all members" ON event_members;

CREATE POLICY "Organizers and admins can read all members"
  ON event_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM event_members em
      WHERE em.event_id = event_members.event_id
      AND em.user_id = auth.uid()
      AND em.role IN ('organizer', 'admin')
    )
  );
