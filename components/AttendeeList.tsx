"use client"

import { useState } from "react"
import { sendConnectionRequest } from "@/lib/queries/networking"

type Attendee = {
  role: string
  profiles: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
}

type Props = {
  attendees: Attendee[]
  eventId: string
}

export default function AttendeeList({ attendees, eventId }: Props) {
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({})

  async function handleConnect(receiverId: string) {
    try {
      await sendConnectionRequest(eventId, receiverId)
      setSentRequests(prev => ({
        ...prev,
        [receiverId]: true
      }))
    } catch (error) {
      console.error("Failed to send request", error)
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-black mb-4">
        Attendees ({attendees.length})
      </h2>

      <div className="space-y-3">
        {attendees.map(attendee => {
          const profile = attendee.profiles
          if (!profile) return null

          return (
            <div
              key={profile.id}
              className="flex items-center justify-between border border-yellow-500 rounded p-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-black text-yellow-500 flex items-center justify-center font-semibold">
                  {profile.full_name
                    ? profile.full_name.charAt(0).toUpperCase()
                    : "U"}
                </div>

                <div>
                  <p className="font-medium text-black">
                    {profile.full_name ?? "Anonymous"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {attendee.role}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleConnect(profile.id)}
                disabled={sentRequests[profile.id]}
                className="px-3 py-1 text-sm rounded bg-black text-yellow-500 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sentRequests[profile.id]
                  ? "Request sent"
                  : "Connect"}
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
