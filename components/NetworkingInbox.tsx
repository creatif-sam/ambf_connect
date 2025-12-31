"use client"

import { useEffect, useState } from "react"
import {
  fetchIncomingRequests,
  updateRequestStatus
} from "@/lib/queries/networking"

type IncomingRequest = {
  id: string
  senderProfile: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
  event: {
    id: string
    title: string
  } | null
}

export default function NetworkingInbox({ eventId }: { eventId: string }) {
  const [requests, setRequests] = useState<IncomingRequest[]>([])

  useEffect(() => {
    fetchIncomingRequests(eventId).then(raw => {
      const normalized: IncomingRequest[] = raw.map((r: any) => ({
        id: r.id,
        senderProfile: r.profiles?.[0] ?? {
          id: "",
          full_name: null,
          avatar_url: null
        },
        event: r.events?.[0] ?? null
      }))

      setRequests(normalized)
    })
  }, [eventId])

  async function handleAction(
    requestId: string,
    status: "accepted" | "rejected"
  ) {
    await updateRequestStatus(requestId, status)
    setRequests(prev => prev.filter(r => r.id !== requestId))
  }

  return (
    <section className="space-y-4">
      {requests.length === 0 ? (
        <p className="text-sm text-gray-500">
          No pending requests
        </p>
      ) : (
        requests.map(req => (
          <div
            key={req.id}
            className="border rounded p-4 flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                {req.senderProfile.avatar_url && (
                  <img
                    src={req.senderProfile.avatar_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div>
                <p className="font-medium">
                  {req.senderProfile.full_name ?? "Unnamed user"}
                </p>
                {req.event && (
                  <p className="text-sm text-gray-500">
                    Event: {req.event.title}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleAction(req.id, "accepted")}
                className="px-3 py-1 bg-black text-white rounded text-sm"
              >
                Accept
              </button>

              <button
                onClick={() => handleAction(req.id, "rejected")}
                className="px-3 py-1 border rounded text-sm"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </section>
  )
}
