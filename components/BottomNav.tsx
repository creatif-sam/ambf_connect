"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Calendar,
  Users,
  Megaphone,
  User
} from "lucide-react"

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: Home
  },
  {
    label: "Events",
    href: "/events",
    icon: Calendar
  },
  {
    label: "Networking",
    href: "/networking",
    icon: Users
  },
  {
    label: "Announcements",
    href: "/announcements",
    icon: Megaphone
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User
  }
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-black">
      <ul className="flex justify-around items-center h-16">
        {navItems.map(item => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + "/")

          const Icon = item.icon

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center text-[11px] ${
                  isActive
                    ? "text-yellow-400"
                    : "text-gray-400"
                }`}
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
