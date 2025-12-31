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
    return (
      <main className="max-w-xl mx-auto p-8">
        <p>You must be logged in to view your profile.</p>
      </main>
    )
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, job_title, company, avatar_url, created_at")
    .eq("id", user.id)
    .single()

  const profileFields = [
    profile?.full_name,
    profile?.job_title,
    profile?.company,
    profile?.avatar_url
  ]

  const completionPercent = Math.round(
    (profileFields.filter(Boolean).length / profileFields.length) * 100
  )

  async function updateProfile(formData: FormData) {
    "use server"

    const supabase = await createSupabaseServerClient()

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

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
    <main className="max-w-xl mx-auto p-8 space-y-10">
      <h1 className="text-2xl font-semibold">
        Profile
      </h1>

      <section className="border rounded-lg p-6 bg-white space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-500">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg font-medium">
                {profile?.full_name?.charAt(0) ?? "?"}
              </span>
            )}
          </div>

          <div>
            <p className="font-medium">
              {profile?.full_name || "Unnamed user"}
            </p>
            <p className="text-sm text-gray-500">
              {user.email}
            </p>
          </div>
        </div>

        <AvatarUpload />
      </section>

      <section className="border rounded-lg p-6 bg-white space-y-3">
        <div className="flex justify-between">
          <p className="font-medium">
            Profile completeness
          </p>
          <p className="text-sm text-gray-600">
            {completionPercent}%
          </p>
        </div>

        <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
          <div
            className="h-full bg-black"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </section>

      <section className="border rounded-lg p-6 bg-white">
        <form action={updateProfile} className="space-y-4">
          <input
            name="full_name"
            defaultValue={profile?.full_name ?? ""}
            className="w-full border rounded px-3 py-2"
          />
          <input
            name="job_title"
            defaultValue={profile?.job_title ?? ""}
            className="w-full border rounded px-3 py-2"
          />
          <input
            name="company"
            defaultValue={profile?.company ?? ""}
            className="w-full border rounded px-3 py-2"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded"
          >
            Save changes
          </button>
        </form>
      </section>

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
