"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Save, Clock, Trash2, Eye, EyeOff } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { DAY_OPTIONS } from "@/lib/constants/agenda"

export default function EditSessionPage() {
  const params = useParams()
  const eventId = params?.eventId as string
  const sessionId = params?.sessionId as string
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  /* ===============================
     FORM STATE
     =============================== */
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [sessionType, setSessionType] = useState("")
  const [day, setDay] = useState<"day1" | "day2">("day1")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* ===============================
     LOAD SESSION DATA
     =============================== */
  useEffect(() => {
    async function loadSession() {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .single()

      if (error || !data) {
        setError("Session not found")
        setLoading(false)
        return
      }

      setTitle(data.title || "")
      setDescription(data.description || "")
      setSessionType(data.session_type || "")
      setDay(data.day || "day1")
      setStartTime(data.start_time || "")
      setEndTime(data.end_time || "")
      setIsPublished(data.is_published || false)
      setLoading(false)
    }

    loadSession()
  }, [sessionId, supabase])

  /* ===============================
     UPDATE SESSION
     =============================== */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error } = await supabase
      .from("sessions")
      .update({
        title,
        description,
        session_type: sessionType,
        day,
        start_time: startTime,
        end_time: endTime,
        is_published: isPublished
      })
      .eq("id", sessionId)

    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }

    router.push(`/dashboard/events/${eventId}/agenda`)
  }

  /* ===============================
     DELETE SESSION
     =============================== */
  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this session?")) {
      return
    }

    setDeleting(true)
    setError(null)

    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("id", sessionId)

    if (error) {
      setError(error.message)
      setDeleting(false)
      return
    }

    router.push(`/dashboard/events/${eventId}/agenda`)
  }

  /* ===============================
     TOGGLE PUBLISH
     =============================== */
  async function togglePublish() {
    const newStatus = !isPublished
    setIsPublished(newStatus)

    const { error } = await supabase
      .from("sessions")
      .update({ is_published: newStatus })
      .eq("id", sessionId)

    if (error) {
      setError(error.message)
      setIsPublished(!newStatus) // revert on error
    }
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <p className="text-gray-500">Loading session...</p>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-8">
      {/* HEADER */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Edit session</h1>
          <p className="text-sm text-gray-500">
            Update session details and publish status
          </p>
        </div>

        <button
          onClick={togglePublish}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
            isPublished
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {isPublished ? (
            <>
              <Eye size={16} />
              Published
            </>
          ) : (
            <>
              <EyeOff size={16} />
              Draft
            </>
          )}
        </button>
      </header>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white border rounded-xl p-6"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Session title
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Opening Keynote"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Session description..."
          />
        </div>

        {/* Session type */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Session type
          </label>
          <input
            value={sessionType}
            onChange={e => setSessionType(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Keynote, Panel, Workshop"
          />
        </div>

        {/* Day */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Day
          </label>
          <select
            value={day}
            onChange={e => setDay(e.target.value as "day1" | "day2")}
            className="w-full border rounded-lg px-4 py-2"
          >
            {DAY_OPTIONS.map(d => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Start time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
                className="w-full border rounded-lg pl-10 pr-4 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              End time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                required
                className="w-full border rounded-lg pl-10 pr-4 py-2"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60 transition"
          >
            <Trash2 size={16} />
            {deleting ? "Deleting..." : "Delete session"}
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() =>
                router.push(`/dashboard/events/${eventId}/agenda`)
              }
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-60 transition"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </main>
  )
}
