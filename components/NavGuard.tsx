"use client"

import { usePathname } from "next/navigation"
import BottomNav from "@/components/BottomNav"

export default function NavGuard() {
  const pathname = usePathname()

  // Hide bottom nav on auth pages
  if (pathname.startsWith("/auth")) {
    return null
  }

  return <BottomNav />
}
