import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"

import {
  getConversation,
  sendMessage
} from "@/lib/queries/messages"

type Props = {
  params: Promise<{ userId: string }>
}

export const dynamic = "force-dynamic"

/* =========================
   TIME FORMATTER (SAFE)
   ========================= */
function formatTime(dateString: string) {
  const d = new Date(dateString)
  return `${d.getUTCHours().toString().padStart(2, "0")}:${d
    .getUTCMinutes()
    .toString()
    .padStart(2, "0")}`
}

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

  const { data: otherUser } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", userId)
    .single()

  const messages = await getConversation(user.id, userId)

  return (
    <main className="h-screen flex flex-col bg-[#efeae2]">

      {/* HEADER BAR */}
      <header
        className="
          flex items-center gap-3 px-4 py-3
          bg-gradient-to-r from-yellow-400 via-yellow-500 to-black
        "
      >
        <Link href="/messages" className="text-black">
          <ArrowLeft size={20} />
        </Link>

        <div className="h-9 w-9 rounded-full bg-black/20 overflow-hidden">
          {otherUser?.avatar_url && (
            <img
              src={otherUser.avatar_url}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <p className="font-semibold text-sm text-white">
          {otherUser?.full_name ?? "Conversation"}
        </p>
      </header>

      {/* Encryption notice */}
      <div className="px-4 py-2 text-xs text-center bg-[#fff3c2] text-[#665c00]">
        Messages to this chat are secured. Only participants can read them.
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-500 mt-10">
            No messages yet
          </p>
        )}

        {messages.map(m => {
          const isMe = m.sender_id === user.id

          return (
            <div
              key={m.id}
              className={`max-w-[80%] px-3 py-2 rounded-lg text-sm leading-relaxed ${
                isMe
                  ? "ml-auto bg-[#dcf8c6]"
                  : "mr-auto bg-white"
              }`}
            >
              {m.content}

              <div className="mt-1 text-[10px] text-gray-500 text-right">
                {formatTime(m.created_at)}
              </div>
            </div>
          )
        })}
      </div>

      {/* INPUT BAR */}
      <form
        action={async formData => {
          "use server"
          await sendMessage(
            user.id,
            userId,
            String(formData.get("content"))
          )
        }}
        className="flex items-center gap-2 px-3 py-2 bg-[#f0f0f0]"
      >
        <input
          name="content"
          required
          placeholder="Type a message"
          className="
            flex-1 rounded-full px-4 py-2
            text-sm outline-none border
          "
        />

        <button
          type="submit"
          className="
            px-4 py-2 rounded-full
            bg-gradient-to-r from-yellow-400 via-yellow-500 to-black
            text-black text-sm font-medium
            hover:opacity-90 transition
          "
        >
          Send
        </button>
      </form>

    </main>
  )
}
