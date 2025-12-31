import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="max-w-xl mx-auto p-8">
        <p>You must be logged in to view your profile.</p>
      </main>
    )
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, created_at")
    .eq("id", user.id)
    .single()

  // Update profile action
  async function updateProfile(formData: FormData) {
    "use server"

    const supabase = await createSupabaseServerClient()
    const fullName = formData.get("full_name") as string

    if (!fullName) return

    await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id)

    revalidatePath("/profile")
  }

  // Logout action
  async function logout() {
    "use server"

    const supabase = await createSupabaseServerClient()
    await supabase.auth.signOut()

    redirect("/auth/login")
  }

  return (
    <main className="max-w-xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-semibold">
        Profile
      </h1>

      {/* Email */}
      <section className="border rounded-lg p-4 bg-white">
        <p className="text-sm text-gray-500">
          Email
        </p>
        <p className="font-medium">
          {user.email}
        </p>
      </section>

      {/* Full name */}
      <section className="border rounded-lg p-4 bg-white">
        <p className="text-sm text-gray-500 mb-1">
          Full name
        </p>

        <form action={updateProfile} className="space-y-3">
          <input
            type="text"
            name="full_name"
            defaultValue={profile?.full_name ?? ""}
            placeholder="Enter your full name"
            className="w-full border rounded px-3 py-2"
          />

          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded"
          >
            Save
          </button>
        </form>
      </section>

      {/* Account info */}
      {profile?.created_at && (
        <p className="text-xs text-gray-400">
          Account created on{" "}
          {new Date(profile.created_at).toLocaleDateString()}
        </p>
      )}

      {/* Logout */}
      <form action={logout}>
        <button
          type="submit"
          className="w-full px-4 py-3 border border-red-500 text-red-600 rounded-lg"
        >
          Log out
        </button>
      </form>
    </main>
  )
}
