"use client"

import { useEffect, useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

type Props = {
  meId: string
  onSelect: (id: string) => void
  activeUserId: string | null
}

export default function MessagesList({
  meId,
  onSelect,
  activeUserId
}: Props) {
  const supabase = createSupabaseBrowserClient()
  const [conversations, setConversations] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("messages")
        .select("sender_id, receiver_id, content, created_at")
        .or(`sender_id.eq.${meId},receiver_id.eq.${meId}`)
        .order("created_at", { ascending: false })

      setConversations(data ?? [])
    }

    load()
  }, [meId, supabase])

  return (
    <div className="divide-y">
      {conversations.map((c, i) => {
        const otherId =
          c.sender_id === meId ? c.receiver_id : c.sender_id

        return (
          <button
            key={i}
            onClick={() => onSelect(otherId)}
            className={`w-full px-4 py-3 text-left hover:bg-gray-100 ${
              activeUserId === otherId ? "bg-gray-100" : ""
            }`}
          >
            <p className="font-medium">{otherId}</p>
            <p className="text-sm text-gray-500 truncate">
              {c.content}
            </p>
          </button>
        )
      })}
    </div>
  )
}
