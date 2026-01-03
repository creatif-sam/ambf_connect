"use client"

import { useEffect } from "react"
import { registerServiceWorker } from "@/lib/push/registerServiceWorker"
import { registerPush } from "@/lib/push/registerPush"

export default function PushBootstrap() {
  useEffect(() => {
    registerServiceWorker()
    registerPush()
  }, [])

  return null
}
