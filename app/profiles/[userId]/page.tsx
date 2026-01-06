import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"

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
    .select("id, full_name, job_title, company, avatar_url, bio, created_at")
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
    <main className="max-w-md mx-auto px-4 py-8 space-y-8">

      {/* Back navigation */}
      <div>
        <Link
          href="/networking"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black"
        >
          <ArrowLeft size={16} />
          Back to networking
        </Link>
      </div>

      {/* Profile header */}
      <section className="flex flex-col items-center text-center space-y-4">
        <div className="h-28 w-28 rounded-full bg-gray-200 overflow-hidden">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-3xl font-semibold text-gray-500">
              {profile.full_name?.charAt(0) ?? "?"}
            </div>
          )}
        </div>

        <div>
          <p className="text-xl font-semibold">
            {profile.full_name || "Unnamed attendee"}
          </p>
          <p className="text-sm text-gray-500">
            {profile.job_title}
          </p>
          <p className="text-sm text-gray-500">
            {profile.company}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="flex justify-around text-center border rounded-xl py-4 bg-white">
        <div>
          <p className="text-lg font-semibold">
            {totalConnections ?? 0}
          </p>
          <p className="text-xs text-gray-500">
            Connections
          </p>
        </div>

        <div>
          <p className="text-lg font-semibold">
            —
          </p>
          <p className="text-xs text-gray-500">
            Events
          </p>
        </div>

        <div>
          <p className="text-lg font-semibold">
            —
          </p>
          <p className="text-xs text-gray-500">
            Joined
          </p>
        </div>
      </section>

      {/* Bio */}
      {profile.bio && (
        <section className="border rounded-xl p-6 bg-white space-y-2">
          <p className="font-medium">
            Bio
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {profile.bio}
          </p>
        </section>
      )}

      {/* About */}
      <section className="border rounded-xl p-6 bg-white space-y-2">
        <p className="font-medium">
          About
        </p>

        <p className="text-sm text-gray-600">
          Joined on{" "}
          {new Date(profile.created_at).toLocaleDateString()}
        </p>
      </section>

      {/* Actions */}
      <section className="space-y-3">
        <button
          className="w-full py-3 rounded-xl bg-black text-white font-medium"
        >
          Connect
        </button>

        <button
          className="w-full py-3 rounded-xl border font-medium"
        >
          Message
        </button>
      </section>

    </main>
  )
}
