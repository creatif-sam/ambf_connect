# Pending User Approval Feature - Setup Guide

## Overview
This feature allows event organizers to review and approve users who request to join their events. When a user is approved, they receive an email notification.

## Database Setup

### 1. Run the Migration
Apply the database migration to add the `status` column to the `event_members` table:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the migration file:
# supabase/migrations/20260106100000_add_membership_status.sql
```

This migration adds:
- `status` column (TEXT, default: 'approved')
- Check constraint for valid statuses: 'pending', 'approved', 'rejected'
- Indexes for faster queries

### 2. Update Row Level Security (RLS) Policies

You may need to update your RLS policies to handle the new status field. Here's an example:

```sql
-- Allow users to see only approved members in public views
CREATE POLICY "Users can view approved event members"
ON event_members FOR SELECT
USING (status = 'approved');

-- Organizers can see all members (including pending)
CREATE POLICY "Organizers can view all members of their events"
ON event_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_members.event_id
    AND events.created_by = auth.uid()
  )
);
```

## Email Setup

### 1. Get Resend API Key
1. Sign up at [Resend.com](https://resend.com)
2. Create an API key
3. Verify your sending domain (or use their test domain for development)

### 2. Add Environment Variables

Add these to your `.env.local`:

```bash
# Supabase (you should already have these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# For email functionality
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Deploy the Edge Function

```bash
# Deploy the approval email function
supabase functions deploy send_approval_email

# Set the Resend API key secret
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
supabase secrets set NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Feature Components

### Files Created
- **Migration**: `supabase/migrations/20260106100000_add_membership_status.sql`
- **Edge Function**: `supabase/functions/send_approval_email/index.ts`
- **Query Functions**: `lib/queries/pendingMembers.ts`
- **API Route**: `app/api/members/approve/route.ts`
- **UI Components**: 
  - `components/PendingMembersList.tsx`
  - `components/EventsList.tsx` (refactored)
- **Updated Pages**: `app/dashboard/page.tsx`

## How It Works

### User Flow
1. **User joins event**: When a user clicks "Join Event", their membership is created with `status: 'pending'`
2. **Organizer sees pending list**: Pending members appear at the top of the dashboard
3. **Organizer approves/rejects**: 
   - **Approve**: Updates status to 'approved', sends email notification
   - **Reject**: Updates status to 'rejected', no email sent
4. **User gets notified**: Approved users receive a professional email with event details

### Technical Flow
```
User Request → joinEvent() → Insert with status='pending'
                                     ↓
                        Dashboard shows pending users
                                     ↓
              Organizer clicks Approve/Reject
                                     ↓
                  API Route: /api/members/approve
                                     ↓
                    Updates status in database
                                     ↓
          (if approved) → Calls Edge Function → Sends Email
```

## Testing

### 1. Test Pending Status
```typescript
// In your browser console or test file
const supabase = createSupabaseBrowserClient()

// Create a pending membership
await supabase.from('event_members').insert({
  event_id: 'your-event-id',
  user_id: 'user-id',
  role: 'attendee',
  status: 'pending'
})
```

### 2. Test Email Locally
You can test the Edge Function locally:

```bash
supabase functions serve send_approval_email

# In another terminal:
curl -X POST http://localhost:54321/functions/v1/send_approval_email \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "eventId": "test-event-id",
    "eventTitle": "Test Event",
    "userEmail": "test@example.com",
    "userName": "Test User"
  }'
```

### 3. Test Approval Flow
1. Create a test user account
2. Have them join one of your events
3. Go to `/dashboard` as the organizer
4. You should see the pending approval
5. Click "Approve" and check the user's email

## Customization

### Email Template
Edit `supabase/functions/send_approval_email/index.ts` to customize:
- Email subject
- HTML template
- Sender name/email
- Button link destination

### Status Options
The system supports three statuses:
- `pending` - Awaiting organizer approval
- `approved` - Member can access event
- `rejected` - Member was denied (could be used for future UI)

You can add more statuses by updating the check constraint in the migration.

### UI Styling
The pending members list uses Tailwind CSS. Customize in:
- `components/PendingMembersList.tsx` - Main list UI
- `app/dashboard/page.tsx` - Dashboard layout

## Troubleshooting

### Pending Members Not Showing
- Check that the migration ran successfully
- Verify RLS policies allow organizers to see pending members
- Check browser console for errors

### Email Not Sending
- Verify `RESEND_API_KEY` is set in Edge Function secrets
- Check Edge Function logs: `supabase functions logs send_approval_email`
- Ensure email domain is verified in Resend dashboard
- Check that `profiles` table has email column

### Database Errors
- If migration fails, check for existing `status` column
- Ensure `event_members` table exists
- Verify foreign key constraints are in place

## Future Enhancements

Possible additions to this feature:
- [ ] Bulk approve/reject
- [ ] Email notifications to organizers when new users request access
- [ ] Rejection reason/message
- [ ] Automatic approval based on criteria
- [ ] Pending count badge in navigation
- [ ] Filters and search in pending list
- [ ] Event-specific approval settings
