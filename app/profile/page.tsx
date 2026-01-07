import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ProfileClient from "./ProfileClient"

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, job_title, company, avatar_url, bio, sector_of_activity, country")
    .eq("id", user.id)
    .single()

  const { count: pendingConnections } = await supabase
    .from("networking_requests")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", user.id)
    .eq("status", "pending")

  const { count: totalConnections } = await supabase
    .from("networking_requests")
    .select("*", { count: "exact", head: true })
    .or(
      `sender_id.eq.${user.id},receiver_id.eq.${user.id}`
    )
    .eq("status", "accepted")

  // Get user's highest role from event_members
  const { data: membershipData } = await supabase
    .from("event_members")
    .select("role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  const userRole = membershipData?.role || "attendee"

  return (
    <ProfileClient
      profile={profile}
      email={user.email ?? ""}
      totalConnections={totalConnections ?? 0}
      pendingConnections={pendingConnections ?? 0}
      userRole={userRole}
    />
  )
}
