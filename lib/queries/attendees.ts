import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function getEventAttendees(eventId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("event_members")
    .select(`
      role,
      profiles (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq("event_id", eventId)

  if (error) {
    throw error
  }

  return data
}
