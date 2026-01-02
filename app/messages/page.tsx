import Link from "next/link"
import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getInboxConversations } from "@/lib/queries/messages"

export const dynamic = "force-dynamic"

export default async function MessagesInboxPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const conversations = await getInboxConversations(user.id)

  return (
    <main className="max-w-md mx-auto h-screen border bg-white">
      <header className="p-4 font-semibold border-b">
        Messages
      </header>

      <div className="divide-y">
        {conversations.map(c => (
          <Link
            key={c.user.id}
            href={`/messages/${c.user.id}`}
            className="flex items-center gap-3 p-4 hover:bg-gray-50"
          >
            <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
              {c.user.avatar_url && (
                <img
                  src={c.user.avatar_url}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="flex-1">
              <p className="font-medium">
                {c.user.full_name}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {c.lastMessage.content}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
