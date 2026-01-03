"use client"

import { useEffect, useState } from "react"

declare global {
  interface Window {
    __AMBF_PWA_PROMPT__?: any
  }
}

export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem("pwa_install_dismissed")
    if (dismissed) return

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
    dismiss
  }
}
