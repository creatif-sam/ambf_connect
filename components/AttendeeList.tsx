"use client"

import { useState } from "react"
import { sendConnectionRequest } from "@/lib/queries/networking"

type Attendee = {
  id: string
  profile: {
    id: string
    full_name: string | null
  }
}

export default function AttendeeList({
  attendees,
  eventId
}: {
  attendees: Attendee[]
  eventId: string
}) {
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({})

  async function handleConnect(receiverId: string) {
    try {
      await sendConnectionRequest(eventId, receiverId)

      setSentRequests(prev => ({
        ...prev,
        [receiverId]: true
      }))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <ul className="space-y-3">
      {attendees.map(attendee => (
        <li
          key={attendee.id}
          className="border rounded p-3 flex justify-between"
        >
          <span>
            {attendee.profile.full_name ?? "Unnamed user"}
          </span>

          <button
            onClick={() => handleConnect(attendee.profile.id)}
            disabled={sentRequests[attendee.profile.id]}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            {sentRequests[attendee.profile.id]
              ? "Request sent"
              : "Connect"}
          </button>
        </li>
      ))}
    </ul>
  )
}
