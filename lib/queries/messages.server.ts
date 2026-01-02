import { createSupabaseServerClient } from "@/lib/supabase/server"

/* ===============================
   INBOX CONVERSATIONS
   =============================== */

export async function getInboxConversations(userId: string) {
  const supabase = await createSupabaseServerClient()

  /**
   * Fetch all messages involving the user.
   * We will group them on the page layer.
   */
  const { data, error } = await supabase
    .from("messages")
    .select(`
      id,
      content,
      created_at,
      sender_id,
      receiver_id,
      sender:sender_id (
        id,
        full_name,
        avatar_url
      ),
      receiver:receiver_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

/* ===============================
   SINGLE CONVERSATION THREAD
   =============================== */

export async function getConversation(
  userId: string,
  otherUserId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
    )
    .order("created_at", { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

/* ===============================
   SEND MESSAGE (SERVER SIDE)
   =============================== */

export async function sendMessageServer(
  senderId: string,
  receiverId: string,
  content: string
) {
  if (!content.trim()) return

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from("messages")
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content
    })

  if (error) {
    throw error
  }
}
