"use client"

import { useEffect } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function StatusChecker() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    // Check status every 10 seconds
    const interval = setInterval(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return

        const { data: profile } = await supabase
          .from("profiles")
          .select("status")
          .eq("id", user.id)
          .single()

        if (profile?.status === "approved") {
          // Clear interval and redirect
          clearInterval(interval)
          router.push("/")
          router.refresh()
        }
      } catch (error) {
        console.error("Status check error:", error)
      }
    }, 10000) // Check every 10 seconds

    // Also subscribe to realtime changes
    const channel = supabase
      .channel("profile_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles"
        },
        async (payload: any) => {
          if (payload.new.status === "approved") {
            router.push("/")
            router.refresh()
          }
        }
      )
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [router, supabase])

  return null
}
