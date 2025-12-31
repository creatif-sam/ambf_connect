"use client"

import { useEffect, useState } from "react"
import { useRequireAuth } from "@/hooks/useRequireAuth"
import { fetchMyEvents } from "@/lib/queries/myEvents"

export default function DashboardPage() {
  const { loading } = useRequireAuth()
  const [events, setEvents] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetchMyEvents()
      .then(setEvents)
      .finally(() => setFetching(false))
  }, [])

  if (loading || fetching) {
    return (
      <main className="p-4">
        <p>Loading dashboard...</p>
      </main>
    )
  }

  return (
    <main className="p-4">
      <h1 className="text-xl font-semibold mb-4">My Events</h1>

      <a
        href="/dashboard/events/create"
        className="inline-block mb-4 border px-3 py-1 rounded"
      >
        Create new event
      </a>

      {events.length === 0 && (
        <p className="text-sm text-gray-500">No events created yet.</p>
      )}

      <div className="space-y-3">
        {events.map(event => (
          <div key={event.id} className="border p-3 rounded">
            <h2 className="font-medium">{event.title}</h2>
            <p className="text-sm text-gray-500">{event.slug}</p>
            <p className="text-xs text-gray-400">
              {event.is_published ? "Published" : "Draft"}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}
