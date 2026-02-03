"use client"

import { useState } from "react"
import EventHubTabs from "@/components/EventHubTabs"

type Announcement = {
  id: string
  title: string
  body: string
  created_at: string
  event_id: string
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

type Session = {
  id: string
  title: string
  start_time: string
  end_time: string
  day: string
  session_type: string
  event_id: string
}

type Props = {
  announcements: Announcement[]
  sessions: Session[]
}

export default function EventHubClient({ announcements, sessions }: Props) {
  const [activeTab, setActiveTab] = useState("announcements")

  return (
    <main className="max-w-3xl mx-auto px-4 pb-24">
      <h1 className="text-2xl font-semibold text-white pt-4 pb-3">
        Event Hub
      </h1>

      {/* Sticky tabs */}
      <EventHubTabs
        announcementsCount={announcements.length}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Content based on active tab */}
      <div className="pt-6">
        {activeTab === "announcements" && (
          <AnnouncementsView announcements={announcements} />
        )}
        
        {activeTab === "agenda" && (
          <AgendaView sessions={sessions} />
        )}
      </div>
    </main>
  )
}

function AnnouncementsView({ announcements }: { announcements: Announcement[] }) {
  if (announcements.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-2">No announcements yet</p>
        <p className="text-sm text-gray-600">
          Check back later for updates from event organizers
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {announcements.map(a => (
        <div
          key={a.id}
          className="
            rounded-xl p-5
            bg-gradient-to-br from-black to-zinc-900
            border border-yellow-500/20
            hover:border-yellow-500/40
            transition
          "
        >
          <h2 className="font-medium text-lg text-white mb-3">
            {a.title}
          </h2>

          <p className="text-gray-300 leading-relaxed">
            {a.body}
          </p>
        </div>
      ))}
    </div>
  )
}

function AgendaView({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-2">No agenda published yet</p>
        <p className="text-sm text-gray-600">
          The event schedule will appear here once published
        </p>
      </div>
    )
  }

  // Group sessions by day
  const day1Sessions = sessions.filter(s => s.day === "day1")
  const day2Sessions = sessions.filter(s => s.day === "day2")

  return (
    <div className="space-y-8">
      {day1Sessions.length > 0 && (
        <AgendaDay title="Day 1" sessions={day1Sessions} />
      )}
      {day2Sessions.length > 0 && (
        <AgendaDay title="Day 2" sessions={day2Sessions} />
      )}
    </div>
  )
}

function AgendaDay({ title, sessions }: { title: string; sessions: Session[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900 border-b border-yellow-500/20 pb-2">
        {title}
      </h2>

      {sessions.map(session => (
        <div
          key={session.id}
          className="
            rounded-xl p-4
            bg-gradient-to-br from-black to-zinc-900
            border border-yellow-500/20
            hover:border-yellow-500/40
            transition
          "
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <p className="text-xs text-yellow-500 uppercase tracking-wide mb-1">
                {session.session_type}
              </p>
              <p className="font-medium text-white">
                {session.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {session.start_time} – {session.end_time}
            </span>
          </div>
        </div>
      ))}
    </section>
  )
}
