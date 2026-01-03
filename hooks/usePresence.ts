"use client"

import { useEffect, useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export function usePresence(
  meId: string,
  otherUserId: string
) {
  const supabase = createSupabaseBrowserClient()
  const [online, setOnline] = useState(false)
  const [lastSeen, setLastSeen] = useState<string | null>(null)

  const roomId =
    meId < otherUserId
      ? `${meId}:${otherUserId}`
      : `${otherUserId}:${meId}`

  useEffect(() => {
    const channel = supabase.channel(`presence:${roomId}`, {
      config: {
        presence: { key: meId }
      }
    })

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        setOnline(!!state[otherUserId])
      })
      .on("presence", { event: "leave" }, async payload => {
        if (payload.key === otherUserId) {
          setOnline(false)

          // fetch persisted last seen
          const { data } = await supabase
            .from("profiles")
            .select("last_seen_at")
            .eq("id", otherUserId)
            .single()

          setLastSeen(data?.last_seen_at ?? null)
        }
      })
      .subscribe(async status => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            online_at: new Date().toISOString()
          })
        }
      })

    // when THIS user disconnects, update last_seen_at
    const handleUnload = async () => {
      await supabase
        .from("profiles")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", meId)
    }

    window.addEventListener("beforeunload", handleUnload)

    return () => {
      handleUnload()
      window.removeEventListener("beforeunload", handleUnload)
      supabase.removeChannel(channel)
    }
  }, [supabase, meId, otherUserId, roomId])

  return { online, lastSeen }
}
