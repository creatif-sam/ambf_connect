import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type PageProps = {
  params: Promise<{
    eventId: string
  }>
}

export default async function AdminAgendaPage({ params }: PageProps) {
  /* =====================================================
     NEXT 15 FIX: params is async and must be awaited
     ===================================================== */
  const { eventId } = await params

  if (!eventId) {
    throw new Error("Event ID is missing from route")
  }

  const supabase = await createSupabaseServerClient()

  /* =====================================================
     FETCH SESSIONS FOR THIS EVENT
     ===================================================== */
  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("event_id", eventId)
    .order("day", { ascending: true })
    .order("start_time", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  /* =====================================================
     SPLIT SESSIONS BY DAY
     ===================================================== */
  const day1 = sessions?.filter(s => s.day === "day1") ?? []
  const day2 = sessions?.filter(s => s.day === "day2") ?? []

  return (
    <main className="p-6 space-y-10">
      {/* ================= HEADER ================= */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Agenda Management
          </h1>
          <p className="text-sm text-gray-500">
            Create, edit, and publish sessions for this event
          </p>
        </div>

        <Link
          href={`/dashboard/events/${eventId}/sessions/create`}
          className="px-4 py-2 rounded-lg bg-black text-white"
        >
          Add session
        </Link>
      </header>

      {/* ================= DAY 1 ================= */}
      <AgendaDay
        title="Day 1 16th"
        sessions={day1}
        eventId={eventId}
      />

      {/* ================= DAY 2 ================= */}
      <AgendaDay
        title="Day 2 17th"
        sessions={day2}
        eventId={eventId}
      />
    </main>
  )
}

/* =====================================================
   AGENDA DAY SECTION
   ===================================================== */
function AgendaDay({
  title,
  sessions,
  eventId
}: {
  title: string
  sessions: any[]
  eventId: string
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">
        {title}
      </h2>

      {sessions.length === 0 && (
        <p className="text-sm text-gray-500">
          No sessions scheduled for this day
        </p>
      )}

      {sessions.map(session => (
        <div
          key={session.id}
          className="flex items-start justify-between rounded-xl border p-4"
        >
          {/* LEFT INFO */}
          <div className="space-y-1">
            <p className="text-sm text-gray-500">
              {session.start_time} to {session.end_time}
            </p>

            <p className="font-medium">
              {session.title}
            </p>

            <div className="flex gap-2 text-xs mt-1">
              <span className="px-2 py-0.5 rounded bg-gray-100">
                {session.session_type}
              </span>

              {!session.is_published && (
                <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">
                  Draft
                </span>
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <Link
            href={`/dashboard/events/${eventId}/sessions/${session.id}/edit`}
            className="text-sm underline"
          >
            Edit
          </Link>
        </div>
      ))}
    </section>
  )
}
