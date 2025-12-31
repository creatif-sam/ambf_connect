import { notFound } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params

  const supabase = await createSupabaseServerClient()

  const { data: event, error } = await supabase
    .from("events")
    .select(`
      id,
      title,
      description,
      start_date,
      end_date
    `)
    .eq("slug", slug)
    .single()

  if (error || !event) {
    notFound()
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-black mb-2">
        {event.title}
      </h1>

      <p className="text-gray-600 mb-6">
        {event.start_date} to {event.end_date}
      </p>

      {event.description && (
        <p className="text-gray-800 leading-relaxed">
          {event.description}
        </p>
      )}

      <div className="mt-10 border-t pt-6">
        <p className="text-sm text-gray-500">
          Announcements, sessions, and networking will appear here.
        </p>
      </div>
    </main>
  )
}
