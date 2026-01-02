import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getInboxConversations } from "@/lib/queries/messages.server"
import MessagesClient from "./MessagesClient"

export const dynamic = "force-dynamic"

export default async function MessagesPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const messages = await getInboxConversations(user.id)

  /* group by conversation partner */
  const map = new Map<string, any>()

  for (const m of messages) {
    const other =
      m.sender_id === user.id ? m.receiver : m.sender

    if (!map.has(other.id)) {
      map.set(other.id, {
        otherUser: other,
        lastMessage: m
      })
    }
  }

  return (
    <MessagesClient
      userId={user.id}
      conversations={Array.from(map.values())}
    />
  )
}
