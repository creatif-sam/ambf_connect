"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Save,
  Clock,
  LayoutList
} from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export default function CreateSessionPage() {
  const { eventId } = useParams()
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  /* ===============================
     FORM STATE
     =============================== */
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [sessionType, setSessionType] = useState("")
  const [day, setDay] = useState("Day 1")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* ===============================
     SUBMIT HANDLER
     =============================== */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error } = await supabase.from("sessions").insert({
      event_id: eventId,
      title,
      description,
      session_type: sessionType,
      day,
      start_time: startTime,
      end_time: endTime,
      is_published: false
    })

    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }

    router.push(`/dashboard/events/${eventId}/sessions`)
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-8">
      {/* ================= HEADER ================= */}
      <header>
        <h1 className="text-2xl font-semibold">
          Create session
        </h1>
        <p className="text-sm text-gray-500">
          Add a new session to your event program
        </p>
      </header>

      {/* ================= FORM ================= */}
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
            placeholder="Describe the session purpose and content"
          />
        </div>

        {/* Session Type */}
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

        {/* Day Selector */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Day
          </label>
          <select
            value={day}
            onChange={e => setDay(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="Day 1">Day 1 – 16th</option>
            <option value="Day 2">Day 2 – 17th</option>
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
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              router.push(`/dashboard/events/${eventId}/sessions`)
            }
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="
              inline-flex items-center gap-2
              px-5 py-2 rounded-lg
              bg-black text-white
              hover:bg-zinc-900
              disabled:opacity-60
              transition
            "
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Create session"}
          </button>
        </div>
      </form>
    </main>
  )
}
