"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { sendMessageClient } from "@/lib/queries/messages.client"

type Props = {
  meId: string
  otherUser: any
  initialMessages: any[]
}

/* deterministic time formatter */
function formatTime(dateString: string) {
  const d = new Date(dateString)
  return `${d.getUTCHours().toString().padStart(2, "0")}:${d
    .getUTCMinutes()
    .toString()
    .padStart(2, "0")}`
}

export default function ConversationClient({
  meId,
  otherUser,
  initialMessages
}: Props) {
  const supabase = createSupabaseBrowserClient()
  const [messages, setMessages] = useState(initialMessages)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  /* auto scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  /* realtime subscription */
  useEffect(() => {
    const channel = supabase
      .channel(`messages-${meId}-${otherUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages"
        },
        payload => {
          const m = payload.new

          const isRelevant =
            (m.sender_id === meId &&
              m.receiver_id === otherUser.id) ||
            (m.sender_id === otherUser.id &&
              m.receiver_id === meId)

          if (!isRelevant) return

          setMessages(prev => {
            if (prev.some(p => p.id === m.id)) {
              return prev
            }
            return [...prev, m]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [meId, otherUser.id, supabase])

  return (
    <main className="h-screen flex flex-col bg-[#efeae2]">

      {/* HEADER */}
      <header className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-yellow-400 via-yellow-500 to-black">
        <Link href="/messages" className="text-black">
          <ArrowLeft size={20} />
        </Link>

        <div className="h-9 w-9 rounded-full bg-black/20 overflow-hidden">
          {otherUser?.avatar_url && (
            <img
              src={otherUser.avatar_url}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <p className="font-semibold text-sm text-white">
          {otherUser?.full_name}
        </p>
      </header>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {messages.map(m => {
          const isMe = m.sender_id === meId

          return (
            <div
              key={m.id}
              className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                isMe
                  ? "ml-auto bg-[#dcf8c6]"
                  : "mr-auto bg-white"
              }`}
            >
              {m.content}
              <div className="mt-1 text-[10px] text-gray-500 text-right">
                {formatTime(m.created_at)}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <form
        onSubmit={async e => {
          e.preventDefault()
          const form = e.currentTarget
          const input = form.content as HTMLInputElement

          await sendMessageClient(
            meId,
            otherUser.id,
            input.value
          )

          input.value = ""
        }}
        className="flex items-center gap-2 px-3 py-2 bg-[#f0f0f0]"
      >
        <input
          name="content"
          required
          placeholder="Type a message"
          className="flex-1 rounded-full px-4 py-2 text-sm outline-none border"
        />

        <button
          type="submit"
          className="px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-black text-black text-sm font-medium"
        >
          Send
        </button>
      </form>

    </main>
  )
}
