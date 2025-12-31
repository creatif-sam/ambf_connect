import {
  createSupabaseServerClient,
  createSupabaseActionClient
} from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getNetworkingMap } from "@/lib/queries/networking"
import { getIncomingRequests } from "@/lib/queries/networking-requests"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function EventDetailPage({ params }: PageProps) {
  // Next.js 16 params are async
  const { slug } = await params

  // READ ONLY Supabase client
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="max-w-xl mx-auto p-8">
        <p>You must be logged in to view this event.</p>
      </main>
    )
  }

  // Fetch event
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, title, description, start_date, end_date")
    .eq("slug", slug)
    .single()

  if (eventError || !event) {
    return (
      <main className="max-w-xl mx-auto p-8">
        <p>Event not found.</p>
      </main>
    )
  }

  // Check membership
  const { data: membership } = await supabase
    .from("event_members")
    .select("role")
    .eq("event_id", event.id)
    .eq("user_id", user.id)
    .maybeSingle()

  // Fetch attendees
  const { data: attendees } = await supabase
    .from("event_members")
    .select(`
      role,
      profiles (
        id,
        full_name
      )
    `)
    .eq("event_id", event.id)

  // Networking state
  const networkingMap = await getNetworkingMap(event.id, user.id)

  // Incoming connection requests
  const incomingRequests = await getIncomingRequests(event.id, user.id)

  /* ======================
     SERVER ACTIONS
     ====================== */

  async function joinEvent() {
    "use server"

    const supabase = await createSupabaseActionClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from("event_members").insert({
      event_id: event.id,
      user_id: user.id,
      role: "attendee"
    })

    revalidatePath(`/events/${slug}`)
  }

  async function connectUser(receiverId: string) {
    "use server"

    const supabase = await createSupabaseActionClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from("networking_requests").insert({
      event_id: event.id,
      sender_id: user.id,
      receiver_id: receiverId,
      status: "pending"
    })

    revalidatePath(`/events/${slug}`)
  }

  async function respondToRequest(
    requestId: string,
    decision: "accepted" | "declined"
  ) {
    "use server"

    const supabase = await createSupabaseActionClient()

    await supabase
      .from("networking_requests")
      .update({ status: decision })
      .eq("id", requestId)

    revalidatePath(`/events/${slug}`)
  }

  /* ======================
     UI
     ====================== */

  return (
    <main className="max-w-3xl mx-auto p-8 space-y-10">
      {/* Event header */}
      <section>
        <h1 className="text-3xl font-bold">{event.title}</h1>
        <p className="text-gray-600 mt-1">
          {event.start_date} to {event.end_date}
        </p>
        {event.description && (
          <p className="mt-4">{event.description}</p>
        )}
      </section>

      {/* Join status */}
      {!membership && (
        <form action={joinEvent}>
          <button className="px-6 py-3 rounded bg-black text-white">
            Join event
          </button>
        </form>
      )}

      {membership && (
        <p className="text-green-700">
          You are registered as {membership.role}
        </p>
      )}

      {/* Incoming requests */}
      {incomingRequests.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Connection Requests
          </h2>

          <ul className="space-y-3">
            {incomingRequests.map(req => (
              <li
                key={req.id}
                className="border rounded p-4 flex justify-between items-center"
              >
                <p className="font-medium">
                  {req.profiles?.full_name || "Unnamed user"}
                </p>

                <div className="flex gap-2">
                  <form
                    action={async () => {
                      "use server"
                      await respondToRequest(req.id, "accepted")
                    }}
                  >
                    <button className="px-3 py-1 bg-black text-white rounded text-sm">
                      Accept
                    </button>
                  </form>

                  <form
                    action={async () => {
                      "use server"
                      await respondToRequest(req.id, "declined")
                    }}
                  >
                    <button className="px-3 py-1 border rounded text-sm">
                      Decline
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <hr />

      {/* Attendees + networking */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Attendees</h2>

        {!attendees || attendees.length === 0 ? (
          <p className="text-gray-500">No attendees yet.</p>
        ) : (
          <ul className="space-y-3">
            {attendees.map((a, idx) => {
              const profile = a.profiles
              if (!profile) return null

              const isMe = profile.id === user.id
              const status = networkingMap[profile.id]

              return (
                <li
                  key={idx}
                  className="border rounded p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">
                      {profile.full_name || "Unnamed user"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {a.role}
                    </p>
                  </div>

                  {!isMe && (
                    <>
                      {status === "pending" && (
                        <span className="text-sm text-gray-400">
                          Pending
                        </span>
                      )}

                      {status === "accepted" && (
                        <span className="text-sm text-green-600">
                          Connected
                        </span>
                      )}

                      {!status && (
                        <form
                          action={async () => {
                            "use server"
                            await connectUser(profile.id)
                          }}
                        >
                          <button className="px-3 py-1 border rounded text-sm">
                            Connect
                          </button>
                        </form>
                      )}
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}
