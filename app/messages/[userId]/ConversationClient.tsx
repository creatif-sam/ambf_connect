"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Send, Smile } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { usePresence } from "@/hooks/usePresence"

type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  read_at?: string | null
  optimistic?: boolean
}

type Props = {
  meId: string
  otherUser: {
    id: string
    full_name: string
    avatar_url: string | null
  }
  initialMessages: Message[]
}

function formatTime(dateString: string) {
  const d = new Date(dateString)
  return `${d.getUTCHours().toString().padStart(2, "0")}:${d
    .getUTCMinutes()
    .toString()
    .padStart(2, "0")}`
}

function sortMessages(list: Message[]) {
  return [...list].sort(
    (a, b) =>
      new Date(a.created_at).getTime() -
      new Date(b.created_at).getTime()
  )
}

const EMOJIS = ["😀","😂","😍","👍","🙏","🔥","❤️","🎉","😎","😢"]

export default function ConversationClient({
  meId,
  otherUser,
  initialMessages
}: Props) {
  const supabase = createSupabaseBrowserClient()

  const [messages, setMessages] = useState<Message[]>(
    sortMessages(initialMessages)
  )
  const [showEmoji, setShowEmoji] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const typingTimeout = useRef<NodeJS.Timeout | null>(null)

  const typingChannelRef = useRef<any>(null)

  const { online, lastSeen } = usePresence(meId, otherUser.id)

  const roomId =
    meId < otherUser.id
      ? `${meId}:${otherUser.id}`
      : `${otherUser.id}:${meId}`

  /* auto scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  /* mark conversation as read on open */
  useEffect(() => {
    fetch("/api/messages/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId: otherUser.id })
    })
  }, [otherUser.id])

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
          const m = payload.new as Message

          const relevant =
            (m.sender_id === meId &&
              m.receiver_id === otherUser.id) ||
            (m.sender_id === otherUser.id &&
              m.receiver_id === meId)

          if (!relevant) return

          setMessages(prev => {
            const optimisticIndex = prev.findIndex(
              p =>
                p.optimistic &&
                p.sender_id === m.sender_id &&
                p.content === m.content
            )

            if (optimisticIndex !== -1) {
              const copy = [...prev]
              copy[optimisticIndex] = m
              return sortMessages(copy)
            }

            if (prev.some(p => p.id === m.id)) {
              return prev
            }

            return sortMessages([...prev, m])
          })

          if (m.sender_id === otherUser.id) {
            fetch("/api/messages/read", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ otherUserId: otherUser.id })
            })
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages"
        },
        payload => {
          const updated = payload.new as Message
          setMessages(prev =>
            sortMessages(
              prev.map(m =>
                m.id === updated.id ? updated : m
              )
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [meId, otherUser.id, roomId])

  /* typing channel */
  useEffect(() => {
    const channel = supabase.channel(`typing:${roomId}`)
    typingChannelRef.current = channel

    channel
      .on("broadcast", { event: "typing" }, payload => {
        if (payload.payload.userId === otherUser.id) {
          setIsTyping(true)
          if (typingTimeout.current) clearTimeout(typingTimeout.current)
          typingTimeout.current = setTimeout(
            () => setIsTyping(false),
            2000
          )
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [otherUser.id, roomId])

  function notifyTyping() {
    typingChannelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: meId }
    })
  }

  function addOptimisticMessage(content: string) {
    const optimistic: Message = {
      id: crypto.randomUUID(),
      sender_id: meId,
      receiver_id: otherUser.id,
      content,
      created_at: new Date().toISOString(),
      read_at: null,
      optimistic: true
    }

    setMessages(prev => sortMessages([...prev, optimistic]))
  }

  async function sendMessage(content: string) {
    if (!content.trim()) return

    addOptimisticMessage(content)

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
    <div className="flex-1 flex flex-col h-full bg-[#efeae2]">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-[#f0f2f5] border-b border-gray-200">
        <Link href="/messages" className="text-gray-700 hover:text-gray-900 transition">
          <ArrowLeft size={20} />
        </Link>

        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 overflow-hidden flex items-center justify-center text-white font-semibold flex-shrink-0">
          {otherUser.avatar_url ? (
            <img
              src={otherUser.avatar_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-lg">
              {otherUser.full_name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">
            {otherUser.full_name}
          </p>

          {online ? (
            <span className="text-xs text-green-600 font-medium">
              Online
            </span>
          ) : isTyping ? (
            <span className="text-xs text-yellow-600 font-medium">
              typing…
            </span>
          ) : lastSeen ? (
            <span className="text-xs text-gray-500">
              Last seen{" "}
              {new Date(lastSeen).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit"
              })}
            </span>
          ) : (
            <span className="text-xs text-gray-500">
              Offline
            </span>
          )}
        </div>
      </header>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto px-4 md:px-16 py-4 space-y-1"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d9d9d9' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      >
        {messages.map(m => {
          const isMe = m.sender_id === meId
          const isRead = !!m.read_at

          return (
            <div
              key={m.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] md:max-w-[65%] px-3 py-2 rounded-lg text-sm shadow-sm ${
                  isMe
                    ? "bg-[#dcf8c6] rounded-br-none"
                    : "bg-white rounded-bl-none"
                }`}
              >
                <p className="break-words">{m.content}</p>
                <div className="mt-1 flex justify-end items-center gap-1 text-[10px] text-gray-500">
                  <span>{formatTime(m.created_at)}</span>
                  {isMe && !m.optimistic && (
                    <span className={isRead ? "text-blue-500" : "text-gray-400"}>
                      {isRead ? "✓✓" : "✓"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-2 rounded-lg rounded-bl-none text-sm text-gray-500 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={async e => {
          e.preventDefault()
          if (!inputRef.current) return
          const value = inputRef.current.value
          inputRef.current.value = ""
          await sendMessage(value)
        }}
        className="relative flex items-center gap-2 px-4 py-3 bg-[#f0f2f5] border-t border-gray-200"
      >
        <button
          type="button"
          onClick={() => setShowEmoji(v => !v)}
          className="text-gray-600 hover:text-gray-800 transition"
        >
          <Smile size={22} />
        </button>

        <input
          ref={inputRef}
          placeholder="Type a message"
          onChange={notifyTyping}
          className="flex-1 rounded-full px-4 py-2.5 text-sm bg-white border-0 outline-none focus:ring-2 focus:ring-yellow-400 transition"
        />

        <button
          type="submit"
          className="h-10 w-10 flex items-center justify-center rounded-full bg-yellow-500 hover:bg-yellow-600 text-white transition shadow-sm"
        >
          <Send size={18} />
        </button>

        {showEmoji && (
          <div className="absolute bottom-16 left-4 bg-white rounded-lg shadow-lg p-3 grid grid-cols-5 gap-2 border border-gray-200">
            {EMOJIS.map(e => (
              <button
                key={e}
                type="button"
                onClick={() => insertEmoji(e)}
                className="text-2xl hover:scale-125 transition p-1"
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  )
}
