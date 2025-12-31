import Link from "next/link"
import {
  LogIn,
  Lock,
  BadgeCheck,
  Megaphone,
  Calendar,
  LayoutList,
  Phone
} from "lucide-react"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function AnnouncementsPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  /* ======================================================
     UNAUTHENTICATED STATE
     ====================================================== */
  if (!user) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-6 text-white">
        <div className="relative max-w-md w-full rounded-2xl bg-gradient-to-br from-yellow-500/30 to-yellow-700/10 p-[1px]">
          <div className="rounded-2xl bg-black p-8 text-center space-y-6">
            <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600 text-black animate-lock-reveal animate-gold-pulse">
              <Lock className="h-7 w-7" />
            </div>

            <h1 className="text-2xl font-semibold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Announcements Access
            </h1>

            <p className="text-sm uppercase tracking-wide text-yellow-500">
              Beyond the game, build the economy
            </p>

            <p className="text-gray-400 leading-relaxed">
              Announcements, agenda updates, session details and emergency
              contacts are available to authenticated participants only.
            </p>

            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-medium transition"
              >
                <LogIn className="h-4 w-4" />
                Log in to continue
              </Link>

              <a
                href="mailto:contact@africamedforum.com"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10 transition"
              >
                <BadgeCheck className="h-4 w-4" />
                Request admission
              </a>
            </div>

            <p className="text-xs text-gray-500">
              Access is managed by event organizers.
            </p>
          </div>
        </div>
      </main>
    )
  }

  /* ======================================================
     AUTHENTICATED STATE
     ====================================================== */

  const { data: memberships } = await supabase
    .from("event_members")
    .select("event_id")
    .eq("user_id", user.id)

  if (!memberships || memberships.length === 0) {
    return (
      <main className="max-w-3xl mx-auto p-8">
        <h1 className="text-2xl font-semibold">Announcements</h1>
        <p className="text-gray-500 mt-4">No announcements yet.</p>
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

  /* ======================================================
     PAGE RENDER
     ====================================================== */
  return (
    <main className="max-w-3xl mx-auto px-4 pt-6 pb-24 space-y-6">
      <h1 className="text-2xl font-semibold text-white">
        Event Hub
      </h1>

      {/* ======================================================
          STICKY ICON TAB BAR
         ====================================================== */}
      <div className="sticky top-0 z-40 bg-black -mx-4 px-4 pb-3 border-b border-yellow-500/20">
        <div className="flex gap-2 overflow-x-auto pt-3">
          {[
            { label: "Announcements", icon: Megaphone, active: true },
            { label: "Agenda", icon: Calendar },
            { label: "Sessions", icon: LayoutList },
            { label: "Emergency", icon: Phone }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.label}
                className={`
                  flex items-center gap-2
                  px-4 py-2 rounded-full text-sm font-medium
                  whitespace-nowrap transition
                  ${
                    tab.active
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black"
                      : "bg-zinc-900 text-gray-400 hover:text-yellow-400"
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ======================================================
          ANNOUNCEMENTS LIST
         ====================================================== */}
      {!announcements || announcements.length === 0 ? (
        <p className="text-gray-500">No announcements yet.</p>
      ) : (
        <ul className="space-y-4">
          {announcements.map(a => (
            <li
              key={a.id}
              className="rounded-xl p-5 bg-gradient-to-br from-black to-zinc-900 border border-yellow-500/20 hover:border-yellow-500/40 transition"
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

              <p className="text-gray-300 leading-relaxed">
                {a.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
