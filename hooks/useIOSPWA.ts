/**
 * iOS PWA Install Detection Component
 * 
 * This component helps identify when users on iOS Safari haven't installed the app yet.
 * It provides helpful analytics and can trigger custom behaviors.
 */

"use client"

import { useEffect, useState } from "react"

interface IOSInfo {
  isIOS: boolean
  isInstalled: boolean
  isSafari: boolean
  device: "iphone" | "ipad" | "ipod" | "unknown"
}

export function useIOSPWA(): IOSInfo {
  const [info, setInfo] = useState<IOSInfo>({
    isIOS: false,
    isInstalled: false,
    isSafari: false,
    device: "unknown"
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isInstalled = isIOS && (window.navigator as any).standalone === true
    const isSafari = isIOS && /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent)

    let device: "iphone" | "ipad" | "ipod" | "unknown" = "unknown"
    if (/iphone/.test(userAgent)) device = "iphone"
    else if (/ipad/.test(userAgent)) device = "ipad"
    else if (/ipod/.test(userAgent)) device = "ipod"

    setInfo({ isIOS, isInstalled, isSafari, device })

    // Log to console for debugging
    if (isIOS) {
      console.log("📱 iOS Device Detected:", {
        device,
        installed: isInstalled,
        safari: isSafari,
        userAgent
      })
    }
  }, [])

  return info
}

/**
 * Component that tracks iOS PWA usage
 */
export default function IOSPWATracker() {
  const { isIOS, isInstalled, isSafari, device } = useIOSPWA()

  useEffect(() => {
    if (!isIOS) return

    // Track PWA install status
    if (isInstalled) {
      console.log("✅ App is installed on iOS home screen")
      // You can send analytics here
      // e.g., analytics.track("pwa_installed", { device })
    } else if (isSafari) {
      console.log("ℹ️  App is running in Safari (not installed)")
      // You can send analytics here
      // e.g., analytics.track("pwa_web_view", { device })
    }
  }, [isIOS, isInstalled, isSafari, device])

  // This component doesn't render anything
  return null
}
