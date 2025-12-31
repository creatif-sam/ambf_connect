"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { DAY_LABELS } from "@/lib/constants/agenda"
import {
  PlusCircle,
  Clock,
  LayoutList,
  Eye,
  EyeOff
} from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

/* =========================
   HELPERS
   ========================= */

// Safe formatter for timestamptz
function formatTime(value?: string | null) {
  if (!value) return "--:--"
  const date = new Date(value)
  if (isNaN(date.getTime())) return "--:--"

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  })
}

export default function SessionsEditorPage() {
  const params = useParams()

  // Normalize eventId safely
  const eventId =
    typeof params?.eventId === "string"
      ? params.eventId
      : undefined

  const supabase = createSupabaseBrowserClient()

  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!eventId) return
    fetchSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  async function fetchSessions() {
    const { data, error } = await supabase
      .from("sessions")
      .select(`
        id,
        title,
        session_type,
        start_time,
        end_time,
        day,
        is_published
      `)
      .eq("event_id", eventId)
      .order("day", { ascending: true })
      .order("start_time", { ascending: true })

    if (error) {
      console.error("Failed to fetch sessions:", error)
      setSessions([])
    } else {
      setSessions(data ?? [])
    }

    setLoading(false)
  }

  /* =========================
     GUARDS
     ========================= */

  if (!eventId) {
    return (
      <main className="p-6">
        <p className="text-sm text-gray-500">
          Event ID missing from route.
        </p>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="p-6">
        <p>Loading sessions...</p>
      </main>
    )
  }

  /* =========================
     RENDER
     ========================= */

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">
            Sessions Editor
          </h1>
          <p className="text-sm text-gray-500">
            Manage program sessions for this event
          </p>
        </div>

        <Link
          href={`/dashboard/events/${eventId}/sessions/create`}
          className="
            inline-flex items-center gap-2
            px-4 py-2 rounded-lg
            bg-black text-white
            hover:bg-zinc-900
            transition
          "
        >
          <PlusCircle className="h-4 w-4" />
          Add session
        </Link>
      </header>

      {/* Sessions list */}
      {sessions.length === 0 ? (
        <div className="border rounded-xl p-8 text-center">
          <LayoutList className="h-10 w-10 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">
            No sessions created yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => (
            <div
              key={session.id}
              className="
                border rounded-xl p-5
                bg-white
                flex flex-col md:flex-row
                md:items-center md:justify-between
                gap-4
              "
            >
              {/* Session info */}
              <div className="space-y-1">
                <h3 className="font-medium text-lg">
                  {session.title}
                </h3>

                <p className="text-sm text-gray-500">
                  {session.session_type} •{" "}
                  {DAY_LABELS[session.day] ?? session.day}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {formatTime(session.start_time)} –{" "}
                  {formatTime(session.end_time)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/events/${eventId}/sessions/${session.id}`}
                  className="
                    inline-flex items-center gap-2
                    border rounded-lg px-3 py-2
                    text-sm
                    hover:border-black
                    transition
                  "
                >
                  Edit
                </Link>

                <span
                  className={`
                    inline-flex items-center gap-1
                    px-3 py-2 rounded-lg text-sm
                    ${
                      session.is_published
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }
                  `}
                >
                  {session.is_published ? (
                    <>
                      <Eye className="h-4 w-4" />
                      Published
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Draft
                    </>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
