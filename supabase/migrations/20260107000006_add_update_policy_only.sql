-- Properly add UPDATE policy for role management without breaking SELECT

-- Only add the UPDATE policy, don't touch any SELECT policies
DROP POLICY IF EXISTS "Organizers and admins can update roles" ON event_members;

CREATE POLICY "Organizers and admins can update roles"
  ON event_members FOR UPDATE
  USING (
    -- Allow update if the user is an organizer or admin in this event
    EXISTS (
      SELECT 1 FROM event_members em
      WHERE em.event_id = event_members.event_id
      AND em.user_id = auth.uid()
      AND em.role IN ('organizer', 'admin')
    )
  )
  WITH CHECK (
    -- Allow any role value from the valid set
    role IN ('attendee', 'speaker', 'media', 'organizer', 'admin')
  );

-- Check the policy was created:
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'event_members' AND cmd = 'UPDATE';
