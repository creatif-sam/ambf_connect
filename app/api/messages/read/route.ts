import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { markConversationAsRead } from "@/lib/queries/messages.server"

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false })
  }

  const { otherUserId } = await req.json()

  await markConversationAsRead(user.id, otherUserId)

  return NextResponse.json({ ok: true })
}
