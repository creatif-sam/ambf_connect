"use client"

import { useState } from "react"
import Link from "next/link"
import { UserPlus, LogIn, X } from "lucide-react"
import EventCountdown from "@/components/EventCountdown"

type Event = {
  id: string
  title: string
  slug: string
  start_date: string
  end_date: string
  is_joined?: boolean
}

type Props = {
  events: Event[]
  isAuthenticated: boolean
}

export default function EventsClient({ events, isAuthenticated }: Props) {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [joiningEventId, setJoiningEventId] = useState<string | null>(null)

  async function handleJoinEvent(eventId: string) {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    setJoiningEventId(eventId)

    try {
      const response = await fetch("/api/events/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId })
      })

      if (response.ok) {
        // Reload to show updated state
        window.location.reload()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to join event")
      }
    } catch (error) {
      alert("Failed to join event")
    } finally {
      setJoiningEventId(null)
    }
  }

  return (
    <>
      <main className="max-w-6xl mx-auto px-6 py-14 text-white">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            Events
          </h1>
          <p className="mt-3 text-gray-400 max-w-xl">
            Exclusive conferences, forums, and curated professional gatherings.
          </p>
        </header>

        {/* Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {events?.map(event => (
            <div
              key={event.id}
              className="
                group relative rounded-2xl p-[1px]
                bg-gradient-to-br from-yellow-500/40 to-yellow-700/20
                transition-all duration-300
                hover:shadow-[0_0_40px_rgba(212,175,55,0.25)]
              "
            >
              <div className="
                relative h-full rounded-2xl bg-black
                p-6 flex flex-col
                transition-all duration-300
                group-hover:-translate-y-1
              ">
                {/* Top glow line */}
                <span className="
                  absolute top-0 left-0 h-[2px] w-full
                  bg-gradient-to-r from-transparent via-yellow-500 to-transparent
                  opacity-0 group-hover:opacity-100
                  transition-opacity
                " />

                <h2 className="
                  text-lg font-semibold text-white
                  group-hover:text-yellow-400
                  transition-colors
                ">
                  {event.title}
                </h2>

                <div className="mt-3">
                  <EventCountdown startDate={event.start_date} endDate={event.end_date} />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  {event.start_date} to {event.end_date}
                </p>

                <div className="mt-auto pt-6 space-y-3">
                  {/* View Event Link */}
                  <Link
                    href={`/events/${event.slug}`}
                    className="flex items-center justify-between text-sm font-medium text-yellow-500 group-hover:text-yellow-400"
                  >
                    <span>View event</span>
                    <span className="text-lg transform transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>

                  {/* Join Button */}
                  {event.is_joined ? (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600/20 text-green-400 text-sm font-medium border border-green-600/30 cursor-not-allowed"
                    >
                      <UserPlus size={16} />
                      Already Joined
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinEvent(event.id)}
                      disabled={joiningEventId === event.id}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-sm font-medium hover:from-yellow-500 hover:to-yellow-700 transition disabled:opacity-50"
                    >
                      <UserPlus size={16} />
                      {joiningEventId === event.id ? "Joining..." : "Join Event"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {events?.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No events are currently available.
          </div>
        )}
      </main>

      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative bg-gradient-to-br from-zinc-900 to-black border border-yellow-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl">
            {/* Close button */}
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                <LogIn className="h-8 w-8 text-black" />
              </div>
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold text-white text-center mb-3">
              Login Required
            </h2>
            <p className="text-gray-400 text-center mb-8">
              Please log in to join this event and access exclusive content.
            </p>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold hover:from-yellow-500 hover:to-yellow-700 transition"
              >
                <LogIn size={18} />
                Log in
              </Link>

              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full px-6 py-3 rounded-lg border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white transition"
              >
                No, thank you
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
