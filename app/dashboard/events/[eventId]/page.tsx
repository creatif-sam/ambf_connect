import Link from "next/link"
import { notFound } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type PageProps = {
  params: Promise<{
    eventId: string
  }>
}

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
  if (start && end && today >= start && today <= end)
    return "Ongoing"
  if (end && today > end) return "Past"

  return "Unknown"
}

export default async function EventOverviewPage({
  params
}: PageProps) {
  const { eventId } = await params
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return null

  /* ================= EVENT ================= */
  const { data: event, error } = await supabase
    .from("events")
    .select("id, title, slug, start_date, end_date, created_at")
    .eq("id", eventId)
    .eq("created_by", user.id)
    .single()

  if (error || !event) {
    notFound()
  }

  const status = getEventStatus(
    event.start_date,
    event.end_date
  )

  /* ================= QUICK STATS ================= */
  const [
    { count: attendeesCount },
    { count: sessionsCount },
    { count: announcementsCount }
  ] = await Promise.all([
    supabase
      .from("event_members")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id)
      .eq("role", "attendee"),

    supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id),

    supabase
      .from("announcements")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id)
  ])

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
            <li className="text-black font-medium">
              {event.title}
            </li>
          </ol>
        </nav>

        {/* ================= HEADER ================= */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">
              {event.title}
            </h1>

            <div className="mt-2 flex items-center gap-3">
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

              {(event.start_date || event.end_date) && (
                <span className="text-xs text-zinc-500">
                  {event.start_date ?? "?"}
                  {event.end_date
                    ? ` – ${event.end_date}`
                    : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ================= QUICK STATS ================= */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Attendees"
            value={attendeesCount ?? 0}
          />

          <StatCard
            label="Sessions"
            value={sessionsCount ?? 0}
          />

          <StatCard
            label="Announcements"
            value={announcementsCount ?? 0}
          />
        </section>

        {/* ================= MANAGEMENT ================= */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <OverviewCard
            title="Agenda"
            description="Manage event schedule"
            href={`/dashboard/events/${event.id}/agenda`}
          />

          <OverviewCard
            title="Sessions"
            description="Create and manage sessions"
            href={`/dashboard/events/${event.id}/sessions`}
          />

          <OverviewCard
            title="Announcements"
            description="Send updates to participants"
            href={`/dashboard/events/${event.id}/announcements`}
          />

          <OverviewCard
            title="Attendees"
            description="View and manage participants"
            href={`/dashboard/events/${event.id}/attendees`}
          />
        </section>
      </div>
    </div>
  )
}

/* ================= COMPONENTS ================= */

function StatCard({
  label,
  value
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">
        {value}
      </p>
    </div>
  )
}

function OverviewCard({
  title,
  description,
  href
}: {
  title: string
  description: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="
        rounded-xl border bg-white p-5
        hover:border-black transition
      "
    >
      <h3 className="font-medium">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500">
        {description}
      </p>
    </Link>
  )
}
