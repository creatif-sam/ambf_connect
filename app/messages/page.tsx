import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getInboxConversations } from "@/lib/queries/messages"
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

  const conversations = await getInboxConversations(user.id)

  return (
    <MessagesClient
      userId={user.id}
      conversations={conversations}
    />
  )
}
