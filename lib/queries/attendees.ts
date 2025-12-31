import { supabase } from "@/lib/supabase/client"

export async function fetchEventAttendees(eventId: string) {
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

  if (error) throw error
  return data
}
