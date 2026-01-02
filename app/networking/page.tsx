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

  const received = requests.filter(
    r => r.receiver_id === user.id && r.status === "pending"
  )

  const sent = requests.filter(
    r => r.sender_id === user.id && r.status === "pending"
  )

  const connections = requests.filter(
    r =>
      r.status === "accepted" &&
      (r.sender_id === user.id || r.receiver_id === user.id)
  )

  const userIds = Array.from(
    new Set(requests.flatMap(r => [r.sender_id, r.receiver_id]))
  )

  const eventIds = Array.from(new Set(requests.map(r => r.event_id)))

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, job_title, company")
    .in("id", userIds)

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
    />
  )
}
