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
    <main className="max-w-2xl mx-auto px-6 py-10 space-y-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">
          Profile
        </h1>
        <p className="text-sm text-gray-500">
          Manage your personal information and profile photo
        </p>
      </header>

      <section className="rounded-xl border bg-white p-6 space-y-4">
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-500">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xl font-semibold">
                {profile?.full_name?.charAt(0) ?? "?"}
              </span>
            )}
          </div>

          <div className="flex-1">
            <p className="text-lg font-medium">
              {profile?.full_name || "Unnamed user"}
            </p>
            <p className="text-sm text-gray-500">
              {user.email}
            </p>
          </div>
        </div>

        <AvatarUpload />
      </section>

      <section className="rounded-xl border bg-white p-6 space-y-3">
        <div className="flex justify-between items-center">
          <p className="font-medium">
            Profile completeness
          </p>
          <span className="text-sm text-gray-600">
            {completionPercent}%
          </span>
        </div>

        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-black transition-all"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6">
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
            className="inline-flex items-center px-4 py-2 rounded-md bg-black text-white text-sm font-medium"
          >
            Save changes
          </button>
        </form>
      </section>

      <form action={logout}>
        <button
          type="submit"
          className="w-full px-4 py-3 rounded-xl border border-red-500 text-red-600 text-sm font-medium"
        >
          Log out
        </button>
      </form>
    </main>
  )
}
