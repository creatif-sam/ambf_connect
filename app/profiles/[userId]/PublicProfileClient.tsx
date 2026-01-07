"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, CreditCard } from "lucide-react"
import ConferenceCard from "@/components/ConferenceCard"

type PublicProfileClientProps = {
  profile: {
    id: string
    full_name: string | null
    job_title: string | null
    company: string | null
    avatar_url: string | null
    bio: string | null
    created_at: string
  }
  totalConnections: number | null
}

export default function PublicProfileClient({ profile, totalConnections }: PublicProfileClientProps) {
  const [showCard, setShowCard] = useState(false)

  return (
    <>
      {showCard && (
        <ConferenceCard
          profile={profile}
          onClose={() => setShowCard(false)}
        />
      )}

      <main className="max-w-md mx-auto px-4 py-8 space-y-8">

        {/* Back navigation */}
        <div>
          <Link
            href="/networking"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black"
          >
            <ArrowLeft size={16} />
            Back to networking
          </Link>
        </div>

        {/* Profile header */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="h-28 w-28 rounded-full bg-gray-200 overflow-hidden">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-3xl font-semibold text-gray-500">
                {profile.full_name?.charAt(0) ?? "?"}
              </div>
            )}
          </div>

          <div>
            <p className="text-xl font-semibold">
              {profile.full_name || "Unnamed attendee"}
            </p>
            <p className="text-sm text-gray-500">
              {profile.job_title}
            </p>
            <p className="text-sm text-gray-500">
              {profile.company}
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="flex justify-around text-center border rounded-xl py-4 bg-white">
          <div>
            <p className="text-lg font-semibold">
              {totalConnections ?? 0}
            </p>
            <p className="text-xs text-gray-500">
              Connections
            </p>
          </div>

          <div>
            <p className="text-lg font-semibold">
              —
            </p>
            <p className="text-xs text-gray-500">
              Events
            </p>
          </div>

          <div>
            <p className="text-lg font-semibold">
              —
            </p>
            <p className="text-xs text-gray-500">
              Joined
            </p>
          </div>
        </section>

        {/* Conference Badge Button */}
        <button
          onClick={() => setShowCard(true)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7c1d1d] to-[#d4af37] text-white font-semibold shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
        >
          <CreditCard size={20} />
          View Conference Badge
        </button>

        {/* Bio */}
        {profile.bio && (
          <section className="border rounded-xl p-6 bg-white space-y-2">
            <p className="font-medium">
              Bio
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {profile.bio}
            </p>
          </section>
        )}

        {/* About */}
        <section className="border rounded-xl p-6 bg-white space-y-2">
          <p className="font-medium">
            About
          </p>

          <p className="text-sm text-gray-600">
            Joined on{" "}
            {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </section>

        {/* Actions */}
        <section className="space-y-3">
          <button
            className="w-full py-3 rounded-xl bg-black text-white font-medium"
          >
            Connect
          </button>

          <button
            className="w-full py-3 rounded-xl border font-medium"
          >
            Message
          </button>
        </section>

      </main>
    </>
  )
}
