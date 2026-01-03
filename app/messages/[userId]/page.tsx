import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
  getConversation,
  markConversationAsRead
} from "@/lib/queries/messages.server"
import ConversationClient from "./ConversationClient"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ userId?: string }>
}

export default async function ConversationPage({ params }: Props) {
  /* ✅ unwrap params */
  const { userId } = await params

  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  /* 🔒 hard guard */
  if (!userId) {
    return null
  }

  const { data: otherUser } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", userId)
    .single()

  if (!otherUser) {
    return null
  }

  const messages = await getConversation(user.id, userId)

  await markConversationAsRead(user.id, userId)

  return (
    <ConversationClient
      meId={user.id}
      otherUser={otherUser}
      initialMessages={messages}
    />
  )
}
