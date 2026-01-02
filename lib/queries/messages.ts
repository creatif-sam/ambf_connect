import { createSupabaseServerClient } from "@/lib/supabase/server"

/* =========================
   FETCH INBOX CONVERSATIONS
   ========================= */

export async function getInboxConversations(userId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("messages")
    .select(`
      id,
      sender_id,
      receiver_id,
      content,
      created_at,
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

  const conversations = new Map<string, any>()

  data.forEach(message => {
    const otherUser =
      message.sender_id === userId
        ? message.receiver
        : message.sender

    if (!otherUser) return

    if (!conversations.has(otherUser.id)) {
      conversations.set(otherUser.id, {
        user: otherUser,
        lastMessage: message
      })
    }
  })

  return Array.from(conversations.values())
}

/* =========================
   FETCH SINGLE CONVERSATION
   ========================= */

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

/* =========================
   SEND MESSAGE
   ========================= */

export async function sendMessage(
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

/* =========================
   MARK MESSAGES AS READ
   ========================= */

export async function markMessagesAsRead(
  userId: string,
  otherUserId: string
) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("receiver_id", userId)
    .eq("sender_id", otherUserId)
    .is("read_at", null)

  if (error) {
    throw error
  }
}
