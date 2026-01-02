import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import AvatarUpload from "./AvatarUpload"

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
    .select("full_name, job_title, company, avatar_url")
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

  async function updateProfile(formData: FormData) {
    "use server"

    const supabase = await createSupabaseServerClient()

    await supabase
      .from("profiles")
      .update({
        full_name: formData.get("full_name"),
        job_title: formData.get("job_title"),
        company: formData.get("company")
      })
      .eq("id", user.id)

    revalidatePath("/profile")
  }

  async function logout() {
    "use server"
    const supabase = await createSupabaseServerClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
  }

  return (
    <main className="max-w-md mx-auto px-4 py-8 space-y-8">

      {/* Profile header */}
      <section className="flex flex-col items-center text-center space-y-4">
        <div className="h-28 w-28 rounded-full bg-gray-200 overflow-hidden">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-3xl font-semibold text-gray-500">
              {profile?.full_name?.charAt(0) ?? "?"}
            </div>
          )}
        </div>

        <div>
          <p className="text-xl font-semibold">
            {profile?.full_name || "Unnamed user"}
          </p>
          <p className="text-sm text-gray-500">
            {profile?.job_title || "No job title"}
          </p>
          <p className="text-sm text-gray-500">
            {profile?.company || user.email}
          </p>
        </div>
      </section>

      {/* Stats row */}
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
            {pendingConnections ?? 0}
          </p>
          <p className="text-xs text-gray-500">
            Pending
          </p>
        </div>

        <div>
          <p className="text-lg font-semibold">
            0
          </p>
          <p className="text-xs text-gray-500">
            Events
          </p>
        </div>
      </section>

      {/* Action buttons */}
      <section className="flex gap-3">
        <button
          className="flex-1 py-2 rounded-lg border font-medium"
        >
          Edit profile
        </button>

        <form action={logout} className="flex-1">
          <button
            type="submit"
            className="w-full py-2 rounded-lg border border-red-500 text-red-600 font-medium"
          >
            Log out
          </button>
        </form>
      </section>

      {/* Avatar upload */}
      <section className="border rounded-xl p-4 bg-white">
        <AvatarUpload />
      </section>

      {/* Edit form */}
      <section className="border rounded-xl p-6 bg-white">
        <form action={updateProfile} className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              Full name
            </label>
            <input
              name="full_name"
              defaultValue={profile?.full_name ?? ""}
              className="mt-1 w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Job title
            </label>
            <input
              name="job_title"
              defaultValue={profile?.job_title ?? ""}
              className="mt-1 w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Company
            </label>
            <input
              name="company"
              defaultValue={profile?.company ?? ""}
              className="mt-1 w-full border rounded-md px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-black text-white font-medium"
          >
            Save changes
          </button>
        </form>
      </section>

    </main>
  )
}
