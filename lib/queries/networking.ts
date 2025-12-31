import { createSupabaseServerClient } from "@/lib/supabase/server"

export type NetworkingRow = {
  other_profile_id: string
  status: "pending" | "accepted" | "rejected"
  direction: "incoming" | "outgoing"
}

export async function getNetworkingMap(
  eventId: string,
  userId: string
): Promise<NetworkingRow[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("networking_requests")
    .select("sender_id, receiver_id, status")
    .eq("event_id", eventId)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)

  if (error) {
    throw error
  }

  return (data ?? []).map(row => {
    const isSender = row.sender_id === userId

    return {
      other_profile_id: isSender
        ? row.receiver_id
        : row.sender_id,
      status: row.status,
      direction: isSender ? "outgoing" : "incoming"
    }
  })
}
