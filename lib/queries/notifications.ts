import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export type Notification = {
  id: string
  user_id: string
  type: "message" | "event" | "announcement" | "system"
  title: string
  message: string
  link?: string
  read: boolean
  created_at: string
}

export async function getRecentNotifications(limit: number = 5) {
  const supabase = createSupabaseBrowserClient()
  
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Notification[]
}

export async function getUnreadCount() {
  const supabase = createSupabaseBrowserClient()
  
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("read", false)

  if (error) throw error
  return count || 0
}

export async function markAsRead(notificationId: string) {
  const supabase = createSupabaseBrowserClient()
  
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)

  if (error) throw error
}

export async function markAllAsRead() {
  const supabase = createSupabaseBrowserClient()
  
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("read", false)

  if (error) throw error
}
