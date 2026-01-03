import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type EventStatus = "Upcoming" | "Ongoing" | "Past" | "Unknown"

function getEventStatus(
  startDate?: string | null,
  endDate?: string | null
): EventStatus {
  if (!startDate && !endDate) return "Unknown"

  const today = new Date()
  const start = startDate ? new Date(startDate) : null
  const end = endDate ? new Date(endDate) : null

  if (start && today < start) return "Upcoming"

  if (
    start &&
    end &&
    today >= start &&
    today <= end
  )
    return "Ongoing"

  if (end && today > end) return "Past"

  return "Unknown"
}

export default async function DashboardEventsPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: events, error } = await supabase
    .from("events")
    .select("id, title, start_date, end_date, created_at")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Breadcrumbs */}
        <nav className="text-sm text-zinc-500">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/dashboard" className="hover:text-black">
                Dashboard
              </Link>
            </li>
            <li>›</li>
            <li className="text-black font-medium">Events</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">My events</h1>
            <p className="text-sm text-zinc-500">
              Manage your events, agenda, announcements, and participants
            </p>
          </div>

          <Link
            href="/dashboard/events/create"
            className="rounded-md bg-black px-4 py-2 text-white"
          >
            Create event
          </Link>
        </div>

        {/* Events list */}
        {events.length === 0 ? (
          <div className="rounded-md border p-8 text-center text-sm text-zinc-500">
            You have not created any events yet
          </div>
        ) : (
          <div className="space-y-4">
            {events.map(event => {
              const status = getEventStatus(
                event.start_date,
                event.end_date
              )

              return (
                <div
                  key={event.id}
                  className="rounded-lg border bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {event.title}
                        </h3>

                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            status === "Upcoming"
                              ? "bg-blue-100 text-blue-700"
                              : status === "Ongoing"
                              ? "bg-green-100 text-green-700"
                              : status === "Past"
                              ? "bg-zinc-200 text-zinc-600"
                              : "bg-zinc-100 text-zinc-500"
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      {(event.start_date || event.end_date) && (
                        <p className="text-xs text-zinc-500">
                          {event.start_date ?? "?"}
                          {event.end_date
                            ? ` – ${event.end_date}`
                            : ""}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/events/${event.id}`}
                        className="rounded-md border px-3 py-1 text-sm"
                      >
                        Manage
                      </Link>

                      <Link
                        href={`/dashboard/events/${event.id}/announcements`}
                        className="rounded-md border px-3 py-1 text-sm"
                      >
                        Announcements
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
