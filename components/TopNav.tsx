"use client"

import Image from "next/image"
import { HelpCircle, Download } from "lucide-react"
import { usePWAInstall } from "@/lib/pwa/usePWAInstall"

export default function TopNav() {
  const { install } = usePWAInstall()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black text-white">
      <div className="max-w-6xl mx-auto h-14 px-4 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/icons/logo-ambf.png"
            alt="AMBF Connect"
            width={140}
            height={36}
            priority
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            aria-label="Help"
            className="hover:text-[#d4af37] transition"
          >
            <HelpCircle size={20} />
          </button>

          <button
            onClick={install}
            aria-label="Install App"
            className="hover:text-[#d4af37] transition"
          >
            <Download size={20} />
          </button>
        </div>

      </div>
    </header>
  )
}
