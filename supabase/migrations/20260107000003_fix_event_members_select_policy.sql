-- Fix RLS policies for event_members - remove the problematic SELECT policy

-- Drop the problematic SELECT policy that was blocking dashboard access
DROP POLICY IF EXISTS "Organizers and admins can read all members" ON event_members;

-- Users should always be able to see their own memberships
-- This policy should already exist, but let's ensure it
DROP POLICY IF EXISTS "Users can view their own memberships" ON event_members;

CREATE POLICY "Users can view their own memberships"
  ON event_members FOR SELECT
  USING (user_id = auth.uid());

-- Allow users to see memberships in events they're part of
DROP POLICY IF EXISTS "Event members can view other members" ON event_members;

CREATE POLICY "Event members can view other members"
  ON event_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM event_members em
      WHERE em.event_id = event_members.event_id
      AND em.user_id = auth.uid()
    )
  );
