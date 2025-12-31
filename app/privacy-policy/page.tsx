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
    return <p>Not logged in</p>
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, job_title, company, avatar_url")
    .eq("id", user.id)
    .single()

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
    <main className="max-w-xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-semibold">Profile</h1>

      <section className="border rounded p-4">
        <p className="font-medium">{profile?.full_name}</p>
        <p className="text-sm">{user.email}</p>

        <AvatarUpload />
      </section>

      <section className="border rounded p-4">
        <form action={updateProfile} className="space-y-3">
          <input name="full_name" defaultValue={profile?.full_name ?? ""} />
          <input name="job_title" defaultValue={profile?.job_title ?? ""} />
          <input name="company" defaultValue={profile?.company ?? ""} />
          <button type="submit">Save</button>
        </form>
      </section>

      <form action={logout}>
        <button type="submit">Log out</button>
      </form>
    </main>
  )
}
