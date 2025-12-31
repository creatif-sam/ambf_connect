import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function getMyMembership(eventId: string) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from("event_members")
    .select("id, role")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single()

  return data
}

export async function joinEvent(eventId: string) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { error } = await supabase.from("event_members").insert({
    event_id: eventId,
    user_id: user.id,
    role: "attendee"
  })

  if (error) throw error
}
