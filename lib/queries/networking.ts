import { createSupabaseServerClient } from "@/lib/supabase/server"

/* =========================
   SEND CONNECTION REQUEST
   ========================= */

export async function sendConnectionRequest(
  eventId: string,
  receiverId: string
) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { error } = await supabase
    .from("networking_requests")
    .insert({
      event_id: eventId,
      sender_id: user.id,
      receiver_id: receiverId,
      status: "pending"
    })

  if (error) {
    throw error
  }
}

/* =========================
   FETCH INCOMING REQUESTS
   ========================= */

export async function fetchIncomingRequests(eventId: string) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { data, error } = await supabase
    .from("networking_requests")
    .select(`
      id,
      status,
      sender_id,
      profiles!networking_requests_sender_id_fkey (
        id,
        full_name,
        avatar_url
      ),
      events (
        id,
        title
      )
    `)
    .eq("receiver_id", user.id)
    .eq("event_id", eventId)
    .eq("status", "pending")

  if (error) {
    throw error
  }

  return data ?? []
}

/* =========================
   UPDATE REQUEST STATUS
   ========================= */

export async function updateRequestStatus(
  requestId: string,
  status: "accepted" | "rejected"
) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { error } = await supabase
    .from("networking_requests")
    .update({ status })
    .eq("id", requestId)
    .eq("receiver_id", user.id)

  if (error) {
    throw error
  }
}

/* =========================
   GET NETWORKING MAP
   ========================= */

export async function getNetworkingMap(
  eventId: string,
  userId: string
): Promise<Record<string, string>> {
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

  data.forEach(row => {
    map[row.receiver_id] = row.status
  })

  return map
}
