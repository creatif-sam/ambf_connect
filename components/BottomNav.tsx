"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Home,
  Calendar,
  Users,
  Megaphone,
  User
} from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export default function BottomNav() {
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user)
    })
  }, [])

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Events", href: "/events", icon: Calendar },
    { label: "Networking", href: "/networking", icon: Users },
    { label: "Announcements", href: "/announcements", icon: Megaphone },
    {
      label: isAuthenticated ? "Profile" : "Login",
      href: isAuthenticated ? "/profile" : "/auth/login",
      icon: User
    }
  ]

  const activeIndex = navItems.findIndex(
    item =>
      pathname === item.href ||
      pathname.startsWith(item.href + "/")
  )

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-zinc-800">
      <div className="relative h-16">
        {/* Animated indicator */}
        <span
          className="absolute top-0 h-1 bg-yellow-400 transition-all duration-300 ease-out"
          style={{
            width: `${100 / navItems.length}%`,
            transform: `translateX(${activeIndex * 100}%)`
          }}
        />

        <ul className="flex justify-around items-center h-full">
          {navItems.map((item, index) => {
            const isActive = index === activeIndex
            const Icon = item.icon

            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center text-[11px] transition-colors ${
                    isActive
                      ? "text-yellow-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 mb-1 transition-transform duration-300 ${
                      isActive ? "scale-110" : "scale-100"
                    }`}
                  />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
