"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signUp } from "@/lib/supabase/auth"

export default function RegisterPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-3xl font-semibold">
          Create account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            required
            className="w-full border rounded-lg px-4 py-3"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email address"
            required
            className="w-full border rounded-lg px-4 py-3"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            required
            className="w-full border rounded-lg px-4 py-3"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <input
            type="text"
            placeholder="Job Title"
            required
            className="w-full border rounded-lg px-4 py-3"
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
          />

          <input
            type="text"
            placeholder="Company"
            required
            className="w-full border rounded-lg px-4 py-3"
            value={company}
            onChange={e => setCompany(e.target.value)}
          />

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
      </div>
    </div>
  )
}
