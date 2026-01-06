import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { eventId } = await request.json()

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    // Check if already joined
    const { data: existing } = await supabase
      .from("event_members")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", user.id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: "Already joined this event" },
        { status: 400 }
      )
    }

    // Join event
    const { error } = await supabase.from("event_members").insert({
      event_id: eventId,
      user_id: user.id,
      role: "attendee"
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
