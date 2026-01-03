"use client"

import { useEffect } from "react"
import { registerPush } from "@/lib/push/registerPush"

export default function PushProvider() {
  useEffect(() => {
    registerPush()
  }, [])

  return null
}
