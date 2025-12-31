import { supabase } from "@/lib/supabase/client"

export async function sendConnectionRequest(
  eventId: string,
  receiverId: string
) {
  const { data } = await supabase.auth.getUser()
  if (!data.user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("networking_requests")
    .insert({
      event_id: eventId,
      sender_id: data.user.id,
      receiver_id: receiverId,
      status: "pending"
    })

  if (error) throw error
}

export async function fetchIncomingRequests(eventId: string) {
  const { data } = await supabase.auth.getUser()
  if (!data.user) return []

  const { data: requests, error } = await supabase
    .from("networking_requests")
    .select(`
      id,
      sender_id,
      status,
      profiles:sender_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq("event_id", eventId)
    .eq("receiver_id", data.user.id)
    .eq("status", "pending")

  if (error) throw error
  return requests
}

export async function updateRequestStatus(
  requestId: string,
  status: "accepted" | "rejected"
) {
  const { error } = await supabase
    .from("networking_requests")
    .update({ status })
    .eq("id", requestId)

  if (error) throw error
}
