import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/* =========================
   SERVER ACTIONS (TOP LEVEL)
   ========================= */

export async function respondToNetworkingRequest(
  requestId: string,
  decision: "accepted" | "rejected"
) {
  "use server"

  const supabase = await createSupabaseServerClient()

  await supabase
    .from("networking_requests")
    .update({ status: decision })
    .eq("id", requestId)

  revalidatePath("/networking")
}

/* =========================
   PAGE COMPONENT
   ========================= */

export default async function NetworkingPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="max-w-xl mx-auto p-8">
        <p>You must be logged in to view networking.</p>
      </main>
    )
  }

  /* Pending requests */
  const { data: pendingRequests } = await supabase
    .from("networking_requests")
    .select(`
      id,
      sender_id,
      profiles!networking_requests_sender_id_fkey (
        id,
        full_name
      ),
      events (
        title
      )
    `)
    .eq("receiver_id", user.id)
    .eq("status", "pending")

  /* Accepted connections */
  const { data: connections } = await supabase
    .from("networking_requests")
    .select(`
      id,
      sender_id,
      receiver_id,
      sender_profile:profiles!networking_requests_sender_id_fkey (
        id,
        full_name
      ),
      receiver_profile:profiles!networking_requests_receiver_id_fkey (
        id,
        full_name
      ),
      events (
        title
      )
    `)
    .eq("status", "accepted")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

  return (
    <main className="max-w-3xl mx-auto p-8 space-y-10">
      <h1 className="text-2xl font-semibold">
        Networking
      </h1>

      {/* Pending Requests */}
      <section className="space-y-4">
        <h2 className="text-xl font-medium">
          Pending Requests
        </h2>

        {!pendingRequests || pendingRequests.length === 0 ? (
          <p className="text-gray-500">
            No pending requests.
          </p>
        ) : (
          <ul className="space-y-3">
            {pendingRequests.map(req => (
              <li
                key={req.id}
                className="border rounded-lg p-4 flex justify-between items-center bg-white"
              >
                <div>
                  <p className="font-medium">
                    {req.profiles?.full_name || "Unnamed user"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Event: {req.events?.title}
                  </p>
                </div>

                <div className="flex gap-2">
                  <form action={respondToNetworkingRequest.bind(null, req.id, "accepted")}>
                    <button className="px-3 py-1 bg-black text-white rounded text-sm">
                      Accept
                    </button>
                  </form>

                  <form action={respondToNetworkingRequest.bind(null, req.id, "rejected")}>
                    <button className="px-3 py-1 border rounded text-sm">
                      Reject
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <hr />

      {/* Connections */}
      <section className="space-y-4">
        <h2 className="text-xl font-medium">
          My Connections
        </h2>

        {!connections || connections.length === 0 ? (
          <p className="text-gray-500">
            You have no connections yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {connections.map(conn => {
              const otherUser =
                conn.sender_id === user.id
                  ? conn.receiver_profile
                  : conn.sender_profile

              if (!otherUser) return null

              return (
                <li
                  key={conn.id}
                  className="border rounded-lg p-4 bg-white"
                >
                  <p className="font-medium">
                    {otherUser.full_name || "Unnamed user"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Connected via: {conn.events?.title}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}
