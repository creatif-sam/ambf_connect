import { createSupabaseBrowserClient } from "@/lib/supabase/client"

/* SEND MESSAGE FROM CLIENT */
export async function sendMessageClient(
  senderId: string,
  receiverId: string,
  content: string
) {
  if (!content.trim()) return

  const supabase = createSupabaseBrowserClient()

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
