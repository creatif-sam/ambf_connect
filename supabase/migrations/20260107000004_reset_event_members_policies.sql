-- Complete reset of event_members RLS policies to fix dashboard access

-- First, check what policies exist (for debugging)
-- Run this in a separate query to see output:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies WHERE tablename = 'event_members';

-- Drop ALL SELECT policies on event_members to start fresh
DROP POLICY IF EXISTS "Organizers and admins can read all members" ON event_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON event_members;
DROP POLICY IF EXISTS "Event members can view other members" ON event_members;
DROP POLICY IF EXISTS "Users can read own memberships" ON event_members;
DROP POLICY IF EXISTS "Enable read access for own memberships" ON event_members;
DROP POLICY IF EXISTS "Event members can see other members" ON event_members;

-- Create the correct SELECT policies
-- Policy 1: Users MUST be able to see their own memberships (critical for dashboard)
CREATE POLICY "Users can read own memberships"
  ON event_members FOR SELECT
  USING (user_id = auth.uid());

-- Policy 2: Event members can see other members in their events
CREATE POLICY "Event members can see other members"
  ON event_members FOR SELECT
  USING (
    event_id IN (
      SELECT event_id FROM event_members WHERE user_id = auth.uid()
    )
  );

-- Keep the UPDATE policy for organizers/admins (from migration 002)
-- This should already exist, but ensure it's there
DROP POLICY IF EXISTS "Organizers and admins can update member roles" ON event_members;

CREATE POLICY "Organizers and admins can update member roles"
  ON event_members FOR UPDATE
  USING (
    event_id IN (
      SELECT event_id FROM event_members 
      WHERE user_id = auth.uid() 
      AND role IN ('organizer', 'admin')
    )
  );

-- Verify policies were created (run this separately to see results):
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'event_members' ORDER BY cmd, policyname;
