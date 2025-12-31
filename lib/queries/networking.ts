import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function getNetworkingMap(eventId: string, userId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("networking_requests")
    .select("receiver_id, status")
    .eq("event_id", eventId)
    .eq("sender_id", userId)

  if (error) {
    throw error
  }

  const map: Record<string, string> = {}

  data.forEach(r => {
    map[r.receiver_id] = r.status
  })

  return map
}
