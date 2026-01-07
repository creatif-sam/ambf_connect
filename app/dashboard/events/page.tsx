"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export default function CreateEventPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    e.preventDefault()
    setLoading(true)
    setError(null)

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in to create an event")
      setLoading(false)
      return
    }

    const finalSlug = slug || generateSlug(title)

    const { data, error } = await supabase
      .from("events")
      .insert({
        title,
        slug: finalSlug,
        start_date: startDate || null,
        end_date: endDate || null,
        is_published: isPublished,
        created_by: user.id
      })
      .select("id")
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(`/dashboard/events/${data.id}`)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <nav className="text-sm text-zinc-500">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/dashboard" className="hover:text-black">
                Dashboard
              </Link>
            </li>
            <li>›</li>
            <li>
              <Link href="/dashboard/events" className="hover:text-black">
                Events
              </Link>
            </li>
            <li>›</li>
            <li className="text-black font-medium">
              Create event
            </li>
          </ol>
        </nav>

        <div>
          <h1 className="text-2xl font-semibold">
            Create new event
          </h1>
          <p className="text-sm text-zinc-500">
            Set up a new event and start managing its content
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border bg-white p-6"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Event title
            </label>
            <input
              value={title}
              onChange={e => {
                setTitle(e.target.value)
                setSlug(generateSlug(e.target.value))
              }}
              required
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Slug
            </label>
            <input
              value={slug}
              onChange={e => setSlug(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Start date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                End date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              id="isPublished"
              type="checkbox"
              checked={isPublished}
              onChange={e => setIsPublished(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="isPublished" className="text-sm">
              <span className="font-medium">
                Publish immediately
              </span>
              <p className="text-xs text-zinc-500">
                Unchecked events remain drafts.
              </p>
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Link
              href="/dashboard/events"
              className="rounded-md border px-4 py-2"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-black px-4 py-2 text-white"
            >
              {loading ? "Creating…" : "Create event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
