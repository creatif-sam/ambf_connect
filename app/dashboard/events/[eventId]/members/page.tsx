import Link from "next/link"
import { notFound } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import RoleSelector from "./RoleSelector"

// Force dynamic rendering to avoid stale cached data
export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{
    eventId: string
  }>
}

type MemberRow = {
  id: string
  role: string
  created_at: string
  profiles: {
    id: string
    full_name: string | null
    avatar_url: string | null
    email: string | null
  } | null
}

export default async function EventMembersPage({ params }: PageProps) {
  const { eventId } = await params
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return null

  /* ================= VERIFY USER IS ORGANIZER OR ADMIN ================= */

  const { data: currentUserMembership } = await supabase
    .from("event_members")
    .select("role")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .in("role", ["organizer", "admin"])
    .single()

  if (!currentUserMembership) {
    notFound()
  }

  /* ================= FETCH EVENT ================= */

  const { data: event } = await supabase
    .from("events")
    .select("id, title")
    .eq("id", eventId)
    .single()

  if (!event) {
    notFound()
  }

  /* ================= FETCH ALL MEMBERS ================= */

  const { data: members, error } = await supabase
    .from("event_members")
    .select(`
      id,
      role,
      created_at,
      profiles (
        id,
        full_name,
        avatar_url,
        email
      )
    `)
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const typedMembers = (members || []) as unknown as MemberRow[]

  // Group members by role
  const membersByRole = {
    admin: typedMembers.filter(m => m.role === "admin"),
    organizer: typedMembers.filter(m => m.role === "organizer"),
    speaker: typedMembers.filter(m => m.role === "speaker"),
    media: typedMembers.filter(m => m.role === "media"),
    attendee: typedMembers.filter(m => m.role === "attendee")
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* ================= BREADCRUMBS ================= */}
        <nav className="text-sm text-zinc-500">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/dashboard" className="hover:text-black">
                Dashboard
              </Link>
            </li>
            <li>›</li>
            <li>
              <Link href="/dashboard/events" className="hover:text-black">
                Events
              </Link>
            </li>
            <li>›</li>
            <li>
              <Link
                href={`/dashboard/events/${event.id}`}
                className="hover:text-black"
              >
                {event.title}
              </Link>
            </li>
            <li>›</li>
            <li className="font-medium text-black">Members & Roles</li>
          </ol>
        </nav>

        {/* ================= HEADER ================= */}
        <div>
          <h1 className="text-2xl font-semibold">Members & Roles</h1>
          <p className="text-sm text-zinc-500">
            Manage member roles for {event.title}. Organizers and admins have
            dashboard access.
          </p>
        </div>

        {/* ================= ROLE INFO ================= */}
        <div className="rounded-lg border bg-blue-50 p-4 text-sm">
          <p className="font-medium mb-2">Role Hierarchy:</p>
          <ul className="space-y-1 text-zinc-600">
            <li>
              <strong>Admin:</strong> Full access + dashboard
            </li>
            <li>
              <strong>Organizer:</strong> Full access + dashboard
            </li>
            <li>
              <strong>Media:</strong> Standard access
            </li>
            <li>
              <strong>Speaker:</strong> Standard access
            </li>
            <li>
              <strong>Attendee:</strong> Standard access (default for new
              members)
            </li>
          </ul>
        </div>

        {/* ================= MEMBERS TABLE ================= */}
        {typedMembers.length === 0 ? (
          <div className="rounded-md border p-8 text-center text-sm text-zinc-500">
            No members yet
          </div>
        ) : (
          <div className="space-y-6">
            {/* Admins */}
            {membersByRole.admin.length > 0 && (
              <div className="overflow-hidden rounded-lg border bg-white">
                <div className="bg-red-50 px-4 py-2 font-medium border-b">
                  Admins ({membersByRole.admin.length})
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Member</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membersByRole.admin.map(member => (
                      <MemberRow
                        key={member.id}
                        member={member}
                        eventId={eventId}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Organizers */}
            {membersByRole.organizer.length > 0 && (
              <div className="overflow-hidden rounded-lg border bg-white">
                <div className="bg-purple-50 px-4 py-2 font-medium border-b">
                  Organizers ({membersByRole.organizer.length})
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Member</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membersByRole.organizer.map(member => (
                      <MemberRow
                        key={member.id}
                        member={member}
                        eventId={eventId}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Speakers */}
            {membersByRole.speaker.length > 0 && (
              <div className="overflow-hidden rounded-lg border bg-white">
                <div className="bg-green-50 px-4 py-2 font-medium border-b">
                  Speakers ({membersByRole.speaker.length})
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Member</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membersByRole.speaker.map(member => (
                      <MemberRow
                        key={member.id}
                        member={member}
                        eventId={eventId}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Media */}
            {membersByRole.media.length > 0 && (
              <div className="overflow-hidden rounded-lg border bg-white">
                <div className="bg-yellow-50 px-4 py-2 font-medium border-b">
                  Media ({membersByRole.media.length})
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Member</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membersByRole.media.map(member => (
                      <MemberRow
                        key={member.id}
                        member={member}
                        eventId={eventId}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Attendees */}
            {membersByRole.attendee.length > 0 && (
              <div className="overflow-hidden rounded-lg border bg-white">
                <div className="bg-zinc-50 px-4 py-2 font-medium border-b">
                  Attendees ({membersByRole.attendee.length})
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Member</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membersByRole.attendee.map(member => (
                      <MemberRow
                        key={member.id}
                        member={member}
                        eventId={eventId}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ================= MEMBER ROW COMPONENT ================= */

function MemberRow({
  member,
  eventId
}: {
  member: MemberRow
  eventId: string
}) {
  return (
    <tr className="border-t">
      {/* ================= NAME ================= */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {member.profiles?.avatar_url ? (
            <img
              src={member.profiles.avatar_url}
              alt={member.profiles.full_name ?? "User"}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs text-zinc-500">
              {member.profiles?.full_name?.charAt(0).toUpperCase() ?? "?"}
            </div>
          )}

          <span>{member.profiles?.full_name ?? "Unnamed user"}</span>
        </div>
      </td>

      {/* ================= EMAIL ================= */}
      <td className="px-4 py-3 text-zinc-500">
        {member.profiles?.email ?? "No email"}
      </td>

      {/* ================= ROLE SELECTOR ================= */}
      <td className="px-4 py-3">
        <RoleSelector
          memberId={member.id}
          currentRole={member.role}
          eventId={eventId}
        />
      </td>

      {/* ================= DATE ================= */}
      <td className="px-4 py-3 text-zinc-500">
        {new Date(member.created_at).toLocaleDateString()}
      </td>
    </tr>
  )
}
