import Link from "next/link"
import { notFound } from "next/navigation"
import Image from "next/image"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type PageProps = {
  params: Promise<{
    eventId: string
  }>
}

type AttendeeRow = {
  id: string
  created_at: string
  profiles: {
    id: string
    full_name: string | null
    avatar_url: string | null
  } | null
}

export default async function EventAttendeesPage({
  params
}: PageProps) {
  const { eventId } = await params
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return null

  /* ================= VERIFY EVENT OWNERSHIP ================= */

  const { data: event } = await supabase
    .from("events")
    .select("id, title")
    .eq("id", eventId)
    .eq("created_by", user.id)
    .single()

  if (!event) {
    notFound()
  }

  /* ================= FETCH ATTENDEES ================= */

  const { data: attendees, error } = await supabase
    .from("event_members")
    .select(`
      id,
      created_at,
      profiles (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq("event_id", eventId)
    .eq("role", "attendee")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const typedAttendees = (attendees || []) as unknown as AttendeeRow[]

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* ================= BREADCRUMBS ================= */}
        <nav className="text-sm text-zinc-500">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/dashboard" className="hover:text-black">
                Dashboard
              </Link>
            </li>
            <li>›</li>
            <li>
              <Link
                href="/dashboard/events"
                className="hover:text-black"
              >
                Events
              </Link>
            </li>
            <li>›</li>
            <li>
              <Link
                href={`/dashboard/events/${event.id}`}
                className="hover:text-black"
              >
                {event.title}
              </Link>
            </li>
            <li>›</li>
            <li className="font-medium text-black">
              Attendees
            </li>
          </ol>
        </nav>

        {/* ================= HEADER ================= */}
        <div>
          <h1 className="text-2xl font-semibold">
            Attendees
          </h1>
          <p className="text-sm text-zinc-500">
            Participants registered for {event.title}
          </p>
        </div>
typedAttendees.length === 0 ? (
          <div className="rounded-md border p-8 text-center text-sm text-zinc-500">
            No attendees registered yet
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">
                    Participant
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Registered
                  </th>
                  <th className="px-4 py-3 font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {typedA
              <tbody>
                {attendees.map(item => (
                  <tr
                    key={item.id}
                    className="border-t"
                  >
                    {/* ================= AVATAR + NAME ================= */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.profiles?.avatar_url ? (
                          <Image
                            src={item.profiles.avatar_url}
                            alt={item.profiles.full_name ?? "User"}
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs text-zinc-500">
                            {item.profiles?.full_name
                              ?.charAt(0)
                              .toUpperCase() ?? "?"}
                          </div>
                        )}

                        <span>
                          {item.profiles?.full_name ??
                            "Unnamed user"}
                        </span>
                      </div>
                    </td>

                    {/* ================= DATE ================= */}
                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(
                        item.created_at
                      ).toLocaleDateString()}
                    </td>

                    {/* ================= ACTIONS ================= */}
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <Link
                          href="#"
                          className="rounded-md border px-3 py-1 text-xs"
                        >
                          View
                        </Link>

                        <RemoveAttendeeButton
                          memberId={item.id}
                          eventId={eventId}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* ================= REMOVE BUTTON ================= */

function RemoveAttendeeButton({
  memberId,
  eventId
}: {
  memberId: string
  eventId: string
}) {
  return (
    <form
      action={`/dashboard/events/${eventId}/attendees/remove`}
      method="post"
    >
      <input
        type="hidden"
        name="memberId"
        value={memberId}
      />

      <button
        type="submit"
        className="rounded-md border px-3 py-1 text-xs text-red-600 hover:border-red-600"
      >
        Remove
      </button>
    </form>
  )
}
