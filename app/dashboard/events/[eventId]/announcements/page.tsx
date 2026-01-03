import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import DeleteAnnouncementButton from "@/components/DeleteAnnouncementButton"

type PageProps = {
  params: Promise<{
    eventId: string
  }>
}

export default async function EventAnnouncementsPage({
  params
}: PageProps) {
  const { eventId } = await params
  const supabase = await createSupabaseServerClient()

  const { data: announcements, error } = await supabase
    .from("announcements")
    .select("id, title, body, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Breadcrumbs */}
        <nav className="text-sm text-zinc-500">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/dashboard" className="hover:text-black">
                Dashboard
              </Link>
            </li>
            <li>›</li>
            <li>
              <Link
                href="/dashboard/events"
                className="hover:text-black"
              >
                Events
              </Link>
            </li>
            <li>›</li>
            <li className="text-black font-medium">
              Announcements
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Announcements
            </h1>
            <p className="text-sm text-zinc-500">
              Messages sent to all event participants
            </p>
          </div>

          <Link
            href={`/dashboard/events/${eventId}/announcements/create`}
            className="rounded-md bg-black px-4 py-2 text-white"
          >
            New announcement
          </Link>
        </div>

        {/* List */}
        {announcements.length === 0 ? (
          <div className="rounded-md border p-8 text-center text-sm text-zinc-500">
            No announcements yet
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map(item => (
              <div
                key={item.id}
                className="rounded-lg border bg-white p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-medium">
                      {item.title}
                    </h3>
                    <p className="text-sm text-zinc-600">
                      {item.body}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {new Date(
                        item.created_at
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/events/${eventId}/announcements/edit/${item.id}`}
                      className="rounded-md border px-3 py-1 text-sm"
                    >
                      Edit
                    </Link>

                    <DeleteAnnouncementButton
                      announcementId={item.id}
                      eventId={eventId}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
