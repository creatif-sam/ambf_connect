-- Rollback migrations 002, 003, and 004 - remove all policies we added

-- Drop all the policies added in migration 002
DROP POLICY IF EXISTS "Organizers and admins can update member roles" ON event_members;
DROP POLICY IF EXISTS "Organizers and admins can read all members" ON event_members;

-- Drop all the policies added in migration 003
DROP POLICY IF EXISTS "Users can view their own memberships" ON event_members;
DROP POLICY IF EXISTS "Event members can view other members" ON event_members;

-- Drop all the policies added in migration 004
DROP POLICY IF EXISTS "Users can read own memberships" ON event_members;
DROP POLICY IF EXISTS "Event members can see other members" ON event_members;

-- The table should now be back to its original RLS policies
-- Check what policies remain:
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'event_members';
