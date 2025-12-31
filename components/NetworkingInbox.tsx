"use client"

import { useEffect, useState } from "react"
import {
  fetchIncomingRequests,
  updateRequestStatus
} from "@/lib/queries/networking"

export default function NetworkingInbox({ eventId }: { eventId: string }) {
  const [requests, setRequests] = useState<any[]>([])

  useEffect(() => {
    fetchIncomingRequests(eventId).then(setRequests)
  }, [eventId])

  async function handleAction(id: string, status: "accepted" | "rejected") {
    await updateRequestStatus(id, status)
    setRequests(prev => prev.filter(r => r.id !== id))
  }

  if (requests.length === 0) return null

  return (
    <section className="mt-8 border border-yellow-500 p-4 rounded">
      <h3 className="font-semibold text-black mb-3">
        Connection requests
      </h3>

      <div className="space-y-2">
        {requests.map(r => (
          <div
            key={r.id}
            className="flex justify-between items-center"
          >
            <p className="text-sm">
              {r.profiles.full_name ?? "Anonymous"}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => handleAction(r.id, "accepted")}
                className="text-green-600 text-sm"
              >
                Accept
              </button>
              <button
                onClick={() => handleAction(r.id, "rejected")}
                className="text-red-600 text-sm"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
