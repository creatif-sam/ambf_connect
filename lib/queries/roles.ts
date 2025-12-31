import { supabase } from "@/lib/supabase/client"

export async function getMyEventRole(eventId: string) {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return null

  const { data, error } = await supabase
    .from("event_members")
    .select("role")
    .eq("event_id", eventId)
    .eq("user_id", user.user.id)
    .single()

  if (error) return null
  return data.role
}
