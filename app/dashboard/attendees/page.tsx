import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function AllAttendeesPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: attendees, error } = await supabase
    .from("event_members")
    .select(`
      id,
      role,
      created_at,
      events (
        id,
        title
      ),
      profiles (
        id,
        full_name
      )
    `)
    .eq("role", "attendee")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Breadcrumbs */}
        <nav className="text-sm text-zinc-500">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/dashboard" className="hover:text-black">
                Dashboard
              </Link>
            </li>
            <li>›</li>
            <li className="text-black font-medium">
              All attendees
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">
            All attendees
          </h1>
          <p className="text-sm text-zinc-500">
            Participants registered across your events
          </p>
        </div>

        {/* Table */}
        {attendees.length === 0 ? (
          <div className="rounded-md border p-8 text-center text-sm text-zinc-500">
            No attendees found
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">
                    Name
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Event
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Registered
                  </th>
                </tr>
              </thead>

              <tbody>
                {attendees.map(item => (
                  <tr
                    key={item.id}
                    className="border-t"
                  >
                    <td className="px-4 py-3">
                      {item.profiles?.[0]?.full_name ?? "Unnamed user"}
                    </td>

                    <td className="px-4 py-3">
                     {item.events?.[0]?.title ?? "Unknown event"}

                    </td>

                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(
                        item.created_at
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
