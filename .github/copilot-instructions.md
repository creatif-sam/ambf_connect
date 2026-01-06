# AMBF Connect - AI Coding Agent Instructions

## Architecture Overview

**AMBF Connect** is a Next.js 16 event management and networking PWA using:
- **App Router** with Server Components as default
- **Supabase** (auth + Postgres + Realtime + Edge Functions)
- **TanStack Query** for client-side data fetching
- **Web Push** notifications via service workers
- **Tailwind CSS 4** for styling

## Critical Supabase Pattern: Server vs Client

**⚠️ MOST IMPORTANT PATTERN:**

### Server Components & Route Handlers
Use **read-only** client from `lib/supabase/server.ts`:
```typescript
const supabase = await createSupabaseServerClient()
```
- Cookies are **NOT mutated** (noop set/remove)
- Safe for Server Components that only read data
- Default choice for fetching in RSC

### Server Actions ONLY
Use **mutable** client:
```typescript
const supabase = await createSupabaseActionClient()
```
- Allows cookie mutation (auth state changes)
- Required for login, logout, signup actions
- File: `lib/supabase/server.ts`

### Client Components
Use browser client:
```typescript
const supabase = createSupabaseBrowserClient()
```
- For mutations from client components
- Real-time subscriptions (presence, messages)
- File: `lib/supabase/client.ts`

## Data Fetching Strategy

1. **Server-side (RSC)**: Use Supabase directly in page/layout components
2. **Client-side**: Use `lib/queries/*.client.ts` with TanStack Query hooks
3. **Route handlers**: API routes in `app/api/*` for mutations that trigger side effects (e.g., push notifications)

## Database Patterns

### RPC Functions
Custom Postgres functions via `.rpc()`:
```typescript
await supabase.rpc("get_inbox_conversations", { me_id: meId })
```
- Used for complex queries (see `lib/queries/messages.server.ts`)

### Role-Based Access
Events use `event_members` table with roles: `organizer`, `attendee`
- Organizers: full CRUD on event resources
- Attendees: read-only access

## Realtime Features

### Presence Tracking
See `hooks/usePresence.ts` for online status:
- Uses Supabase Realtime channels with presence keys
- Room IDs: sorted user IDs `${smaller}:${larger}`
- Tracks online/offline and persists `last_seen_at` to profiles

### Message Realtime
Messages use Supabase subscriptions on the `messages` table to show new messages instantly.

## Push Notifications Architecture

1. **Client registration**: `lib/push/registerPush.ts` subscribes via Push API
2. **Subscription storage**: `/api/push/subscribe` saves to `push_subscriptions` table
3. **Trigger**: Supabase Edge Function `send_message_push` (Deno)
   - Called from `/api/messages/send` after inserting message
   - Uses `web-push` library with VAPID keys
   - Sends to all user devices
4. **Service Worker**: `public/sw.js` displays notifications

**Environment variables needed**:
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY` (Edge Function)

## PWA Structure

- **Manifest**: `public/manifest.json`
- **Service Worker**: `public/sw.js` (handles push + offline)
- **Install prompt**: `components/PWAInstallPrompt.tsx`
- **Bootstrap**: `components/PushBootstrap.tsx` registers SW on mount

## Navigation Pattern

- **TopNav**: Desktop header with auth/dashboard links
- **BottomNav**: Mobile bottom tabs (Home, Events, Networking, Messages, Profile)
  - Shows unread count badge on Messages tab
  - Conditionally renders Dashboard tab for organizers
- Layout: `app/layout.tsx` with fixed positioning (`pt-14 pb-16` on main)

## Authentication Flow

1. Auth pages: `app/auth/{login,register,forgot-password,reset-password}`
2. Protected routes use `hooks/useRequireAuth.ts` to redirect to `/auth/login`
3. Logout via Server Action: `app/profile/actions.ts` → `logoutAction()`

## File Upload Pattern

Avatar uploads (see `app/profile/AvatarUpload.tsx`):
1. Upload to Supabase Storage bucket `avatars`
2. Get public URL
3. Update `profiles.avatar_url` via Server Action
4. Images configured in `next.config.ts` remotePatterns

## Events Structure

- **Public events**: `/events` (list) → `/events/[slug]` (detail)
- **Dashboard**: `/dashboard/events` → `/dashboard/events/[eventId]`
  - Sub-pages: `agenda`, `announcements`, `attendees`, `sessions`, `edit`
- **Query helpers**: `lib/queries/events.ts`, `myEvents.ts`

## Error Handling

- Client errors: `lib/utils/handleSupabaseError.ts` throws Error with message
- Server errors: `lib/utils/throwServerError.ts` for route handlers
- Never expose raw Supabase errors to client

## Development Commands

```bash
npm run dev          # Start Next.js dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint check
```

## Key Files Reference

- **Auth logic**: `lib/supabase/auth.ts`, `lib/supabase/session.ts`
- **Queries**: `lib/queries/*.ts` (split by domain)
- **Server Actions**: Look for `"use server"` directive (e.g., `app/profile/actions.ts`)
- **Constants**: `lib/constants/agenda.ts` (time slots, etc.)

## Styling Conventions

- Tailwind utility-first approach
- Mobile-first responsive design with `md:` breakpoint
- Global styles in `app/globals.css`

## Common Gotchas

1. **Always await** `cookies()` before using cookieStore
2. **Never call** `createSupabaseActionClient()` in Server Components (only Server Actions)
3. **Parallel layout** in messages uses `@parallel` slot pattern for desktop split view
4. **Revalidation**: Use `revalidatePath()` in Server Actions after mutations
5. **Edge Functions**: Deno runtime in `supabase/functions/` (not Node.js)
