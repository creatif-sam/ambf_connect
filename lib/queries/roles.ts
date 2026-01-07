import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export type EventRole = 'attendee' | 'speaker' | 'media' | 'organizer' | 'admin'

export async function getMyEventRole(eventId: string): Promise<EventRole | null> {
  const supabase = createSupabaseBrowserClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from("event_members")
    .select("role")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single()

  if (error || !data) {
    return null
  }

  return data.role as EventRole
}

export async function hasOrganizerAccess(userId?: string): Promise<boolean> {
  const supabase = createSupabaseBrowserClient()

  let userIdToCheck = userId

  if (!userIdToCheck) {
    const {
      data: { user }
    } = await supabase.auth.getUser()
    
    if (!user) return false
    userIdToCheck = user.id
  }

  const { data } = await supabase
    .from("event_members")
    .select("role")
    .eq("user_id", userIdToCheck)
    .in("role", ["organizer", "admin"])
    .limit(1)

  return !!data?.length
}

