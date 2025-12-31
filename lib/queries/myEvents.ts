import { supabase } from "@/lib/supabase/client"

export async function fetchMyEvents() {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return []

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("created_by", user.user.id)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}
