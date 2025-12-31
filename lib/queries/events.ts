import { supabase } from "@/lib/supabase/client"

export async function createEvent(input: {
  title: string
  description?: string
  slug: string
  start_date: string
  end_date: string
}) {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error("Not authenticated")

  const { error } = await supabase.from("events").insert({
    ...input,
    created_by: user.user.id
  })

  if (error) throw error
}

export async function fetchPublicEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .order("start_date")

  if (error) throw error
  return data
}
