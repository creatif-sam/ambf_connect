import { createSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function NetworkingPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return <p className="p-8">You must be logged in.</p>
  }

  /* 1. Fetch networking edges */
  const { data: requests } = await supabase
    .from("networking_requests")
    .select("id, sender_id, receiver_id, status, event_id")

  if (!requests || requests.length === 0) {
    return <p className="p-8">No networking activity.</p>
  }

  /* 2. Separate states */
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

  /* 3. Collect IDs */
  const userIds = Array.from(
    new Set(
      requests.flatMap(r => [r.sender_id, r.receiver_id])
    )
  )

  const eventIds = Array.from(
    new Set(requests.map(r => r.event_id))
  )

  /* 4. Fetch profiles */
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", userIds)

  /* 5. Fetch events */
  const { data: events } = await supabase
    .from("events")
    .select("id, title")
    .in("id", eventIds)

  /* 6. Build maps */
  const profileMap = Object.fromEntries(
    (profiles ?? []).map(p => [p.id, p])
  )

  const eventMap = Object.fromEntries(
    (events ?? []).map(e => [e.id, e])
  )

  /* 7. Render */
  return (
    <main className="max-w-4xl mx-auto p-8 space-y-10">
      <h1 className="text-2xl font-semibold">My Network</h1>

      {/* Connections */}
      <section>
        <h2 className="text-xl mb-3">Connections</h2>
        {connections.map(r => {
          const otherId =
            r.sender_id === user.id
              ? r.receiver_id
              : r.sender_id

          return (
            <div key={r.id} className="border p-4 rounded mb-2">
              <p className="font-medium">
                {profileMap[otherId]?.full_name ?? "Unknown"}
              </p>
              <p className="text-sm text-gray-500">
                Event: {eventMap[r.event_id]?.title}
              </p>
            </div>
          )
        })}
      </section>

      {/* Received */}
      <section>
        <h2 className="text-xl mb-3">Received requests</h2>
        {received.map(r => (
          <div key={r.id} className="border p-4 rounded mb-2">
            <p className="font-medium">
              {profileMap[r.sender_id]?.full_name}
            </p>
            <p className="text-sm text-gray-500">
              Event: {eventMap[r.event_id]?.title}
            </p>
          </div>
        ))}
      </section>

      {/* Sent */}
      <section>
        <h2 className="text-xl mb-3">Sent requests</h2>
        {sent.map(r => (
          <div key={r.id} className="border p-4 rounded mb-2">
            <p className="font-medium">
              {profileMap[r.receiver_id]?.full_name}
            </p>
            <p className="text-sm text-gray-500">
              Event: {eventMap[r.event_id]?.title}
            </p>
          </div>
        ))}
      </section>
    </main>
  )
}
