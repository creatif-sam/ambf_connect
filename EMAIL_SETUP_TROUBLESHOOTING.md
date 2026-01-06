# Email Setup Checklist

When you approve a user and the email doesn't send, check these:

## 1. Check Your Terminal Logs

When you click "Approve", check your terminal for logs like:
```
Attempting to send approval email to: user@example.com
Edge Function URL: https://your-project.supabase.co/functions/v1/send_approval_email
Email API response: 200 {...}
```

## 2. Most Common Issues

### ❌ "Service role key not configured"
**Fix:** Add to `.env.local`:
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```
Find it in: Supabase Dashboard → Settings → API → `service_role` key

### ❌ Edge Function returns 404
**Cause:** Edge Function not deployed yet

**Fix:** 
```bash
# Deploy the edge function
supabase functions deploy send_approval_email

# Set the Resend API key secret
supabase secrets set RESEND_API_KEY=re_your_key_here
supabase secrets set NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### ❌ "Failed to send email" from Resend
**Cause:** Invalid Resend API key or domain not verified

**Fix:**
1. Sign up at https://resend.com
2. Get your API key
3. Set it in Supabase Edge Function:
   ```bash
   supabase secrets set RESEND_API_KEY=re_your_actual_key
   ```
4. For production: Verify your domain in Resend dashboard

## 3. Test Without Email (Quick Fix)

If you don't want to set up email right now, you can still approve users. Just comment out the email section in the API route:

In `app/api/members/approve/route.ts`, comment out lines 76-120 (the email sending part).

## 4. Alternative: Use Console Logs

For development, you can log the approval instead of sending email. Replace the edge function call with:

```typescript
console.log("User approved:", {
  email: profile.email,
  name: profile.full_name,
  userId: profile.id
})
```

## 5. Check User's Email Field

Make sure the user's profile actually has an email:
1. Go to Supabase Dashboard → Table Editor → profiles
2. Find the user
3. Check if `email` column has a value
4. If not, run this SQL:
   ```sql
   UPDATE public.profiles p
   SET email = u.email
   FROM auth.users u
   WHERE p.id = u.id AND p.email IS NULL;
   ```

## Testing Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- [ ] Restarted dev server after adding env var
- [ ] Edge function deployed (`supabase functions deploy send_approval_email`)
- [ ] `RESEND_API_KEY` set in Supabase secrets
- [ ] User has email in profiles table
- [ ] Check terminal for error logs when approving

## Still Not Working?

Check the browser console and terminal logs when you click "Approve". Copy any error messages and we can debug further!
