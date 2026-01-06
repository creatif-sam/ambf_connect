"use client"

import { usePWAInstall } from "@/lib/pwa/usePWAInstall"
import { Share, Download, Plus } from "lucide-react"

export default function PWAInstallPrompt() {
  const { canInstall, install, dismiss, isIOSDevice } = usePWAInstall()

  if (!canInstall) return null

  return (
    <div className="fixed bottom-0 right-4 z-50 max-w-sm w-full rounded-2xl shadow-xl bg-[#d4af37] border border-[#b8962e] p-5 transform -translate-y-52 md:-translate-y-44">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg text-black">
            Install AMBF Connect
          </h3>
          <p className="text-sm text-black/80 mt-1">
            {isIOSDevice 
              ? "Install the app for faster access and offline capabilities."
              : "Install the app for faster access and a better experience."
            }
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

      {isIOSDevice ? (
        // iOS Instructions
        <div className="mt-4 space-y-3">
          <div className="bg-black/10 rounded-lg p-3 text-sm text-black">
            <p className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-lg">📱</span>
              How to install on iPhone/iPad:
            </p>
            <ol className="space-y-2 ml-6 list-decimal">
              <li className="flex items-start gap-2">
                <span className="shrink-0">Tap the</span>
                <Share className="w-4 h-4 mt-0.5 shrink-0" />
                <span>(Share) button at the bottom of Safari</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0">Scroll and tap</span>
                <Plus className="w-4 h-4 mt-0.5 shrink-0" />
                <span>"Add to Home Screen"</span>
              </li>
              <li>Tap "Add" in the top-right corner</li>
            </ol>
          </div>

          <button
            onClick={dismiss}
            className="w-full bg-black text-white rounded-lg py-2 hover:bg-black/90 transition font-semibold"
          >
            Got it
          </button>
        </div>
      ) : (
        // Android/Chrome Install
        <div className="flex gap-3 mt-4">
          <button
            onClick={install}
            className="flex-1 bg-[#f5e08b] text-black rounded-lg py-2 font-semibold hover:bg-[#ecd66d] transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Install
          </button>

          <button
            onClick={dismiss}
            className="flex-1 bg-black text-white rounded-lg py-2 hover:bg-black/90 transition"
          >
            Later
          </button>
        </div>
      )}
    </div>
  )
}
