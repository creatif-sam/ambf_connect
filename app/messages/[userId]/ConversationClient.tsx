"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

type Props = {
  meId: string
  otherUser: any
  initialMessages: any[]
}

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
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeout = useRef<NodeJS.Timeout | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const roomId =
    meId < otherUser.id
      ? `${meId}:${otherUser.id}`
      : `${otherUser.id}:${meId}`

  /* auto scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  /* realtime messages */
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages"
        },
        payload => {
          const m = payload.new

          const relevant =
            (m.sender_id === meId &&
              m.receiver_id === otherUser.id) ||
            (m.sender_id === otherUser.id &&
              m.receiver_id === meId)

          if (!relevant) return

          setMessages(prev =>
            prev.some(p => p.id === m.id)
              ? prev
              : [...prev, m]
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, meId, otherUser.id, roomId])

  /* typing indicator */
  useEffect(() => {
    const channel = supabase
      .channel(`typing:${roomId}`)
      .on("broadcast", { event: "typing" }, payload => {
        if (payload.payload.userId === otherUser.id) {
          setIsTyping(true)

          if (typingTimeout.current) {
            clearTimeout(typingTimeout.current)
          }

          typingTimeout.current = setTimeout(() => {
            setIsTyping(false)
          }, 2000)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, otherUser.id, roomId])

  async function notifyTyping() {
    await supabase.channel(`typing:${roomId}`).send({
      type: "broadcast",
      event: "typing",
      payload: { userId: meId }
    })
  }

  async function handleSend(content: string) {
    await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiverId: otherUser.id,
        content
      })
    })
  }

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

        <div className="flex flex-col">
          <p className="font-semibold text-sm text-white">
            {otherUser.full_name}
          </p>
          {isTyping && (
            <span className="text-xs text-black/80">
              typing…
            </span>
          )}
        </div>
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

        {isTyping && (
          <div className="mr-auto bg-white px-3 py-2 rounded-lg text-sm text-gray-500 w-fit">
            typing…
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <form
        onSubmit={async e => {
          e.preventDefault()
          const input = e.currentTarget.content as HTMLInputElement
          await handleSend(input.value)
          input.value = ""
          setIsTyping(false)
        }}
        className="flex items-center gap-2 px-3 py-2 bg-[#f0f0f0]"
      >
        <input
          name="content"
          required
          placeholder="Type a message"
          onChange={notifyTyping}
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
