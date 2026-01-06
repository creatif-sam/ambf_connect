"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Trash2, Eye } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

type AttendeeRow = {
  id: string
  user_id: string
  event_id: string
  profiles: {
    full_name: string | null
  } | null
  events: {
    title: string
  } | null
}

export default function AttendeesPage() {
  const supabase = createSupabaseBrowserClient()

  const [attendees, setAttendees] = useState<AttendeeRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAttendees() {
      const { data, error } = await supabase
        .from("event_members")
        .select(`
          id,
          user_id,
          event_id,
          profiles!inner (
            full_name
          ),
          events!inner (
            title
          )
        `)
        .order("created_at", { ascending: false })

      if (!error && data) {
        setAttendees(data as AttendeeRow[])
      }

      setLoading(false)
    }

    loadAttendees()
  }, [supabase])

  async function removeAttendee(id: string) {
    const confirmed = confirm(
      "Remove this participant from the event?"
    )
    if (!confirmed) return

    const { error } = await supabase
      .from("event_members")
      .delete()
      .eq("id", id)

    if (!error) {
      setAttendees(prev =>
        prev.filter(a => a.id !== id)
      )
    } else {
      alert("Failed to remove participant")
    }
  }

  if (loading) {
    return (
      <main className="p-8">
        <p className="text-sm text-zinc-500">
          Loading participants…
        </p>
      </main>
    )
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">
          All Participants
        </h1>
        <p className="text-sm text-zinc-500">
          Manage participants across all events
        </p>
      </header>

      {attendees.length === 0 && (
        <p className="text-sm text-zinc-500">
          No participants found.
        </p>
      )}

      {attendees.length > 0 && (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-4 py-3 text-left">
                  Name
                </th>
                <th className="px-4 py-3 text-left">
                  Event
                </th>
                <th className="px-4 py-3 text-left">
                  Role
                </th>
                <th className="px-4 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {attendees.map(item => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3">
                    {item.profiles?.full_name ??
                      "Unnamed participant"}
                  </td>

                  <td className="px-4 py-3">
                    {item.events?.title ??
                      "Unknown event"}
                  </td>

                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                      Attendee
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/events/${item.event_id}/attendees`}
                        className="rounded-md border p-2 hover:border-black"
                        title="View event attendees"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      <button
                        onClick={() =>
                          removeAttendee(item.id)
                        }
                        className="rounded-md border p-2 text-red-600 hover:border-red-600"
                        title="Remove participant"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
