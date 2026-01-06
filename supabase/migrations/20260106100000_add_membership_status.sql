-- Add status column to profiles table for user approval
ALTER TABLE public.profiles
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';

-- Add check constraint for valid statuses
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_status_check
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Create index for faster queries on pending users
CREATE INDEX idx_profiles_status ON public.profiles(status);

-- Update existing users to 'approved' (they're already in the system)
UPDATE public.profiles SET status = 'approved' WHERE status IS NULL OR status = 'pending';

