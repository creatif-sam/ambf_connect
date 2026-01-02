import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getConversation, sendMessage } from "@/lib/queries/messages"
import MessageBubble from "@/components/MessageBubble"

type Props = {
  params: Promise<{ userId: string }>
}

export const dynamic = "force-dynamic"

export default async function ConversationPage({
  params
}: Props) {
  const { userId } = await params
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const messages = await getConversation(user.id, userId)

  return (
    <main className="max-w-md mx-auto h-screen flex flex-col bg-gray-100">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(m => (
          <MessageBubble
            key={m.id}
            message={m}
            isMe={m.sender_id === user.id}
          />
        ))}
      </div>

      <form
        action={async formData => {
          "use server"
          await sendMessage(
            user.id,
            userId,
            String(formData.get("content"))
          )
        }}
        className="p-3 border-t bg-white flex gap-2"
      >
        <input
          name="content"
          placeholder="Type a message"
          className="flex-1 border rounded-full px-4 py-2"
          required
        />
        <button className="px-4 font-medium">
          Send
        </button>
      </form>
    </main>
  )
}
