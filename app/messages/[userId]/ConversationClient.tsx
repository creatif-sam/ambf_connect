"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Send,
  Smile
} from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { usePresence } from "@/hooks/usePresence"

type Props = {
  meId: string
  otherUser: {
    id: string
    full_name: string
    avatar_url: string | null
  }
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

const EMOJIS = ["😀","😂","😍","👍","🙏","🔥","❤️","🎉","😎","😢"]

export default function ConversationClient({
  meId,
  otherUser,
  initialMessages
}: Props) {
  const supabase = createSupabaseBrowserClient()
  const [messages, setMessages] = useState(initialMessages)
  const [showEmoji, setShowEmoji] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const typingTimeout = useRef<NodeJS.Timeout | null>(null)

  const { online, lastSeen } = usePresence(meId, otherUser.id)

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
        { event: "INSERT", schema: "public", table: "messages" },
        payload => {
          const m = payload.new
          const relevant =
            (m.sender_id === meId && m.receiver_id === otherUser.id) ||
            (m.sender_id === otherUser.id && m.receiver_id === meId)

          if (!relevant) return

          setMessages(prev =>
            prev.some(p => p.id === m.id) ? prev : [...prev, m]
          )
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        payload => {
          const updated = payload.new
          setMessages(prev =>
            prev.map(m => (m.id === updated.id ? updated : m))
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
          if (typingTimeout.current) clearTimeout(typingTimeout.current)
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

  async function sendMessage(content: string) {
    if (!content.trim()) return

    await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiverId: otherUser.id,
        content
      })
    })
  }

  function insertEmoji(e: string) {
    if (!inputRef.current) return
    inputRef.current.value += e
    inputRef.current.focus()
    setShowEmoji(false)
  }

  return (
    <main className="h-screen bg-[#efeae2] flex justify-center">

      {/* DESKTOP CONTAINER */}
      <div className="w-full max-w-4xl flex flex-col bg-[#efeae2]">

        {/* HEADER */}
        <header className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-yellow-400 via-yellow-500 to-black">
          <Link href="/messages" className="text-black">
            <ArrowLeft size={20} />
          </Link>

          <div className="h-9 w-9 rounded-full bg-black/20 overflow-hidden">
            {otherUser.avatar_url && (
              <img
                src={otherUser.avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <div className="flex flex-col leading-tight">
            <p className="font-semibold text-sm text-white">
              {otherUser.full_name}
            </p>

            {online ? (
              <span className="text-xs text-black font-medium">
                Online
              </span>
            ) : isTyping ? (
              <span className="text-xs text-black font-medium">
                typing…
              </span>
            ) : lastSeen ? (
              <span className="text-xs text-black/70">
                Last seen{" "}
                {new Date(lastSeen).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
            ) : (
              <span className="text-xs text-black/70">
                Offline
              </span>
            )}
          </div>
        </header>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {messages.map(m => {
            const isMe = m.sender_id === meId
            const isRead = !!m.read_at

            return (
              <div
                key={m.id}
                className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                  isMe
                    ? "ml-auto bg-[#dcf8c6]"
                    : "mr-auto bg-white"
                }`}
              >
                {m.content}

                <div className="mt-1 flex justify-end gap-1 text-[10px] text-gray-500">
                  <span>{formatTime(m.created_at)}</span>
                  {isMe && (
                    <span className={isRead ? "text-blue-600" : "text-gray-400"}>
                      ✓✓
                    </span>
                  )}
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

        {/* INPUT BAR */}
        <form
          onSubmit={async e => {
            e.preventDefault()
            if (!inputRef.current) return
            await sendMessage(inputRef.current.value)
            inputRef.current.value = ""
            setIsTyping(false)
          }}
          className="relative flex items-center gap-2 px-3 py-2 bg-[#f0f0f0]"
        >
          <button
            type="button"
            onClick={() => setShowEmoji(v => !v)}
            className="text-gray-600 hover:text-black"
          >
            <Smile size={20} />
          </button>

          <input
            ref={inputRef}
            name="content"
            required
            placeholder="Type a message"
            onChange={notifyTyping}
            className="flex-1 rounded-full px-4 py-2 text-sm outline-none border"
          />

          <button
            type="submit"
            className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-black text-black"
          >
            <Send size={18} />
          </button>

          {/* EMOJI PICKER */}
          {showEmoji && (
            <div className="absolute bottom-14 left-4 bg-white rounded-lg shadow p-2 grid grid-cols-5 gap-2">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => insertEmoji(e)}
                  className="text-xl hover:scale-110 transition"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </form>

      </div>
    </main>
  )
}
