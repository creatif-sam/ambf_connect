export const dynamic = "force-dynamic"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default function ResetPasswordPage() {
  async function resetPassword(formData: FormData) {
    "use server"

    const supabase = await createSupabaseServerClient()

    const password = formData.get("password") as string
    const confirm = formData.get("confirm") as string

    if (!password || password !== confirm) {
      return
    }

    const { error } = await supabase.auth.updateUser({
      password
    })

    if (!error) {
      redirect("/auth/login")
    }
  }

  return (
    <main className="max-w-md mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-semibold">
        Reset password
      </h1>

      <form action={resetPassword} className="space-y-4">
        <input
          type="password"
          name="password"
          placeholder="New password"
          required
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="password"
          name="confirm"
          placeholder="Confirm password"
          required
          className="w-full border rounded px-3 py-2"
        />

        <button
          type="submit"
          className="w-full px-4 py-2 bg-black text-white rounded"
        >
          Update password
        </button>
      </form>
    </main>
  )
}
