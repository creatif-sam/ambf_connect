import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export async function fetchMyEvents() {
  const supabase = createSupabaseBrowserClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from("events")
    .select("id, title, slug, start_date, end_date, is_published")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
    return []
  }

  return data ?? []
}
