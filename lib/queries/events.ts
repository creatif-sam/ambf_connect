import { createSupabaseBrowserClient } from "@/lib/supabase/client"

/* =========================
   CREATE EVENT
   ========================= */

export async function createEvent(input: {
  title: string
  description?: string
  slug: string
  start_date: string
  end_date: string
}) {
  const supabase = createSupabaseBrowserClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { error } = await supabase.from("events").insert({
    title: input.title,
    description: input.description,
    slug: input.slug,
    start_date: input.start_date,
    end_date: input.end_date,
    created_by: user.id
  })

  if (error) {
    throw error
  }
}

/* =========================
   FETCH EVENTS
   ========================= */

export async function fetchEvents() {
  const supabase = createSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("start_date", { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

/* =========================
   FETCH SINGLE EVENT
   ========================= */

export async function fetchEventBySlug(slug: string) {
  const supabase = createSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error) {
    throw error
  }

  return data
}
