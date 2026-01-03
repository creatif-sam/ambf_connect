import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient()

  /* =========================
     AUTH
     ========================= */
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  /* =========================
     PAYLOAD
     ========================= */
  const { receiverId, content } = await req.json()

  if (!receiverId || !content?.trim()) {
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400 }
    )
  }

  /* =========================
     1. SAVE MESSAGE
     ========================= */
  const { error: insertError } = await supabase
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content
    })

  if (insertError) {
    return NextResponse.json(
      { error: insertError.message },
      { status: 500 }
    )
  }

  /* =========================
     2. GET SENDER NAME
     ========================= */
  const { data: senderProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  const senderName =
    senderProfile?.full_name ??
    user.email ??
    "New message"

  /* =========================
     3. TRIGGER PUSH (NON BLOCKING)
     ========================= */
  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send_message_push`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          receiverId,
          senderName,
          content
        })
      }
    )
  } catch (err) {
    console.error("Push notification failed:", err)
    /* Push failure must never break messaging */
  }

  /* =========================
     DONE
     ========================= */
  return NextResponse.json({ success: true })
}
