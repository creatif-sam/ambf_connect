"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signUp } from "@/lib/supabase/auth"
import { UserPlus, Mail, Lock, User, Briefcase, Building2, Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [company, setCompany] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await signUp(email, password, {
      full_name: fullName,
      job_title: jobTitle,
      company: company
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push("/auth/login")
  }

  return (
    <div className="h-screen overflow-hidden grid grid-cols-1 md:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white px-12">
        <div className="max-w-md space-y-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4">
            <UserPlus className="w-10 h-10 text-black" />
          </div>
          
          <h1 className="text-4xl font-bold">
            Join Africamed Connect
          </h1>

          <p className="text-lg text-gray-300">
            Create your account to connect with business leaders and professionals across Africa and the Mediterranean. Join the premier forum organized by Kardev.
          </p>

          <div className="space-y-4 pt-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Network with Professionals</h3>
                <p className="text-sm text-gray-400">Connect with business leaders across Africa and the Mediterranean</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Access Exclusive Events</h3>
                <p className="text-sm text-gray-400">Register for conferences and forums</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Stay Informed</h3>
                <p className="text-sm text-gray-400">Get real-time updates and announcements</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration panel */}
      <div className="flex flex-col justify-center px-6 md:px-16 bg-white">
        <div className="max-w-md w-full mx-auto space-y-6">
          <header className="space-y-2">
            <h2 className="text-3xl font-semibold">
              Create your account
            </h2>
            <p className="text-gray-600">
              Join the Africamed community
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Full Name"
                required
                className="w-full border rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email address"
                required
                className="w-full border rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min. 8 characters)"
                required
                minLength={8}
                className="w-full border rounded-lg pl-11 pr-11 py-3 focus:outline-none focus:ring-2 focus:ring-black transition-all"
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

            {/* Job Title */}
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Job Title"
                required
                className="w-full border rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
              />
            </div>

            {/* Company */}
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Company / Organization"
                required
                className="w-full border rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                value={company}
                onChange={e => setCompany(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-zinc-900 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="border rounded-lg p-4 text-sm text-center bg-gray-50">
            <p className="text-gray-600">
              Already have an account?{" "}
              <a
                href="/auth/login"
                className="font-semibold text-black underline hover:text-zinc-700"
              >
                Sign in
              </a>
            </p>
          </div>

          <p className="text-xs text-gray-500 text-center">
            By creating an account, you agree to our{" "}
            <a
              href="/privacy-policy"
              className="underline hover:text-black"
            >
              Privacy Policy
            </a>
            {" "}and Terms of Service.
          </p>
        </div>
      </div>
    </div>
  )
}
