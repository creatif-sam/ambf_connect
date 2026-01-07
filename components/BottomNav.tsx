"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Calendar,
  Users,
  Megaphone,
  User,
  LayoutDashboard,
  MessageCircle
} from "lucide-react"
import { useEffect, useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

type NavItem = {
  label: string
  href: string
  icon: any
}

export default function BottomNav() {
  const pathname = usePathname()
  const supabase = createSupabaseBrowserClient()

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hasOrganizerAccess, setHasOrganizerAccess] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [ready, setReady] = useState(false)

  async function fetchUnread() {
    const res = await fetch("/api/messages/unread")
    const data = await res.json()
    setUnreadCount(data.count)
  }

  useEffect(() => {
    async function load() {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        setReady(true)
        return
      }

      setIsLoggedIn(true)
      fetchUnread()

      // Check if user has organizer or admin role (dashboard access)
      const { data: memberships } = await supabase
        .from("event_members")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["organizer", "admin"])
        .limit(1)

      setHasOrganizerAccess(!!memberships?.length)

      const channel = supabase
        .channel("bottom-nav-unread")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages"
          },
          fetchUnread
        )
        .subscribe()

      setReady(true)

      return () => {
        supabase.removeChannel(channel)
      }
    }

    load()
  }, [supabase])

  if (!ready) return null

  const navItems: NavItem[] = [
    { label: "Home", href: "/", icon: Home },
    { label: "Events", href: "/events", icon: Calendar },
    { label: "Networking", href: "/networking", icon: Users },
    {
      label: "Messages",
      href: "/messages",
      icon: MessageCircle
    },
    { label: "Announcements", href: "/announcements", icon: Megaphone }
  ]

  if (hasOrganizerAccess) {
    navItems.push({
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard
    })
  }

  navItems.push({
    label: "Profile",
    href: isLoggedIn ? "/profile" : "/auth/login",
    icon: User
  })

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-yellow-500/10 bg-black">
      <ul className="flex justify-around items-center h-16">
        {navItems.map(item => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + "/")

          const Icon = item.icon

          return (
            <li key={item.label} className="relative">
              <Link
                href={item.href}
                className={`flex flex-col items-center text-[11px] ${
                  isActive ? "text-yellow-400" : "text-gray-400"
                }`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5 mb-1" />

                  {item.label === "Messages" &&
                    unreadCount > 0 && (
                      <span
                        className="
                          absolute -top-1 -right-2
                          min-w-[16px] h-[16px]
                          rounded-full
                          bg-gradient-to-r from-yellow-400 to-black
                          text-white
                          text-[9px]
                          flex items-center justify-center
                          font-semibold
                        "
                      >
                        {unreadCount}
                      </span>
                    )}
                </div>

                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
