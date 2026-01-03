import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getInboxConversations } from "@/lib/queries/messages.server"

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json([], { status: 401 })
  }

  try {
    const conversations = await getInboxConversations(user.id)
    return NextResponse.json(conversations)
  } catch (err) {
    console.error("Inbox API error:", err)
    return NextResponse.json([], { status: 500 })
  }
}
