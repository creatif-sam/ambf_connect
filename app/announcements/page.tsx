import Link from "next/link"
import {
  LogIn,
  Lock,
  BadgeCheck
} from "lucide-react"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function AnnouncementsPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  /* ===============================
     UNAUTHENTICATED STATE
     =============================== */
  if (!user) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-6 text-white">
        <div className="
          relative max-w-md w-full rounded-2xl
          bg-gradient-to-br from-yellow-500/30 to-yellow-700/10
          p-[1px]
        ">
          <div className="rounded-2xl bg-black p-8 text-center space-y-6">
            {/* Icon */}
            <div className="
  mx-auto h-16 w-16 rounded-full
  flex items-center justify-center
  bg-gradient-to-br from-yellow-400 to-yellow-600
  text-black
  animate-lock-reveal animate-gold-pulse
">
  <Lock className="h-7 w-7" />
</div>


            {/* Title */}
            <h1 className="
              text-2xl font-semibold
              bg-gradient-to-r from-yellow-400 to-yellow-600
              bg-clip-text text-transparent
            ">
              Announcements Access
            </h1>

            {/* Theme */}
            <p className="text-sm uppercase tracking-wide text-yellow-500">
              Beyond the game, build the economy
            </p>

            {/* Description */}
            <p className="text-gray-400 leading-relaxed">
              Official announcements, strategic updates, and event
              communications are available exclusively to authenticated
              participants.
            </p>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="
                  inline-flex items-center justify-center gap-2
                  w-full py-3 rounded-lg
                  bg-gradient-to-r from-yellow-400 to-yellow-600
                  text-black font-medium
                  hover:from-yellow-300 hover:to-yellow-500
                  transition-all
                "
              >
                <LogIn className="h-4 w-4" />
                Log in to continue
              </Link>

              <a
                href="mailto:contact@africamedforum.com"
                className="
                  inline-flex items-center justify-center gap-2
                  w-full py-3 rounded-lg
                  border border-yellow-500/40
                  text-yellow-500
                  hover:bg-yellow-500/10
                  transition-all
                "
              >
                <BadgeCheck className="h-4 w-4" />
                Request admission
              </a>
            </div>

            {/* Footer */}
            <p className="text-xs text-gray-500">
              Access is granted by organizers and administrators.
            </p>
          </div>
        </div>
      </main>
    )
  }

  /* ===============================
     AUTHENTICATED STATE
     =============================== */

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
              className="
                rounded-xl p-5
                bg-gradient-to-br from-black to-zinc-900
                border border-yellow-500/20
                hover:border-yellow-500/40
                transition
              "
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="font-medium text-lg text-white">
                  {a.title}
                </h2>
                <span className="text-xs text-gray-400">
                  {new Date(a.created_at).toLocaleDateString()}
                </span>
              </div>

              {a.events && a.events.length > 0 && (
                <p className="text-sm text-yellow-500 mb-2">
                  {a.events[0].title}
                </p>
              )}

              <p className="text-gray-300">
                {a.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
