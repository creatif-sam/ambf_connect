"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  PlusCircle,
  Clock,
  LayoutList,
  Eye,
  EyeOff
} from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { DAY_LABELS } from "@/lib/constants/agenda"

/* =========================
   HELPERS
   ========================= */
function formatTime(value: string) {
  return new Date(`1970-01-01T${value}`).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  })
}

export default function SessionsEditorPage() {
  const params = useParams()
  const eventId = params?.eventId as string | undefined
  const supabase = createSupabaseBrowserClient()

  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (!eventId) return
    fetchSessions()
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

    if (!error) setSessions(data ?? [])
    setLoading(false)
  }

  async function togglePublish(sessionId: string, nextState: boolean) {
    setUpdatingId(sessionId)

    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId
          ? { ...s, is_published: nextState }
          : s
      )
    )

    const { error } = await supabase
      .from("sessions")
      .update({ is_published: nextState })
      .eq("id", sessionId)

    if (error) {
      setSessions(prev =>
        prev.map(s =>
          s.id === sessionId
            ? { ...s, is_published: !nextState }
            : s
        )
      )
    }

    setUpdatingId(null)
  }

  if (!eventId) {
    return (
      <main className="p-6">
        <p className="text-sm text-gray-500">
          Event ID missing from route
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white"
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
            No sessions created yet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => (
            <div
              key={session.id}
              className="border rounded-xl p-5 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              {/* Info */}
              <div className="space-y-1">
                <h3 className="font-medium text-lg">
                  {session.title}
                </h3>

                <p className="text-sm text-gray-500">
                  {session.session_type} • {DAY_LABELS[session.day]}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {formatTime(session.start_time)} to {formatTime(session.end_time)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 items-center">
                <Link
                  href={`/dashboard/events/${eventId}/sessions/${session.id}`}
                  className="border rounded-lg px-3 py-2 text-sm"
                >
                  Edit
                </Link>

                <button
                  disabled={updatingId === session.id}
                  onClick={() =>
                    togglePublish(session.id, !session.is_published)
                  }
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition
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
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
