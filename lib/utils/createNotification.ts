import { createClient } from "@supabase/supabase-js"

type NotificationType = "message" | "event" | "announcement" | "system"

export async function createNotification({
  userId,
  type,
  title,
  message,
  link
}: {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
}) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: userId,
        type,
        title,
        message,
        link
      })
      .select()

    if (error) {
      console.error("Failed to create notification:", error)
      return null
    }

    return data[0]
  } catch (error) {
    console.error("Notification creation error:", error)
    return null
  }
}
