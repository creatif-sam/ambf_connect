import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function AnnouncementsPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="max-w-xl mx-auto p-8">
        <p>You must be logged in to view announcements.</p>
      </main>
    )
  }

  // 1. Fetch event IDs the user belongs to
  const { data: memberships, error: membershipError } =
    await supabase
      .from("event_members")
      .select("event_id")
      .eq("user_id", user.id)

  if (membershipError || !memberships || memberships.length === 0) {
    return (
      <main className="max-w-3xl mx-auto p-8">
        <h1 className="text-2xl font-semibold">
          Announcements
        </h1>
        <p className="text-gray-500 mt-4">
          No announcements yet.
        </p>
      </main>
    )
  }

  const eventIds = memberships.map(m => m.event_id)

  // 2. Fetch announcements for those events
  const { data: announcements } = await supabase
    .from("announcements")
    .select(`
      id,
      title,
      body,
      created_at,
      events (
        id,
        title
      )
    `)
    .in("event_id", eventIds)
    .order("created_at", { ascending: false })

  return (
    <main className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-semibold">
        Announcements
      </h1>

      {!announcements || announcements.length === 0 ? (
        <p className="text-gray-500">
          No announcements yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {announcements.map(a => (
            <li
              key={a.id}
              className="border rounded-lg p-4 bg-white"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="font-medium text-lg">
                  {a.title}
                </h2>
                <span className="text-xs text-gray-400">
                  {new Date(a.created_at).toLocaleDateString()}
                </span>
              </div>

             {a.events && a.events.length > 0 && (
  <p className="text-sm text-gray-500 mb-2">
    {a.events[0].title}
  </p>
)}


              <p className="text-gray-700">
                {a.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
