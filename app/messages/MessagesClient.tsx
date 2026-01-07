"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search, MoreVertical, MessageSquare } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { usePathname } from "next/navigation"

type Props = {
  meId: string
  initialConversations: any[]
}

function formatTime(date: string) {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  } else if (diffDays === 1) {
    return "Yesterday"
  } else if (diffDays < 7) {
    return d.toLocaleDateString("en-US", { weekday: "short" })
  } else {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }
}

export default function MessagesClient({
  meId,
  initialConversations
}: Props) {
  const supabase = createSupabaseBrowserClient()
  const pathname = usePathname()
  const [conversations, setConversations] = useState(
    initialConversations ?? []
  )
  const [searchQuery, setSearchQuery] = useState("")

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

  const filteredConversations = conversations.filter(c =>
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      {/* LEFT SIDEBAR - Conversations List */}
      <div className="w-full md:w-[420px] flex flex-col bg-white border-r border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#f0f2f5] border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">Chats</h1>
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-800">
              <MessageSquare size={20} />
            </button>
            <button className="text-gray-600 hover:text-gray-800">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-3 py-2 bg-white border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#f0f2f5] text-gray-900 placeholder:text-gray-500 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-yellow-400 transition"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <MessageSquare size={64} className="text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">
                {searchQuery ? "No chats found" : "No conversations yet"}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {searchQuery ? "Try searching with different keywords" : "Start a conversation from the Networking tab"}
              </p>
            </div>
          )}

          {filteredConversations.map(c => {
            const isActive = pathname === `/messages/${c.other_user_id}`
            return (
              <Link
                key={c.other_user_id}
                href={`/messages/${c.other_user_id}`}
                className={`block border-b border-gray-100 transition ${
                  isActive ? "bg-[#f0f2f5]" : "hover:bg-[#f5f6f6]"
                }`}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 overflow-hidden flex items-center justify-center text-white font-semibold">
                      {c.avatar_url ? (
                        <img
                          src={c.avatar_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">
                          {c.full_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Message Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900 truncate">
                        {c.full_name}
                      </p>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatTime(c.last_message_at)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm truncate ${
                          c.unread_count > 0
                            ? "font-semibold text-gray-900"
                            : "text-gray-500"
                        }`}
                      >
                        {c.last_message}
                      </p>
                      {c.unread_count > 0 && (
                        <span className="ml-2 min-w-[20px] h-5 px-1.5 rounded-full bg-yellow-500 text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
                          {c.unread_count > 99 ? "99+" : c.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* RIGHT SIDE - Empty State (desktop only) */}
      <div className="hidden md:flex flex-1 bg-[#f0f2f5] items-center justify-center">
        <div className="text-center px-8">
          <div className="mb-6 flex justify-center">
            <div className="h-32 w-32 rounded-full bg-white shadow-sm flex items-center justify-center">
              <MessageSquare size={48} className="text-gray-300" />
            </div>
          </div>
          <h2 className="text-2xl font-light text-gray-700 mb-2">
            AMBF Connect Messaging
          </h2>
          <p className="text-sm text-gray-500 max-w-md">
            Send and receive messages with event attendees. Select a conversation from the left to start chatting.
          </p>
        </div>
      </div>
    </>
  )
}
