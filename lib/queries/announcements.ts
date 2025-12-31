import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export async function fetchAnnouncements(eventId: string) {
  const supabase = createSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function createAnnouncement(
  eventId: string,
  title: string,
  body: string
) {
  const supabase = createSupabaseBrowserClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { error } = await supabase
    .from("announcements")
    .insert({
      event_id: eventId,
      title,
      body,
      created_by: user.id
    })

  if (error) {
    throw error
  }
}
