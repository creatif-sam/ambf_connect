-- Update event_members table to support new role types
-- Roles: attendee, speaker, media, organizer, admin

-- Drop existing check constraint if it exists
ALTER TABLE public.event_members
DROP CONSTRAINT IF EXISTS event_members_role_check;

-- Add new check constraint with all 5 roles
ALTER TABLE public.event_members
ADD CONSTRAINT event_members_role_check
CHECK (role IN ('attendee', 'speaker', 'media', 'organizer', 'admin'));

-- Update any existing NULL roles to 'attendee' (default)
UPDATE public.event_members
SET role = 'attendee'
WHERE role IS NULL OR role NOT IN ('attendee', 'speaker', 'media', 'organizer', 'admin');

-- Create index for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_event_members_role ON public.event_members(role);

-- Create index for organizer/admin queries (dashboard access)
CREATE INDEX IF NOT EXISTS idx_event_members_dashboard_roles 
ON public.event_members(user_id, role) 
WHERE role IN ('organizer', 'admin');

-- Add comment explaining the role hierarchy
COMMENT ON COLUMN public.event_members.role IS 'User role: attendee (default), speaker, media, organizer, admin. Only organizer and admin have dashboard access.';
