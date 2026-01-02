import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getUnreadCount } from "@/lib/queries/messages.server"

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ count: 0 })
  }

  const count = await getUnreadCount(user.id)

  return NextResponse.json({ count })
}
