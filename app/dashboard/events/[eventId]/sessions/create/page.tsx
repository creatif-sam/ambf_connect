"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Save, Clock } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { DAY_OPTIONS } from "@/lib/constants/agenda"

export default function CreateSessionPage() {
  const params = useParams()
  const eventId = params?.eventId as string
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
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* ===============================
     HELPERS
     =============================== */
 

  /* ===============================
     SUBMIT
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
      day, // ✅ day1 | day2
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
      {/* ================= BREADCRUMBS ================= */}
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
          <li>
            <Link
              href={`/dashboard/events/${eventId}/sessions`}
              className="hover:text-black"
            >
              Sessions
            </Link>
          </li>
          <li>›</li>
          <li className="font-medium text-black">Create</li>
        </ol>
      </nav>

      {/* HEADER */}
      <header>
        <h1 className="text-2xl font-semibold">Create session</h1>
        <p className="text-sm text-gray-500">
          Add a new session to your event program
        </p>
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
        {error && <p className="text-sm text-red-600">{error}</p>}

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
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-black text-white disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Create session"}
          </button>
        </div>
      </form>
    </main>
  )
}
