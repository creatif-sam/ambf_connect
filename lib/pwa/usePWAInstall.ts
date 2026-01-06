"use client"

import { useEffect, useState } from "react"

declare global {
  interface Window {
    __AMBF_PWA_PROMPT__?: any
  }
}

// Detect if user is on iOS device
function isIOS(): boolean {
  if (typeof window === "undefined") return false
  
  const userAgent = window.navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(userAgent)
}

// Detect if iOS app is already installed (running in standalone mode)
function isIOSInstalled(): boolean {
  if (typeof window === "undefined") return false
  
  return (
    isIOS() &&
    (window.navigator as any).standalone === true
  )
}

export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false)
  const [isIOSDevice, setIsIOSDevice] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem("pwa_install_dismissed")
    if (dismissed) return

    // Check if iOS
    const isIosDevice = isIOS()
    setIsIOSDevice(isIosDevice)

    // If iOS and not installed, show iOS-specific prompt
    if (isIosDevice && !isIOSInstalled()) {
      setTimeout(() => {
        setCanInstall(true)
      }, 2000) // Show after 2 seconds
      return
    }

    // For Android/Chrome - use beforeinstallprompt
    const handler = (e: any) => {
      e.preventDefault()
      window.__AMBF_PWA_PROMPT__ = e

      setTimeout(() => {
        setCanInstall(true)
      }, 500)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  async function install() {
    // For iOS, we can't programmatically trigger install
    // The prompt component will show instructions
    if (isIOSDevice) return

    // For Android/Chrome
    const prompt = window.__AMBF_PWA_PROMPT__
    if (!prompt) return

    prompt.prompt()
    await prompt.userChoice

    window.__AMBF_PWA_PROMPT__ = null
    setCanInstall(false)
  }

  function dismiss() {
    localStorage.setItem("pwa_install_dismissed", "true")
    setCanInstall(false)
  }

  return {
    canInstall,
    install,
    dismiss,
    isIOSDevice
  }
}
