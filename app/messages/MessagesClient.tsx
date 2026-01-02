"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

type Conversation = {
  otherUser: any
  lastMessage: any
}

type Props = {
  userId: string
  conversations: Conversation[]
}

/* deterministic date */
function formatDate(date: string) {
  const d = new Date(date)
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}/${d.getUTCFullYear()}`
}

export default function MessagesClient({
  userId,
  conversations: initial
}: Props) {
  const supabase = createSupabaseBrowserClient()
  const [conversations, setConversations] =
    useState<Conversation[]>(initial)

  /* fetch profile ONCE for new conversations */
  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("id", userId)
      .single()

    return data
  }

  /* REALTIME INBOX UPDATES */
  useEffect(() => {
    const channel = supabase
      .channel("inbox-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages"
        },
        async payload => {
          const m = payload.new

          /* ignore messages not involving me */
          if (
            m.sender_id !== userId &&
            m.receiver_id !== userId
          ) {
            return
          }

          const otherId =
            m.sender_id === userId
              ? m.receiver_id
              : m.sender_id

          setConversations(prev => {
            const existing = prev.find(
              c => c.otherUser.id === otherId
            )

            const rest = prev.filter(
              c => c.otherUser.id !== otherId
            )

            /* EXISTING CONVERSATION */
            if (existing) {
              return [
                {
                  ...existing,
                  lastMessage: m
                },
                ...rest
              ]
            }

            /* PLACEHOLDER WHILE FETCHING PROFILE */
            return [
              {
                otherUser: {
                  id: otherId,
                  full_name: "Loading...",
                  avatar_url: null
                },
                lastMessage: m
              },
              ...rest
            ]
          })

          /* fetch real profile and replace placeholder */
          const profile = await fetchProfile(otherId)

          if (!profile) return

          setConversations(prev =>
            prev.map(c =>
              c.otherUser.id === otherId
                ? {
                    ...c,
                    otherUser: profile
                  }
                : c
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  return (
    <main className="max-w-md mx-auto h-screen flex flex-col bg-white">

      {/* HEADER */}
      <header className="px-4 py-4 border-b bg-black">
        <h1 className="text-lg font-semibold text-yellow-400 text-center">
          Messages
        </h1>
      </header>

      {/* CONVERSATION LIST */}
      <div className="flex-1 overflow-y-auto divide-y">
        {conversations.length === 0 && (
          <p className="text-sm text-gray-500 text-center mt-10">
            No conversations yet
          </p>
        )}

        {conversations.map(c => (
          <Link
            key={c.otherUser.id}
            href={`/messages/${c.otherUser.id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-yellow-50 transition"
          >
            {/* Avatar */}
            <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              {c.otherUser.avatar_url && (
                <img
                  src={c.otherUser.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="font-medium text-sm truncate">
                  {c.otherUser.full_name}
                </p>

                <span className="text-[10px] text-gray-400">
                  {formatDate(c.lastMessage.created_at)}
                </span>
              </div>

              <p className="text-xs text-gray-500 truncate mt-0.5">
                {c.lastMessage.content}
              </p>
            </div>
          </Link>
        ))}
      </div>

    </main>
  )
}
