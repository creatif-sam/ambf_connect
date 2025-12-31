import Link from "next/link"
import { Lock, Users, ArrowRight } from "lucide-react"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function NetworkingPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  /* =========================
     UNAUTHENTICATED VIEW
     ========================= */
  if (!user) {
    return (
      <main className="
        min-h-[calc(100vh-64px)]
        flex items-center justify-center
        bg-gradient-to-br from-black via-zinc-900 to-black
        px-6
      ">
        <div className="
          max-w-lg w-full
          rounded-2xl
          border border-yellow-500/20
          bg-gradient-to-br from-zinc-900 to-black
          p-10
          text-center
          shadow-2xl
        ">
          {/* Icon */}
          <div className="
            mx-auto h-20 w-20 rounded-full
            flex items-center justify-center
            bg-gradient-to-br from-yellow-400 to-yellow-600
            text-black
            animate-lock-reveal animate-gold-pulse
          ">
            <Users className="h-9 w-9" />
          </div>

          {/* Title */}
          <h1 className="mt-6 text-3xl font-bold text-white">
            Networking is locked
          </h1>

          {/* Theme */}
          <p className="mt-2 text-yellow-400 font-medium">
            Beyond the game, build the economy
          </p>

          {/* Description */}
          <p className="mt-4 text-gray-400 leading-relaxed">
            AMBF Connect networking allows you to discover professionals,
            send connection requests, and build strategic relationships
            across events and forums.
          </p>

          {/* CTA */}
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/auth/login"
              className="
                inline-flex items-center justify-center gap-2
                rounded-lg
                bg-gradient-to-r from-yellow-400 to-yellow-600
                px-6 py-3
                font-medium
                text-black
                hover:opacity-90
                transition
              "
            >
              Unlock networking
              <ArrowRight className="h-4 w-4" />
            </Link>

            <p className="text-xs text-gray-500">
              Access is limited to authenticated participants
            </p>
          </div>
        </div>
      </main>
    )
  }

  /* =========================
     AUTHENTICATED VIEW
     ========================= */

  /* 1. Fetch networking edges */
  const { data: requests } = await supabase
    .from("networking_requests")
    .select("id, sender_id, receiver_id, status, event_id")

  if (!requests || requests.length === 0) {
    return (
      <main className="max-w-4xl mx-auto p-8">
        <p>No networking activity yet.</p>
      </main>
    )
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

  /* 7. Render authenticated networking */
  return (
    <main className="max-w-4xl mx-auto p-8 space-y-10">
      <h1 className="text-2xl font-semibold">My Network</h1>

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
