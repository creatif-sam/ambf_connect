import { createSupabaseServerClient } from "@/lib/supabase/server"

export type PendingUser = {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  job_title: string | null
  company: string | null
  created_at: string
}

/**
 * Get all pending users (newly registered users awaiting approval)
 */
export async function getPendingUsers() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  try {
    // Check if current user is an organizer or admin
    const { data: membership } = await supabase
      .from("event_members")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["organizer", "admin"])
      .limit(1)
      .single()

    if (!membership) {
      // Not an organizer/admin, return empty array
      return []
    }

    // Get pending users
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, job_title, company, created_at, status")
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (error) {
      // If status column doesn't exist, return empty array
      if (error.code === "42703") {
        console.log("Status column not found - migration may not be run yet")
        return []
      }
      throw error
    }

    return (data || []) as PendingUser[]
  } catch (error) {
    console.error("Error fetching pending users:", error)
    return []
  }
}

/**
 * Get total pending users count
 */
export async function getTotalPendingCount() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return 0
  }

  // Check if current user is an organizer or admin
  const { data: membership } = await supabase
    .from("event_members")
    .select("role")
    .eq("user_id", user.id)
    .in("role", ["organizer", "admin"])
    .limit(1)
    .single()

  if (!membership) {
    return 0
  }

  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending")

  if (error) {
    console.error("Error getting pending count:", error)
    return 0
  }

  return count || 0
}
