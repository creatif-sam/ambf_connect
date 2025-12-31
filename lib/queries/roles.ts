import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export async function getMyEventRole(eventId: string) {
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

  return data.role
}
