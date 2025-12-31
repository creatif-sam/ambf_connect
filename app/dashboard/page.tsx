"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Calendar,
  PlusCircle,
  Users,
  Megaphone,
  LayoutList,
  Settings
} from "lucide-react"
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
      <main className="p-8">
        <p>Loading dashboard...</p>
      </main>
    )
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-10">
      {/* ================= HEADER ================= */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Manage events, agenda, sessions and announcements
          </p>
        </div>

        <Link
          href="/dashboard/events/create"
          className="
            inline-flex items-center gap-2
            px-4 py-2 rounded-lg
            bg-black text-white
            hover:bg-zinc-900
            transition
          "
        >
          <PlusCircle className="h-4 w-4" />
          Create event
        </Link>
      </header>

      {/* ================= GLOBAL ACTIONS ================= */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardAction
          title="All Attendees"
          description="View all registered participants across events"
          icon={Users}
          disabled
        />

        <DashboardAction
          title="Platform Settings"
          description="Global configuration and permissions"
          icon={Settings}
          disabled
        />

        <DashboardAction
          title="Broadcast Announcements"
          description="Send announcements to all events"
          icon={Megaphone}
          disabled
        />
      </section>

      {/* ================= EVENTS LIST ================= */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">
          My Events
        </h2>

        {events.length === 0 && (
          <p className="text-sm text-gray-500">
            No events created yet.
          </p>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {events.map(event => (
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
                <p className="text-sm text-gray-500">
                  {event.slug}
                </p>
                <span className="text-xs text-gray-400">
                  {event.is_published ? "Published" : "Draft"}
                </span>
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
        </div>
      </section>
    </main>
  )
}

/* ================= REUSABLE COMPONENTS ================= */

function DashboardAction({
  title,
  description,
  icon: Icon,
  disabled = false
}: any) {
  return (
    <div
      className={`
        border rounded-xl p-5
        flex gap-4 items-start
        ${
          disabled
            ? "opacity-40 cursor-not-allowed"
            : "hover:border-black transition"
        }
      `}
    >
      <Icon className="h-6 w-6 mt-1" />

      <div>
        <p className="font-medium">
          {title}
        </p>
        <p className="text-sm text-gray-500">
          {description}
        </p>
        {disabled && (
          <p className="text-xs text-gray-400 mt-1">
            Coming soon
          </p>
        )}
      </div>
    </div>
  )
}

function EventButton({
  href,
  icon: Icon,
  label
}: any) {
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
