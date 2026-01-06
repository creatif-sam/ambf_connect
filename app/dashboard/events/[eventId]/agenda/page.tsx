import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { Plus, Clock, Edit2, Eye, EyeOff } from "lucide-react"

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
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition"
        >
          <Plus size={18} />
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
          className="flex items-start justify-between rounded-xl border border-gray-200 p-4 bg-white hover:border-gray-300 transition"
        >
          {/* LEFT INFO */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock size={14} />
              <span>{session.start_time} – {session.end_time}</span>
            </div>

            <p className="font-semibold text-gray-900">
              {session.title}
            </p>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 font-medium">
                {session.session_type}
              </span>

              {session.is_published ? (
                <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-700 font-medium">
                  <Eye size={12} />
                  Published
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-100 text-yellow-700 font-medium">
                  <EyeOff size={12} />
                  Draft
                </span>
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <Link
            href={`/dashboard/events/${eventId}/sessions/${session.id}/edit`}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition text-sm font-medium"
          >
            <Edit2 size={16} />
            Edit
          </Link>
        </div>
      ))}
    </section>
  )
}
