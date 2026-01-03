"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export default function CreateAnnouncementPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.eventId as string

  const supabase = createSupabaseBrowserClient()

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      setError("Not authenticated")
      setLoading(false)
      return
    }

    const { error } = await supabase.from("announcements").insert({
      title,
      body,
      event_id: eventId,
      created_by: user.id
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(`/dashboard/events/${eventId}/announcements`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New announcement</h1>
        <p className="text-sm text-zinc-500">
          This announcement will be visible to all event participants
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Message
          </label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            required
            rows={5}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded-md border"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-md bg-black text-white"
          >
            {loading ? "Publishing…" : "Publish announcement"}
          </button>
        </div>
      </form>
    </div>
  )
}
