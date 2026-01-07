import Link from "next/link"
import { redirect } from "next/navigation"
import {
  PlusCircle,
  Users,
  Megaphone,
  Settings,
  UserCheck
} from "lucide-react"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getPendingUsers } from "@/lib/queries/pendingMembers"
import EventsList from "@/components/EventsList"
import PendingUsersList from "@/components/PendingMembersList"


// Force dynamic rendering - no caching
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile for completeness
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, job_title, company, avatar_url, bio")
    .eq("id", user.id)
    .single()

  // Fetch pending users (only for organizers)
  const pendingUsers = await getPendingUsers()

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-10">
      {/* ================= BREADCRUMBS ================= */}
      <nav className="text-sm text-zinc-500">
        <ol className="flex items-center gap-2">
          <li className="font-medium text-black">Dashboard</li>
        </ol>
      </nav>

      {/* ================= HEADER ================= */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Manage events, agenda, sessions and announcements
          </p>
        </div>

        <Link
          href="/dashboard/events/create"
          className="
            inline-flex items-center gap-2
            px-4 py-2 rounded-lg
            bg-black text-white
            hover:bg-zinc-900
            transition
          "
        >
          <PlusCircle className="h-4 w-4" />
          Create event
        </Link>
      </header>

      {/* ================= PENDING APPROVALS ================= */}
      {pendingUsers.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            <h2 className="text-lg font-medium">
              Pending User Registrations
            </h2>
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
              {pendingUsers.length}
            </span>
          </div>
          
          <PendingUsersList initialUsers={pendingUsers} />
        </section>
      )}

      {/* ================= GLOBAL ACTIONS ================= */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardAction
          title="All Attendees"
          description="View all registered participants across events"
          icon={Users}
          href="/dashboard/attendees"
        />

        <DashboardAction
          title="Platform Settings"
          description="Global configuration and permissions"
          icon={Settings}
          disabled
        />

        <DashboardAction
          title="Broadcast Announcements"
          description="Send announcements to all events"
          icon={Megaphone}
          disabled
        />
      </section>

      {/* ================= EVENTS LIST ================= */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">My Events</h2>

        <EventsList />
      </section>
    </main>
  )
}

/* ================= REUSABLE COMPONENTS ================= */

function DashboardAction({
  title,
  description,
  icon: Icon,
  href,
  disabled = false
}: {
  title: string
  description: string
  icon: any
  href?: string
  disabled?: boolean
}) {
  const Wrapper = href && !disabled ? Link : "div"

  return (
    <Wrapper
      href={href || "#"}
      className={`
        border rounded-xl p-5
        flex gap-4 items-start
        ${
          disabled
            ? "opacity-40 cursor-not-allowed"
            : "hover:border-black transition"
        }
      `}
    >
      <Icon className="h-6 w-6 mt-1" />

      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-gray-500">
          {description}
        </p>
        {disabled && (
          <p className="text-xs text-gray-400 mt-1">
            Coming soon
          </p>
        )}
      </div>
    </Wrapper>
  )
}
