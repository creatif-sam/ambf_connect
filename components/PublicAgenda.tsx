import { createSupabaseBrowserClient } from "@/lib/supabase/client"

type Props = {
  eventId: string
}

export default async function PublicAgenda({ eventId }: Props) {
  const supabase = createSupabaseBrowserClient()

  const { data: sessions, error } = await supabase
    .from("sessions")
    .select(`
      id,
      title,
      start_time,
      end_time,
      day,
      session_type
    `)
    .eq("event_id", eventId)
    .eq("is_published", true)
    .order("day", { ascending: true })
    .order("start_time", { ascending: true })

  if (error || !sessions || sessions.length === 0) {
    return (
      <p className="text-gray-500">
        Agenda not published yet.
      </p>
    )
  }

  const day1 = sessions.filter(s => s.day === "day1")
  const day2 = sessions.filter(s => s.day === "day2")

  return (
    <div className="space-y-8">
      <AgendaDay title="Day 1 – 16th" sessions={day1} />
      <AgendaDay title="Day 2 – 17th" sessions={day2} />
    </div>
  )
}

function AgendaDay({
  title,
  sessions
}: {
  title: string
  sessions: any[]
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-white">
        {title}
      </h2>

      {sessions.length === 0 && (
        <p className="text-sm text-gray-500">
          No sessions scheduled.
        </p>
      )}

      {sessions.map(s => (
        <div
          key={s.id}
          className="
            rounded-xl p-4
            bg-gradient-to-br from-black to-zinc-900
            border border-yellow-500/20
          "
        >
          <p className="text-xs text-yellow-500 mb-1">
            {s.session_type}
          </p>

          <p className="font-medium text-white">
            {s.title}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            {s.start_time} – {s.end_time}
          </p>
        </div>
      ))}
    </section>
  )
}
