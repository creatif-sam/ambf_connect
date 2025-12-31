export const dynamic = "force-dynamic"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default function LoginPage() {
  async function login(formData: FormData) {
    "use server"

    const supabase = await createSupabaseServerClient()

    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (!error) {
      redirect("/")
    }
  }

  return (
    <main className="max-w-md mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-semibold">
        Log in
      </h1>

      <form action={login} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email address"
          required
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="w-full border rounded px-3 py-2"
        />

        <button
          type="submit"
          className="w-full px-4 py-2 bg-black text-white rounded"
        >
          Log in
        </button>
      </form>
    </main>
  )
}
