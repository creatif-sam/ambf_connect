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
      {/* Brand panel */}
      <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white px-12">
        <h1 className="text-4xl font-bold mb-4">
          AMBF Connect
        </h1>

        <p className="text-lg text-gray-300 text-center max-w-sm">
          A secure platform for events, announcements, and professional
          networking..
        </p>
      </div>

      {/* Login panel */}
      <div className="flex flex-col justify-center px-6 md:px-16 bg-white">
        <div className="max-w-md w-full mx-auto space-y-6">
          <header className="space-y-2">
            <h2 className="text-3xl font-semibold">
              Sign in
            </h2>
            <p className="text-gray-600">
              Access your AMBF Connect account
            </p>
          </header>

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

          <div className="flex justify-between items-center text-sm">
            <a
              href="/auth/forgot-password"
              className="text-gray-600 hover:text-black"
            >
              Forgot your password?
            </a>
          </div>

          <div className="border rounded-lg p-4 text-sm text-gray-600 bg-gray-50">
            <p className="font-medium text-gray-800 mb-1">
              Need an account?
            </p>
            <p>
              Registration is managed by the organizers.
              Please contact{" "}
              <a
                href="mailto:contact@africamedforum.com"
                className="font-medium underline hover:text-black"
              >
                contact@africamedforum.com
              </a>{" "}
              to request access.
            </p>
          </div>

          <p className="text-xs text-gray-500 text-center">
            By signing in, you agree to our{" "}
            <a
              href="/privacy-policy"
              className="underline hover:text-black"
            >
              Privacy Policy
            </a>.
          </p>
        </div>
      </div>
    </div>
  )
}
