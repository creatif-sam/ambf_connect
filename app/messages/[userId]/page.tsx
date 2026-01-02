import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getConversation } from "@/lib/queries/messages.server"
import ConversationClient from "./ConversationClient"

export const dynamic = "force-dynamic"

export default async function ConversationPage({ params }) {
  const { userId } = await params
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: otherUser } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", userId)
    .single()

  const initialMessages = await getConversation(user.id, userId)

  return (
    <ConversationClient
      meId={user.id}
      otherUser={otherUser}
      initialMessages={initialMessages}
    />
  )
}
