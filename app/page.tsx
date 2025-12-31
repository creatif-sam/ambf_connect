import Link from "next/link"
import {
  ArrowRight,
  Calendar,
  Users,
  Megaphone
} from "lucide-react"

export default function Home() {
  return (
    <main className="
      min-h-[100svh]
      bg-gradient-to-br from-black via-zinc-900 to-black
      text-white
      overflow-hidden
    ">
      {/* Hero Section */}
      <section className="
        relative
        max-w-6xl mx-auto
        px-6
        pt-24
        pb-20
        text-center
      ">
        {/* Glow */}
        <div className="
          absolute inset-0
          -z-10
          bg-[radial-gradient(circle_at_top,rgba(234,179,8,0.15),transparent_60%)]
        " />

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          AMBF Connect
        </h1>

        <p className="mt-3 text-yellow-400 font-medium">
          Beyond the game, build the economy
        </p>

        <p className="mt-6 max-w-2xl mx-auto text-gray-300 leading-relaxed">
          AMBF Connect is a professional platform designed to power conferences,
          forums, and strategic networking. Discover events, connect with
          participants, and access exclusive announcements in one place.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/events"
            className="
              inline-flex items-center gap-2
              rounded-lg
              bg-gradient-to-r from-yellow-400 to-yellow-600
              px-6 py-3
              font-medium
              text-black
              hover:opacity-90
              transition
            "
          >
            Explore events
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/auth/login"
            className="
              inline-flex items-center gap-2
              rounded-lg
              border border-yellow-500/40
              px-6 py-3
              font-medium
              text-yellow-400
              hover:bg-yellow-500/10
              transition
            "
          >
            Access my account
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Events */}
          <div className="
            rounded-2xl
            border border-yellow-500/20
            bg-gradient-to-br from-zinc-900 to-black
            p-6
            hover:border-yellow-500/40
            transition
          ">
            <div className="
              h-12 w-12 rounded-lg
              flex items-center justify-center
              bg-yellow-500/10
              text-yellow-400
              mb-4
            ">
              <Calendar className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-semibold">
              Events & Forums
            </h3>

            <p className="mt-2 text-sm text-gray-400 leading-relaxed">
              Access conferences, forums, and curated professional meetups
              with structured schedules and participants.
            </p>
          </div>

          {/* Networking */}
          <div className="
            rounded-2xl
            border border-yellow-500/20
            bg-gradient-to-br from-zinc-900 to-black
            p-6
            hover:border-yellow-500/40
            transition
          ">
            <div className="
              h-12 w-12 rounded-lg
              flex items-center justify-center
              bg-yellow-500/10
              text-yellow-400
              mb-4
            ">
              <Users className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-semibold">
              Professional Networking
            </h3>

            <p className="mt-2 text-sm text-gray-400 leading-relaxed">
              Build meaningful connections with attendees, speakers,
              and organizers across all AMBF events.
            </p>
          </div>

          {/* Announcements */}
          <div className="
            rounded-2xl
            border border-yellow-500/20
            bg-gradient-to-br from-zinc-900 to-black
            p-6
            hover:border-yellow-500/40
            transition
          ">
            <div className="
              h-12 w-12 rounded-lg
              flex items-center justify-center
              bg-yellow-500/10
              text-yellow-400
              mb-4
            ">
              <Megaphone className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-semibold">
              Official Announcements
            </h3>

            <p className="mt-2 text-sm text-gray-400 leading-relaxed">
              Stay informed with real time announcements directly
              from event organizers and administrators.
            </p>
          </div>
        </div>
      </section>

      {/* Footer strip */}
      <footer className="
        border-t border-yellow-500/10
        py-6
        text-center
        text-xs
        text-gray-500
      ">
        © {new Date().getFullYear()} AMBF Connect. All rights reserved.
      </footer>
    </main>
  )
}
