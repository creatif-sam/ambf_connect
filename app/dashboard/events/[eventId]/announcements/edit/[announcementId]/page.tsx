"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export default function EditAnnouncementPage() {
  const router = useRouter()
  const params = useParams()

  const eventId = params.eventId as string
  const announcementId = params.announcementId as string

  const supabase = createSupabaseBrowserClient()

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAnnouncement() {
      const { data, error } = await supabase
        .from("announcements")
        .select("title, body")
        .eq("id", announcementId)
        .single()

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setTitle(data.title)
      setBody(data.body)
      setLoading(false)
    }

    loadAnnouncement()
  }, [announcementId, supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const { error } = await supabase
      .from("announcements")
      .update({ title, body })
      .eq("id", announcementId)

    if (error) {
      setError(error.message)
      return
    }

    router.push(`/dashboard/events/${eventId}/announcements`)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        Loading…
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-6 rounded-lg border bg-white p-6">
        {/* Top navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-sm text-zinc-600 hover:text-black"
          >
            ← Back
          </button>

          <button
            onClick={() =>
              router.push(
                `/dashboard/events/${eventId}/announcements`
              )
            }
            className="text-sm text-zinc-600 hover:text-black"
          >
            View announcements
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-semibold">
            Edit announcement
          </h1>
          <p className="text-sm text-zinc-500">
            Update the message visible to event participants
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
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
              rows={5}
              required
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/dashboard/events/${eventId}/announcements`
                )
              }
              className="rounded-md border px-4 py-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-md bg-black px-4 py-2 text-white"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
