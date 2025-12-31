"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Calendar,
  Users,
  Megaphone,
  User,
  LayoutDashboard
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

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [isOrganizer, setIsOrganizer] = useState<boolean>(false)
  const [ready, setReady] = useState<boolean>(false)

  useEffect(() => {
    async function loadAuthAndRole() {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        setIsLoggedIn(false)
        setIsOrganizer(false)
        setReady(true)
        return
      }

      setIsLoggedIn(true)

      const { data: memberships } = await supabase
        .from("event_members")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "organizer")
        .limit(1)

      setIsOrganizer(!!memberships && memberships.length > 0)
      setReady(true)
    }

    loadAuthAndRole()
  }, [supabase])

  if (!ready) return null

  const navItems: NavItem[] = [
    { label: "Home", href: "/", icon: Home },
    { label: "Events", href: "/events", icon: Calendar },
    { label: "Networking", href: "/networking", icon: Users },
    { label: "Announcements", href: "/announcements", icon: Megaphone }
  ]

  if (isOrganizer) {
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
            <li key={item.label}>
              <Link
                href={item.href}
                className={`
                  flex flex-col items-center text-[11px]
                  transition-all
                  ${isActive ? "text-yellow-400" : "text-gray-400"}
                `}
              >
                <Icon className="h-5 w-5 mb-1" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
