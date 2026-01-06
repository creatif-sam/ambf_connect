"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, X, Clock, User } from "lucide-react"
import type { PendingUser } from "@/lib/queries/pendingMembers"

type Props = {
  initialUsers: PendingUser[]
}

// Consistent date formatting for SSR/CSR
function formatDate(dateString: string) {
  const date = new Date(dateString)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

export default function PendingUsersList({ initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers)
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  async function handleAction(
    userId: string,
    action: "approve" | "reject"
  ) {
    setLoading((prev) => ({ ...prev, [userId]: true }))

    try {
      const res = await fetch("/api/members/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update user status")
      }

      const result = await res.json()
      
      // Show email status
      if (action === "approve") {
        if (result.emailSent) {
          alert(`User approved! Approval email sent successfully.`)
        } else if (result.emailError) {
          alert(`User approved, but email failed to send: ${result.emailError}`)
        } else {
          alert(`User approved! (No email address on file)`)
        }
      }

      // Remove from list on success
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (error) {
      console.error("Error:", error)
      alert(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setLoading((prev) => ({ ...prev, [userId]: false }))
    }
  }

  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-zinc-50 p-8 text-center">
        <Clock className="mx-auto h-12 w-12 text-zinc-400 mb-3" />
        <p className="text-sm text-zinc-500">
          No pending registrations at this time
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between gap-4 rounded-lg border bg-white p-4 hover:border-zinc-300 transition"
        >
          {/* User Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.full_name || "User"}
                width={40}
                height={40}
                className="rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-zinc-500" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {user.full_name || "Unnamed user"}
              </p>
              {user.email && (
                <p className="text-xs text-zinc-500 truncate">
                  {user.email}
                </p>
              )}
              {(user.job_title || user.company) && (
                <p className="text-xs text-zinc-400 truncate">
                  {[user.job_title, user.company].filter(Boolean).join(" at ")}
                </p>
              )}
              <p className="text-xs text-zinc-400 mt-0.5">
                Registered {formatDate(user.created_at)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => handleAction(user.id, "approve")}
              disabled={loading[user.id]}
              className="
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md
                bg-green-600 text-white text-sm font-medium
                hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed
                transition
              "
              title="Approve user"
            >
              <Check className="h-4 w-4" />
              <span className="hidden sm:inline">Approve</span>
            </button>

            <button
              onClick={() => handleAction(user.id, "reject")}
              disabled={loading[user.id]}
              className="
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md
                border border-red-300 text-red-600 text-sm font-medium
                hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed
                transition
              "
              title="Reject user"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Reject</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
