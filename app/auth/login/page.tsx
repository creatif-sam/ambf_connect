"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { signIn } from "@/lib/supabase/auth"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkSession() {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (user) {
        router.replace("/profile")
        return
      }

      setCheckingSession(false)
    }

    checkSession()
  }, [router, supabase])

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

    router.replace("/profile")
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">
          Checking session...
        </p>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden grid grid-cols-1 md:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white px-12">
        <h1 className="text-4xl font-bold mb-4">
          AMBF Connect
        </h1>

        <p className="text-lg text-gray-300 text-center max-w-sm">
          A secure platform for events, announcements, and professional
          networking.
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
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email address"
                required
                className="w-full border rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                className="w-full border rounded-lg px-4 py-3 pr-11 focus:outline-none focus:ring-2 focus:ring-black"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

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

          <div className="border rounded-lg p-4 text-sm text-center bg-gray-50">
            <p className="text-gray-600 mb-2">
              Don't have an account?{" "}
              <a
                href="/auth/register"
                className="font-semibold text-black underline hover:text-zinc-700"
              >
                Sign up
              </a>
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
