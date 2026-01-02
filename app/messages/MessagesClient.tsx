"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Search,
  Star,
  MoreVertical
} from "lucide-react"

type Props = {
  userId: string
  conversations: any[]
}

export default function MessagesClient({
  conversations
}: Props) {
  const [tab, setTab] = useState<"focused" | "other">("focused")
  const [query, setQuery] = useState("")

  const filtered = conversations.filter(c =>
    c.user.full_name
      ?.toLowerCase()
      .includes(query.toLowerCase())
  )

  return (
    <main className="max-w-md mx-auto h-screen bg-white border">

      {/* Header */}
      <header className="p-3 border-b space-y-3">
        <h1 className="text-lg font-semibold">
          Messages
        </h1>

        <div className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-2">
          <Search size={16} className="text-gray-500" />
          <input
            placeholder="Search messages"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>

        <div className="flex gap-6 text-sm">
          <button
            onClick={() => setTab("focused")}
            className={`pb-2 ${
              tab === "focused"
                ? "border-b-2 border-green-600 text-green-700 font-medium"
                : "text-gray-500"
            }`}
          >
            Focused
          </button>

          <button
            onClick={() => setTab("other")}
            className={`pb-2 ${
              tab === "other"
                ? "border-b-2 border-green-600 text-green-700 font-medium"
                : "text-gray-500"
            }`}
          >
            Other
          </button>
        </div>
      </header>

      {/* Conversation list */}
      <div className="divide-y overflow-y-auto h-[calc(100vh-120px)]">
        {filtered.length === 0 && (
          <div className="py-20 text-center text-sm text-gray-500">
            No messages yet
          </div>
        )}

        {filtered.map(c => (
          <Link
            key={c.user.id}
            href={`/messages/${c.user.id}`}
            className="block hover:bg-gray-50"
          >
            <div className="flex items-center gap-3 px-4 py-3">

              {/* Avatar */}
              <div className="h-11 w-11 rounded-full bg-gray-200 overflow-hidden shrink-0">
                {c.user.avatar_url && (
                  <img
                    src={c.user.avatar_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm truncate">
                    {c.user.full_name}
                  </p>

                  <span className="text-xs text-gray-400">
                    {new Date(c.lastMessage.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-gray-500 truncate">
                  {c.lastMessage.content}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Star
                  size={16}
                  className="text-gray-300 hover:text-yellow-500"
                />
                <MoreVertical
                  size={16}
                  className="text-gray-400"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
