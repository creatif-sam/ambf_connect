import { supabase } from "@/lib/supabase/client"
import { handleSupabaseError } from "@/lib/utils/handleSupabaseError"

export async function joinEvent(eventId: string) {
  const { data } = await supabase.auth.getUser()
  if (!data.user) throw new Error("Not authenticated")

  const { error } = await supabase.from("event_members").insert({
    event_id: eventId,
    user_id: data.user.id,
    role: "attendee"
  })

  if (error) handleSupabaseError(error)
}
