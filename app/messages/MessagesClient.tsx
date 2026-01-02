"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

type Props = {
  meId: string
  initialConversations: any[]
}

/* deterministic date */
function formatDate(date: string) {
  const d = new Date(date)
  return d.toLocaleDateString("en-GB")
}

export default function MessagesClient({
  meId,
  initialConversations
}: Props) {
  const supabase = createSupabaseBrowserClient()
  const [conversations, setConversations] = useState(
    initialConversations
  )

  /* =========================
     REALTIME INBOX UPDATES
     ========================= */
  useEffect(() => {
    const channel = supabase
      .channel("inbox-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages"
        },
        () => {
          fetch("/api/messages/inbox")
            .then(r => r.json())
            .then(data => setConversations(data))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <main className="max-w-md mx-auto bg-white min-h-screen">

      {/* HEADER */}
      <header className="px-4 py-3 bg-black text-yellow-400 text-center font-semibold">
        Messages
      </header>

      {/* INBOX */}
      <div className="divide-y">
        {conversations.length === 0 && (
          <p className="p-6 text-sm text-gray-500 text-center">
            No conversations yet
          </p>
        )}

        {conversations.map(c => (
          <Link
            key={c.other_user_id}
            href={`/messages/${c.other_user_id}`}
            className="block hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3 px-4 py-3">

              {/* AVATAR */}
              <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                {c.avatar_url && (
                  <img
                    src={c.avatar_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              {/* CONTENT */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {c.full_name}
                </p>

                <p
                  className={`text-sm truncate ${
                    c.unread_count > 0
                      ? "font-semibold text-black"
                      : "text-gray-500"
                  }`}
                >
                  {c.last_message}
                </p>
              </div>

              {/* META */}
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-gray-400">
                  {formatDate(c.last_message_at)}
                </span>

                {c.unread_count > 0 && (
                  <span
                    className="
                      min-w-[18px] h-[18px]
                      rounded-full
                      bg-gradient-to-r from-yellow-400 to-black
                      text-white
                      text-[10px]
                      flex items-center justify-center
                      font-semibold
                    "
                  >
                    {c.unread_count}
                  </span>
                )}
              </div>

            </div>
          </Link>
        ))}
      </div>

    </main>
  )
}
