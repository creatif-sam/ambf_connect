"use client"

import { usePWAInstall } from "@/lib/pwa/usePWAInstall"

export default function PWAInstallPrompt() {
  const { canInstall, install, dismiss } = usePWAInstall()

  if (!canInstall) return null

  return (
    <div className="fixed bottom-0 right-4 z-50 max-w-sm w-full rounded-2xl shadow-xl bg-[#d4af37] border border-[#b8962e] p-5 transform -translate-y-52 md:-translate-y-44">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg text-black">
            Install AMBF Connect
          </h3>
          <p className="text-sm text-black/80 mt-1">
            Install the app for faster access and a better experience.
          </p>
        </div>

        <button
          onClick={dismiss}
          className="text-black/60 hover:text-black text-lg leading-none"
          aria-label="Dismiss install prompt"
        >
          ×
        </button>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={install}
          className="flex-1 bg-[#f5e08b] text-black rounded-lg py-2 font-semibold hover:bg-[#ecd66d] transition"
        >
          Install
        </button>

        <button
          onClick={dismiss}
          className="flex-1 bg-black text-white rounded-lg py-2 hover:bg-black/90 transition"
        >
          Later
        </button>
      </div>
    </div>
  )
}
