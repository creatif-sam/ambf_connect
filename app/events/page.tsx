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
    <main className="max-w-6xl mx-auto px-6 py-14 text-white">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
          Events
        </h1>
        <p className="mt-3 text-gray-400 max-w-xl">
          Exclusive conferences, forums, and curated professional gatherings.
        </p>
      </header>

      {/* Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {events?.map(event => (
          <Link
            key={event.id}
            href={`/events/${event.slug}`}
            className="
              group relative rounded-2xl p-[1px]
              bg-gradient-to-br from-yellow-500/40 to-yellow-700/20
              transition-all duration-300
              hover:shadow-[0_0_40px_rgba(212,175,55,0.25)]
            "
          >
            <div className="
              relative h-full rounded-2xl bg-black
              p-6 flex flex-col
              transition-all duration-300
              group-hover:-translate-y-1
            ">
              {/* Top glow line */}
              <span className="
                absolute top-0 left-0 h-[2px] w-full
                bg-gradient-to-r from-transparent via-yellow-500 to-transparent
                opacity-0 group-hover:opacity-100
                transition-opacity
              " />

              <h2 className="
                text-lg font-semibold text-white
                group-hover:text-yellow-400
                transition-colors
              ">
                {event.title}
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                {event.start_date} to {event.end_date}
              </p>

              <div className="mt-auto pt-6 flex items-center justify-between">
                <span className="
                  text-sm font-medium text-yellow-500
                  group-hover:text-yellow-400
                ">
                  View event
                </span>

                <span className="
                  text-yellow-500 text-lg
                  transform transition-transform
                  group-hover:translate-x-1
                ">
                  →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {events?.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No events are currently available.
        </div>
      )}
    </main>
  )
}
