import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import NetworkingClient from "./NetworkingClient"

export const dynamic = "force-dynamic"

export default async function NetworkingPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: requests } = await supabase
    .from("networking_requests")
    .select("id, sender_id, receiver_id, status, event_id")

  if (!requests) {
    return (
      <main className="max-w-6xl mx-auto p-10 text-center text-gray-500">
        No networking activity yet
      </main>
    )
  }

  const accepted = requests.filter(r => r.status === "accepted")

  const received = requests.filter(
    r => r.receiver_id === user.id && r.status === "pending"
  )

  const sent = requests.filter(
    r => r.sender_id === user.id && r.status === "pending"
  )

  const connections = accepted.filter(
    r => r.sender_id === user.id || r.receiver_id === user.id
  )

  /* =========================
     SERVER ACTIONS
     ========================= */

  async function acceptRequest(requestId: string) {
    "use server"
    const supabase = await createSupabaseServerClient()
    await supabase
      .from("networking_requests")
      .update({ status: "accepted" })
      .eq("id", requestId)
  }

  async function rejectRequest(requestId: string) {
    "use server"
    const supabase = await createSupabaseServerClient()
    await supabase
      .from("networking_requests")
      .delete()
      .eq("id", requestId)
  }

  /* =========================
     CONNECTION GRAPH
     ========================= */

  const connectionMap: Record<string, Set<string>> = {}

  accepted.forEach(r => {
    if (!connectionMap[r.sender_id]) {
      connectionMap[r.sender_id] = new Set()
    }
    if (!connectionMap[r.receiver_id]) {
      connectionMap[r.receiver_id] = new Set()
    }
    connectionMap[r.sender_id].add(r.receiver_id)
    connectionMap[r.receiver_id].add(r.sender_id)
  })

  const myConnections = connectionMap[user.id] ?? new Set()

  const mutualPreviewMap: Record<
    string,
    { count: number; previewIds: string[] }
  > = {}

  myConnections.forEach(otherId => {
    const theirConnections = connectionMap[otherId] ?? new Set()
    const mutualIds = Array.from(theirConnections).filter(id =>
      myConnections.has(id)
    )

    if (mutualIds.length > 0) {
      mutualPreviewMap[otherId] = {
        count: mutualIds.length,
        previewIds: mutualIds.slice(0, 3)
      }
    }
  })

  const userIds = Array.from(
    new Set(requests.flatMap(r => [r.sender_id, r.receiver_id]))
  )

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, job_title, company")
    .in("id", userIds)

  const eventIds = Array.from(new Set(requests.map(r => r.event_id)))

  const { data: events } = await supabase
    .from("events")
    .select("id, title")
    .in("id", eventIds)

  return (
    <NetworkingClient
      userId={user.id}
      connections={connections}
      received={received}
      sent={sent}
      profiles={profiles ?? []}
      events={events ?? []}
      mutualPreviewMap={mutualPreviewMap}
      onAccept={acceptRequest}
      onReject={rejectRequest}
    />
  )
}
