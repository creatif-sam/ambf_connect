import { createSupabaseServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import PublicProfileClient from "./PublicProfileClient"

type PageProps = {
  params: Promise<{
    userId: string
  }>
}

export default async function PublicProfilePage({
  params
}: PageProps) {
  const { userId } = await params

  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(\"id, full_name, job_title, company, avatar_url, bio, sector_of_activity, country, created_at\")
    .eq("id", userId)
    .single()

  if (error || !profile) {
    notFound()
  }

  const { count: totalConnections } = await supabase
    .from("networking_requests")
    .select("*", { count: "exact", head: true })
    .or(
      `sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`
    )
    .eq("status", "accepted")

  return (
    <PublicProfileClient
      profile={profile}
      totalConnections={totalConnections}
    />
  )
}
