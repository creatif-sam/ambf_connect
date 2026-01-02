"use client"

import { useState } from "react"
import Link from "next/link"

type Props = {
  userId: string
  connections: any[]
  received: any[]
  sent: any[]
  profiles: any[]
  events: any[]
}

export default function NetworkingClient({
  userId,
  connections,
  received,
  sent,
  profiles,
  events
}: Props) {
  const [tab, setTab] = useState<
    "recommended" | "connections" | "received" | "sent"
  >("recommended")

  const profileMap = Object.fromEntries(
    profiles.map(p => [p.id, p])
  )

  const eventMap = Object.fromEntries(
    events.map(e => [e.id, e])
  )

  function renderCards(list: any[], getOtherId: (r: any) => string) {
    if (list.length === 0) {
      return (
        <p className="text-sm text-gray-500">
          Nothing to show
        </p>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(r => {
          const otherId = getOtherId(r)
          const profile = profileMap[otherId]

          return (
            <Link
              key={r.id}
              href={`/profiles/${otherId}`}
              className="rounded-xl bg-white p-4 shadow-sm hover:shadow transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                  {profile?.avatar_url && (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div>
                  <p className="font-medium">
                    {profile?.full_name ?? "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {[profile?.job_title, profile?.company]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                </div>
              </div>

              <p className="mt-2 text-xs text-gray-400">
                Event: {eventMap[r.event_id]?.title}
              </p>
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-8 bg-gray-50 min-h-screen">

      {/* Tabs */}
      <div className="flex gap-6 border-b">
        <button
          onClick={() => setTab("recommended")}
          className={`pb-3 text-sm font-medium ${
            tab === "recommended"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Recommended
          <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-1.5">
            {connections.length}
          </span>
        </button>

        <button
          onClick={() => setTab("connections")}
          className={`pb-3 text-sm font-medium ${
            tab === "connections"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Connections
        </button>

        <button
          onClick={() => setTab("received")}
          className={`pb-3 text-sm font-medium ${
            tab === "received"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Requests
          {received.length > 0 && (
            <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-1.5">
              {received.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setTab("sent")}
          className={`pb-3 text-sm font-medium ${
            tab === "sent"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Sent
        </button>
      </div>

      {/* Content */}
      {tab === "recommended" &&
        renderCards(connections, r =>
          r.sender_id === userId ? r.receiver_id : r.sender_id
        )}

      {tab === "connections" &&
        renderCards(connections, r =>
          r.sender_id === userId ? r.receiver_id : r.sender_id
        )}

      {tab === "received" &&
        renderCards(received, r => r.sender_id)}

      {tab === "sent" &&
        renderCards(sent, r => r.receiver_id)}

    </main>
  )
}
