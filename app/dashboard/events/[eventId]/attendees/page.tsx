import Link from "next/link"
import { notFound } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type PageProps = {
  params: Promise<{
    eventId: string
  }>
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

  // Verify event ownership
  const { data: event } = await supabase
    .from("events")
    .select("id, title")
    .eq("id", eventId)
    .eq("created_by", user.id)
    .single()

  if (!event) {
    notFound()
  }

  // Fetch attendees
  const { data: attendees, error } = await supabase
    .from("event_members")
    .select(`
      id,
      created_at,
      profiles (
        id,
        full_name
      )
    `)
    .eq("event_id", eventId)
    .eq("role", "attendee")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Breadcrumbs */}
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
            <li className="text-black font-medium">
              Attendees
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">
            Attendees
          </h1>
          <p className="text-sm text-zinc-500">
            Participants registered for {event.title}
          </p>
        </div>

        {/* Attendees table */}
        {attendees.length === 0 ? (
          <div className="rounded-md border p-8 text-center text-sm text-zinc-500">
            No attendees registered yet
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">
                    Name
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
                {attendees.map(item => (
                  <tr
                    key={item.id}
                    className="border-t"
                  >
                    <td className="px-4 py-3">
                      {item.profiles?.full_name ??
                        "Unnamed user"}
                    </td>

                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(
                        item.created_at
                      ).toLocaleDateString()}
                    </td>

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
        className="rounded-md border px-3 py-1 text-xs text-red-600"
      >
        Remove
      </button>
    </form>
  )
}
