import { notFound } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getNetworkingMap } from "@/lib/queries/networking"

type PageProps = {
  params: Promise<{ slug: string }>
}

type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  title: string | null
  organization: string | null
}

type EventMemberRow = {
  id: string
  role: "organizer" | "attendee" | "speaker"
  profiles: Profile | null
}

type Attendee = {
  id: string
  role: EventMemberRow["role"]
  profile: Profile
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params

  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { data: event } = await supabase
    .from("events")
    .select("id, title, description")
    .eq("slug", slug)
    .single()

  if (!event) {
    notFound()
  }

  const { data: members } = await supabase
    .from("event_members")
    .select(
      `
        id,
        role,
        profiles (
          id,
          full_name,
          avatar_url,
          title,
          organization
        )
      `
    )
    .eq("event_id", event.id)
    .returns<EventMemberRow[]>()

  const attendees: Attendee[] = (members ?? [])
    .filter(m => m.profiles !== null)
    .map(m => ({
      id: m.id,
      role: m.role,
      profile: m.profiles as Profile
    }))

  const networkingRows = await getNetworkingMap(event.id, user.id)

  const networkingMap = new Map<
    string,
    {
      status: "pending" | "accepted" | "rejected"
      direction: "incoming" | "outgoing"
    }
  >()

  for (const row of networkingRows) {
    networkingMap.set(row.other_profile_id, {
      status: row.status,
      direction: row.direction
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

                    {(attendee.profile.title ||
                      attendee.profile.organization) && (
                      <p className="text-sm text-gray-500">
                        {[attendee.profile.title, attendee.profile.organization]
                          .filter(Boolean)
                          .join(" at ")}
                      </p>
                    )}
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
