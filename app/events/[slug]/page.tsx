import { notFound } from "next/navigation"
import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getNetworkingMap } from "@/lib/queries/networking"
import { Calendar, MapPin, Users, Clock, Award, Briefcase } from "lucide-react"
import EventCountdown from "@/components/EventCountdown"

type PageProps = {
  params: Promise<{ slug: string }>
}

type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  title: string | null
  organization: string | null
}

type EventMemberRow = {
  id: string
  role: "organizer" | "attendee" | "speaker"
  profiles: Profile | null
}

type Attendee = {
  id: string
  role: EventMemberRow["role"]
  profile: Profile
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params

  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { data: event } = await supabase
    .from("events")
    .select("id, title, description, start_date, end_date")
    .eq("slug", slug)
    .single()

  if (!event) {
    notFound()
  }

  const { data: members } = await supabase
    .from("event_members")
    .select(
      `
        id,
        role,
        profiles (
          id,
          full_name,
          avatar_url,
          title,
          organization
        )
      `
    )
    .eq("event_id", event.id)
    .returns<EventMemberRow[]>()

  const attendees: Attendee[] = (members ?? [])
    .filter(m => m.profiles !== null)
    .map(m => ({
      id: m.id,
      role: m.role,
      profile: m.profiles as Profile
    }))

  /* Networking map is already a Record<string, string> */
  const networkingMap = await getNetworkingMap(event.id, user.id)

  // Separate attendees by role
  const organizers = attendees.filter(a => a.role === "organizer")
  const speakers = attendees.filter(a => a.role === "speaker")
  const regularAttendees = attendees.filter(a => a.role === "attendee")

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-yellow-500/20">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 via-yellow-500/5 to-transparent" />
        
        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(250, 204, 21, 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(250, 204, 21, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          {/* Event Title */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
              {event.title}
            </h1>
            
            {event.description && (
              <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
                {event.description}
              </p>
            )}
          </div>

          {/* Event Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Date Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Date Range</p>
                  <p className="text-sm font-semibold text-white">{event.start_date}</p>
                  <p className="text-xs text-gray-400">to {event.end_date}</p>
                </div>
              </div>
            </div>

            {/* Status Card with Countdown */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Event Status</p>
                  <EventCountdown startDate={event.start_date} endDate={event.end_date} />
                </div>
              </div>
            </div>

            {/* Attendees Count Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Participants</p>
                  <p className="text-3xl font-bold text-white">{attendees.length}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {organizers.length} organizer{organizers.length !== 1 ? 's' : ''} · {speakers.length} speaker{speakers.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Organizers Section */}
        {organizers.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Award className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Event Organizers
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {organizers.map(attendee => {
                const status = networkingMap[attendee.profile.id]
                return (
                  <AttendeeCard
                    key={attendee.id}
                    attendee={attendee}
                    status={status}
                    roleColor="purple"
                  />
                )
              })}
            </div>
          </section>
        )}

        {/* Speakers Section */}
        {speakers.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Briefcase className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Speakers
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {speakers.map(attendee => {
                const status = networkingMap[attendee.profile.id]
                return (
                  <AttendeeCard
                    key={attendee.id}
                    attendee={attendee}
                    status={status}
                    roleColor="blue"
                  />
                )
              })}
            </div>
          </section>
        )}

        {/* All Attendees Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Users className="w-5 h-5 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              All Attendees
              <span className="ml-3 text-lg font-normal text-gray-400">
                ({attendees.length} total)
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attendees.map(attendee => {
              const status = networkingMap[attendee.profile.id]
              return (
                <AttendeeCard
                  key={attendee.id}
                  attendee={attendee}
                  status={status}
                  roleColor="yellow"
                />
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

// Attendee Card Component
function AttendeeCard({
  attendee,
  status,
  roleColor
}: {
  attendee: Attendee
  status?: string
  roleColor: "purple" | "blue" | "yellow"
}) {
  const colorClasses = {
    purple: "border-purple-500/30 bg-purple-500/5 text-purple-400",
    blue: "border-blue-500/30 bg-blue-500/5 text-blue-400",
    yellow: "border-yellow-500/30 bg-yellow-500/5 text-yellow-400"
  }

  return (
    <Link 
      href={`/profiles/${attendee.profile.id}`}
      className="group relative bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10"
    >
      {/* Role Badge */}
      <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${colorClasses[roleColor]}`}>
        {attendee.role}
      </div>

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 p-[2px]">
            <div className="h-full w-full rounded-full bg-gray-900 overflow-hidden">
              {attendee.profile.avatar_url ? (
                <img
                  src={attendee.profile.avatar_url}
                  alt={attendee.profile.full_name || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 text-yellow-400 text-xl font-bold">
                  {(attendee.profile.full_name || "?")[0].toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pt-1">
          <h3 className="font-semibold text-white group-hover:text-yellow-400 transition-colors truncate">
            {attendee.profile.full_name || "Unnamed User"}
          </h3>

          {(attendee.profile.title || attendee.profile.organization) && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
              {[attendee.profile.title, attendee.profile.organization]
                .filter(Boolean)
                .join(" at ")}
            </p>
          )}

          {/* Connection Status */}
          {status && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-xs font-medium text-green-400">{status}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
