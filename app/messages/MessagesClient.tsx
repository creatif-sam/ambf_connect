"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

type Props = {
  meId: string
  initialConversations: any[]
}

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
    initialConversations ?? []
  )

  useEffect(() => {
    const channel = supabase
      .channel("inbox-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        async () => {
          const res = await fetch("/api/messages/inbox")
          if (res.ok) {
            const data = await res.json()
            setConversations(data)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="h-full bg-white flex flex-col">

      {/* HEADER */}
      <div className="px-4 py-3 bg-black text-yellow-400 font-semibold">
        Messages
      </div>

      {/* INBOX */}
      <div className="flex-1 overflow-y-auto divide-y">
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

              <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                {c.avatar_url && (
                  <img
                    src={c.avatar_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

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

              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-gray-400">
                  {formatDate(c.last_message_at)}
                </span>

                {c.unread_count > 0 && (
                  <span className="min-w-[18px] h-[18px] rounded-full bg-gradient-to-r from-yellow-400 to-black text-white text-[10px] flex items-center justify-center font-semibold">
                    {c.unread_count}
                  </span>
                )}
              </div>

            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}
