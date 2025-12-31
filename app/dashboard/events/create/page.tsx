"use client"

import { useState } from "react"
import { createEvent } from "@/lib/queries/events"
import { useRouter } from "next/navigation"

export default function CreateEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title: "",
    description: "",
    slug: "",
    start_date: "",
    end_date: ""
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await createEvent(form)
      router.push("/dashboard")
    } catch (err) {
      alert("Failed to create event")
      setLoading(false)
    }
  }

  return (
    <main className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-4">Create Event</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Event title"
          required
          className="w-full border p-2 rounded"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          placeholder="Description"
          className="w-full border p-2 rounded"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />

        <input
          placeholder="Slug eg ambf-2026"
          required
          className="w-full border p-2 rounded"
          value={form.slug}
          onChange={e => setForm({ ...form, slug: e.target.value })}
        />

        <input
          type="date"
          required
          className="w-full border p-2 rounded"
          value={form.start_date}
          onChange={e => setForm({ ...form, start_date: e.target.value })}
        />

        <input
          type="date"
          required
          className="w-full border p-2 rounded"
          value={form.end_date}
          onChange={e => setForm({ ...form, end_date: e.target.value })}
        />

        <button
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>
    </main>
  )
}
