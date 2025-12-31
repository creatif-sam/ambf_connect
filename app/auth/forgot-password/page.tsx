export const dynamic = "force-dynamic"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function ForgotPasswordPage() {
  const supabase = await createSupabaseServerClient()

  async function sendReset(formData: FormData) {
    "use server"

    const supabase = await createSupabaseServerClient()
    const email = formData.get("email") as string

    if (!email) return

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`
    })
  }

  return (
    <main className="max-w-md mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-semibold">
        Forgot password
      </h1>

      <p className="text-sm text-gray-600">
        Enter your email address and we will send you a reset link.
      </p>

      <form action={sendReset} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email address"
          required
          className="w-full border rounded px-3 py-2"
        />

        <button
          type="submit"
          className="w-full px-4 py-2 bg-black text-white rounded"
        >
          Send reset link
        </button>
      </form>
    </main>
  )
}
