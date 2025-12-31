"use client"

export const dynamic = "force-dynamic"


import { useState } from "react"
import { signIn } from "@/lib/supabase/auth"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push("/events")
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left panel */}
      <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white px-12">
        <h1 className="text-4xl font-bold mb-4">
          AMBF Connect
        </h1>
        <p className="text-lg text-gray-300 text-center max-w-sm">
          Your gateway to conferences, networking, and meaningful connections.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex flex-col justify-center px-6 md:px-16 bg-white">
        <div className="max-w-md w-full mx-auto space-y-6">
          <h2 className="text-3xl font-semibold">
            Access your account
          </h2>

          <p className="text-gray-600">
            Sign in to continue to AMBF Connect
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              required
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              required
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-zinc-900 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="text-right">
  <a
    href="/auth/forgot-password"
    className="text-sm text-gray-600 hover:text-black"
  >
    Forgot password?
  </a>
</div>


          <div className="border rounded-lg p-4 text-sm text-gray-600 bg-gray-50">
            <strong>No account yet?</strong> Contact the event organizer or
            administrator to receive access.
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
  By signing in, you agree to our{" "}
  <a
    href="/privacy-policy"
    className="underline hover:text-black"
  >
    Privacy Policy
  </a>
</p>

        </div>
      </div>
    </div>
  )
}
