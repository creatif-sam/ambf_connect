import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function getIncomingRequests(eventId: string, userId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("networking_requests")
    .select(`
      id,
      status,
      sender_id,
      profiles!networking_requests_sender_id_fkey (
        id,
        full_name
      )
    `)
    .eq("event_id", eventId)
    .eq("receiver_id", userId)
    .eq("status", "pending")

  if (error) throw error
  return data
}
