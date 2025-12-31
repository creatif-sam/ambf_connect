import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function EventsPage() {
  const supabase = await createSupabaseServerClient()

  const { data: events, error } = await supabase
    .from("events")
    .select("id, title, slug, start_date, end_date")
    .order("start_date", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">Events</h1>
      <p className="text-gray-600 mb-8">
        Discover conferences, forums, and professional meetups
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        {events?.map(event => (
          <Link
            key={event.id}
            href={`/events/${event.slug}`}
            className="border border-yellow-500 rounded-xl p-6 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-black">
              {event.title}
            </h2>

            <p className="text-sm text-gray-600 mt-2">
              {event.start_date} to {event.end_date}
            </p>

            <span className="inline-block mt-4 text-yellow-600 font-medium">
              View event →
            </span>
          </Link>
        ))}
      </div>
    </main>
  )
}
