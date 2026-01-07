"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Check,
  X,
  MessageCircle
} from "lucide-react"

type Props = {
  userId: string
  connections: any[]
  received: any[]
  sent: any[]
  profiles: any[]
  allAttendees: any[]
  events: any[]
  mutualPreviewMap: Record<
    string,
    { count: number; previewIds: string[] }
  >
  onAccept: (id: string) => Promise<void>
  onReject: (id: string) => Promise<void>
}

export default function NetworkingClient({
  userId,
  connections,
  received,
  sent,
  profiles,
  allAttendees,
  events,
  mutualPreviewMap,
  onAccept,
  onReject
}: Props) {
  const [tab, setTab] = useState<
    "allAttendees" | "connections" | "received" | "sent"
  >("allAttendees")

  const [toast, setToast] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const profileMap = Object.fromEntries(
    profiles.map(p => [p.id, p])
  )

  const eventMap = Object.fromEntries(
    events.map(e => [e.id, e])
  )

  function showToast(
    type: "success" | "error",
    message: string
  ) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleAccept(id: string) {
    await onAccept(id)
    showToast("success", "Connection established")
  }

  async function handleReject(id: string) {
    await onReject(id)
    showToast("error", "Request declined")
  }

  function renderCards(
    list: any[],
    getOtherId: (r: any) => string,
    showActions = false
  ) {
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
          const mutual = mutualPreviewMap[otherId]

          return (
            <div
              key={r.id}
              className="rounded-xl bg-white p-4 shadow-sm"
            >
              <Link href={`/profiles/${otherId}`}>
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                    {profile?.avatar_url && (
                      <img
                        src={profile.avatar_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1">
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
              </Link>

              {mutual && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {mutual.previewIds.map(id => {
                      const p = profileMap[id]
                      return (
                        <div
                          key={id}
                          className="h-6 w-6 rounded-full bg-gray-300 overflow-hidden border-2 border-white"
                        >
                          {p?.avatar_url && (
                            <img
                              src={p.avatar_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <p className="text-xs text-blue-600">
                    {mutual.count} mutual connection
                    {mutual.count > 1 ? "s" : ""}
                  </p>
                </div>
              )}

              <p className="mt-1 text-xs text-gray-400">
                Event {eventMap[r.event_id]?.title}
              </p>

              <div className="mt-3 flex gap-2">
                {/* MESSAGE BUTTON */}
                <Link
                  href={`/messages/${otherId}`}
                  className="
                    flex-1 inline-flex items-center justify-center gap-1
                    py-1.5 rounded-md text-xs font-medium
                    bg-gradient-to-r from-yellow-400 via-yellow-500 to-black
                    text-black hover:opacity-90 transition
                  "
                >
                  <MessageCircle size={14} />
                  Message
                </Link>

                {showActions && (
                  <>
                    <button
                      onClick={() => handleAccept(r.id)}
                      className="
                        flex-1 inline-flex items-center justify-center gap-1
                        py-1.5 rounded-md
                        bg-green-600 text-white text-xs font-medium
                      "
                    >
                      <Check size={14} />
                      Connect
                    </button>

                    <button
                      onClick={() => handleReject(r.id)}
                      className="
                        flex-1 inline-flex items-center justify-center gap-1
                        py-1.5 rounded-md
                        border border-red-500 text-red-500
                        text-xs font-medium
                      "
                    >
                      <X size={14} />
                      Decline
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-8 bg-gray-50 min-h-screen">

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-lg px-4 py-2 text-sm text-white shadow ${
            toast.type === "success"
              ? "bg-green-600"
              : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex gap-6 border-b">
        {["allAttendees", "connections", "received", "sent"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`pb-3 text-sm font-medium ${
              tab === t
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            {t === "allAttendees" ? "All Attendees" : t === "received" ? "Requests" : t.charAt(0).toUpperCase() + t.slice(1)}
            {t === "received" && received.length > 0 && (
              <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-1.5">
                {received.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "allAttendees" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allAttendees.length === 0 ? (
            <p className="text-sm text-gray-500 col-span-full">No attendees found</p>
          ) : (
            allAttendees.map(profile => (
              <div
                key={profile.id}
                className="rounded-xl bg-white p-4 shadow-sm"
              >
                <Link href={`/profiles/${profile.id}`}>
                  <div className="flex items-center gap-3 cursor-pointer">
                    <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                      {profile.avatar_url && (
                        <img
                          src={profile.avatar_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="font-medium">
                        {profile.full_name ?? "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {[profile.job_title, profile.company]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    </div>
                  </div>
                </Link>

                <div className="mt-3">
                  <Link
                    href={`/messages/${profile.id}`}
                    className="
                      w-full inline-flex items-center justify-center gap-1
                      py-1.5 rounded-md text-xs font-medium
                      bg-gradient-to-r from-yellow-400 via-yellow-500 to-black
                      text-black hover:opacity-90 transition
                    "
                  >
                    <MessageCircle size={14} />
                    Message
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "connections" &&
        renderCards(connections, r =>
          r.sender_id === userId ? r.receiver_id : r.sender_id
        )}

      {tab === "received" &&
        renderCards(received, r => r.sender_id, true)}

      {tab === "sent" &&
        renderCards(sent, r => r.receiver_id)}

    </main>
  )
}
