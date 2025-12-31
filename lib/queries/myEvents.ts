import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export async function fetchMyEvents() {
  const supabase = createSupabaseBrowserClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from("event_members")
    .select(`
      events (
        id,
        title,
        description,
        start_date,
        end_date
      )
    `)
    .eq("user_id", user.id)

  if (error) {
    throw error
  }

  return data?.map(row => row.events) ?? []
}
