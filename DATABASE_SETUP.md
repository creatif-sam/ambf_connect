# Quick Database Setup - Fix Error 42703

## The Issue
Error `42703` means PostgreSQL cannot find the columns we're trying to use (`status` and `email` in the `profiles` table).

## Solution: Run This SQL in Supabase

1. **Go to your Supabase Dashboard**
2. **Click on "SQL Editor"** in the left sidebar
3. **Copy and paste this entire SQL code:**

```sql
-- Add email column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- Add status column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN status TEXT NOT NULL DEFAULT 'approved';
    
    -- Add check constraint
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_status_check
    CHECK (status IN ('pending', 'approved', 'rejected'));
    
    -- Create index
    CREATE INDEX idx_profiles_status ON public.profiles(status);
  END IF;
END $$;

-- Update existing profiles to approved status
UPDATE public.profiles 
SET status = 'approved' 
WHERE status IS NULL OR status = '';

-- Populate email field from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Update the trigger function to include status and email for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    job_title,
    company,
    avatar_url,
    last_seen_at,
    status,
    email
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'job_title', ''),
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    NULL,
    NOW(),
    'pending',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

4. **Click "Run"** or press `Ctrl+Enter`
5. **Wait for "Success. No rows returned"** message

## After Running the SQL

Restart your dev server:
```bash
npm run dev
```

The error should be gone!

## What This Does

- ✅ Adds `status` column to profiles (default: 'approved')
- ✅ Adds `email` column to profiles
- ✅ Sets all existing users to 'approved' status
- ✅ Copies email addresses from auth.users to profiles
- ✅ Updates the registration trigger to set new users as 'pending'
- ✅ Creates proper indexes and constraints

## Testing New User Registration

After setup, test the approval flow:

1. Create a new test user account (use incognito/private window)
2. They should see the "Pending Approval" page
3. Log in as an organizer
4. Go to `/dashboard`
5. You should see the new user in "Pending User Registrations"
6. Click "Approve"
7. The user will receive an email and can now access the platform

## Troubleshooting

### Still getting errors?
- Check the Supabase SQL Editor logs for any error messages
- Make sure you're connected to the right database
- Verify your `.env.local` has the correct Supabase credentials

### Can't see pending users on dashboard?
- Make sure you have at least one event where you're the organizer
- The pending list only shows for organizers

### Email not sending?
- Add `RESEND_API_KEY` to your `.env.local`
- Deploy the Edge Function: `supabase functions deploy send_approval_email`
