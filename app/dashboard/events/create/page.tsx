import { notFound } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type PageProps = {
  params: {
    slug: string
  }
}

type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
}

type EventMemberRow = {
  id: string
  role: "organizer" | "speaker" | "attendee"
  profiles: Profile[] | null
}

type Attendee = {
  id: string
  role: "organizer" | "speaker" | "attendee"
  profile: Profile
}

type NetworkingRow = {
  sender_id: string
  receiver_id: string
  status: "pending" | "accepted" | "rejected"
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = params

  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, title, description")
    .eq("slug", slug)
    .single()

  if (eventError || !event) {
    notFound()
  }

  const { data: members, error: membersError } = await supabase
    .from("event_members")
    .select(
      `
        id,
        role,
        profiles (
          id,
          full_name,
          avatar_url
        )
      `
    )
    .eq("event_id", event.id)

  if (membersError) {
    throw membersError
  }

  const attendees: Attendee[] = (members as EventMemberRow[] ?? [])
    .filter(m => m.profiles && m.profiles.length > 0)
    .map(m => ({
      id: m.id,
      role: m.role,
      profile: m.profiles![0]
    }))

  let networkingMap = new Map<
    string,
    {
      status: "pending" | "accepted" | "rejected"
      direction: "incoming" | "outgoing"
    }
  >()

  if (user) {
    const { data: networkingRows } = await supabase
      .from("networking_requests")
      .select("sender_id, receiver_id, status")
      .eq("event_id", event.id)
      .or(
        `sender_id.eq.${user.id},receiver_id.eq.${user.id}`
      )

    ;(networkingRows as NetworkingRow[] ?? []).forEach(n => {
      const isOutgoing = n.sender_id === user.id
      const otherUserId = isOutgoing ? n.receiver_id : n.sender_id

      networkingMap.set(otherUserId, {
        status: n.status,
        direction: isOutgoing ? "outgoing" : "incoming"
      })
    })
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">{event.title}</h1>
        {event.description && (
          <p className="mt-2 text-gray-600">{event.description}</p>
        )}
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          Attendees {attendees.length}
        </h2>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {attendees.map(attendee => {
            const networking = networkingMap.get(attendee.profile.id)

            return (
              <li
                key={attendee.id}
                className="border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                    {attendee.profile.avatar_url && (
                      <img
                        src={attendee.profile.avatar_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div>
                    <p className="font-medium">
                      {attendee.profile.full_name ?? "Unnamed user"}
                    </p>
                  </div>
                </div>

                <div>
                  {networking ? (
                    <span className="text-sm text-gray-600">
                      {networking.status}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">
                      Not connected
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}
