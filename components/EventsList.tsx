"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Calendar,
  PlusCircle,
  Megaphone,
  LayoutList,
  Settings
} from "lucide-react"
import { fetchMyEvents } from "@/lib/queries/myEvents"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export default function EventsList() {
  const supabase = createSupabaseBrowserClient()
  const [events, setEvents] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetchMyEvents()
      .then(setEvents)
      .finally(() => setFetching(false))
  }, [])

  async function togglePublish(
    eventId: string,
    currentValue: boolean
  ) {
    // optimistic update
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? { ...ev, is_published: !currentValue }
          : ev
      )
    )

    const { error } = await supabase
      .from("events")
      .update({ is_published: !currentValue })
      .eq("id", eventId)

    if (error) {
      // rollback on failure
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventId
            ? { ...ev, is_published: currentValue }
            : ev
        )
      )
      alert("Failed to update publish status")
    }
  }

  if (fetching) {
    return (
      <div className="text-sm text-zinc-500">
        Loading events...
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Create Event Card */}
      <Link
        href="/dashboard/events/create"
        className="
          border-dashed border-2 rounded-xl p-5
          flex flex-col items-center justify-center
          text-center
          text-gray-500
          hover:border-black hover:text-black
          transition
        "
      >
        <PlusCircle className="h-8 w-8 mb-2" />
        <p className="font-medium">Create new event</p>
        <p className="text-sm">
          Set up a new conference or meeting
        </p>
      </Link>

      {/* Existing Events */}
      {events.map((event) => (
        <div
          key={event.id}
          className="
            border rounded-xl p-5
            bg-white
            space-y-4
          "
        >
          {/* Event Info */}
          <div>
            <h3 className="font-semibold text-lg">
              {event.title}
            </h3>

            {event.start_date && (
              <p className="text-sm text-gray-500">
                {event.start_date}
                {event.end_date ? ` – ${event.end_date}` : ""}
              </p>
            )}

            {/* Status badge + toggle */}
            <div className="mt-2 flex items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  event.is_published
                    ? "bg-green-100 text-green-700"
                    : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {event.is_published ? "Published" : "Draft"}
              </span>

              <button
                type="button"
                onClick={() =>
                  togglePublish(event.id, event.is_published)
                }
                className={`
                  relative inline-flex h-5 w-9
                  items-center rounded-full
                  transition-colors
                  ${
                    event.is_published
                      ? "bg-green-600"
                      : "bg-zinc-300"
                  }
                `}
                aria-label="Toggle publish status"
              >
                <span
                  className={`
                    inline-block h-4 w-4
                    transform rounded-full bg-white
                    transition-transform
                    ${
                      event.is_published
                        ? "translate-x-4"
                        : "translate-x-1"
                    }
                  `}
                />
              </button>
            </div>
          </div>

          {/* Event Actions */}
          <div className="grid grid-cols-2 gap-3">
            <EventButton
              href={`/dashboard/events/${event.id}`}
              icon={Settings}
              label="Manage event"
            />

            <EventButton
              href={`/dashboard/events/${event.id}/agenda`}
              icon={Calendar}
              label="Agenda"
            />

            <EventButton
              href={`/dashboard/events/${event.id}/sessions`}
              icon={LayoutList}
              label="Sessions"
            />

            <EventButton
              href={`/dashboard/events/${event.id}/announcements`}
              icon={Megaphone}
              label="Announcements"
            />
          </div>
        </div>
      ))}

      {events.length === 0 && (
        <p className="text-sm text-gray-500 col-span-2">
          You have not created any events yet.
        </p>
      )}
    </div>
  )
}

function EventButton({
  href,
  icon: Icon,
  label
}: {
  href: string
  icon: any
  label: string
}) {
  return (
    <Link
      href={href}
      className="
        flex items-center gap-2
        border rounded-lg px-3 py-2
        text-sm
        hover:border-black
        transition
      "
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  )
}
