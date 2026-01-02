import { createSupabaseServerClient } from "@/lib/supabase/server"

/* =========================
   INBOX CONVERSATIONS
   ========================= */
export async function getInboxConversations(meId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.rpc(
    "get_inbox_conversations",
    { me_id: meId }
  )

  if (error) {
    console.error("Inbox conversations error:", error)
    throw error
  }

  return data ?? []
}

/* =========================
   FULL CONVERSATION
   ========================= */
export async function getConversation(
  meId: string,
  otherId: string
) {
  const supabase = await createSupabaseServerClient()

  const logic = `and(sender_id.eq.${meId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${meId})`

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(logic)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Conversation error:", error)
    throw error
  }

  return data ?? []
}

/* =========================
   SEND MESSAGE
   ========================= */
export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string
) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from("messages")
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content
    })

  if (error) {
    console.error("Send message error:", error)
    throw error
  }
}

/* =========================
   MARK CONVERSATION AS READ
   ========================= */
export async function markConversationAsRead(
  meId: string,
  otherId: string
) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("receiver_id", meId)
    .eq("sender_id", otherId)
    .is("read_at", null)

  if (error) {
    console.error("Mark as read error:", error)
    throw error
  }
}


export async function getUnreadCount(meId: string) {
  const supabase = await createSupabaseServerClient()

  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("receiver_id", meId)
    .is("read_at", null)

  if (error) {
    console.error("Unread count error:", error)
    throw error
  }

  return count ?? 0
}
