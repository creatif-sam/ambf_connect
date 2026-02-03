"use client"

import { useRef, useState } from "react"
import { Download, X } from "lucide-react"

type ConferenceCardProps = {
  profile: {
    full_name: string | null
    job_title: string | null
    company: string | null
    avatar_url: string | null
  }
  role?: string | null
  onClose: () => void
}

export default function ConferenceCard({ profile, role, onClose }: ConferenceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  async function handleDownload() {
    if (!cardRef.current || isDownloading) return

    setIsDownloading(true)

    try {
      // Dynamically import html2canvas
      const html2canvas = (await import("html2canvas")).default
      
      // Generate canvas
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      } as any)

      // Create download link
      const dataUrl = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `${profile.full_name?.replace(/\s+/g, "_") || "badge"}_ambf_2026.png`
      link.href = dataUrl
      link.click()
      
    } catch (error) {
      console.error("Download error:", error)
      alert("Failed to download badge. Please try taking a screenshot instead.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="relative max-w-sm w-full my-8" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 flex items-center gap-2"
          aria-label="Close"
        >
          <span className="text-sm">Close</span>
          <X size={24} />
        </button>

        {/* Conference Card */}
        <div
          ref={cardRef}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header with gradient */}
          <div className="relative h-32 bg-gradient-to-br from-[#7c1d1d] via-[#a02828] to-[#d4af37]">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
            
            {/* Logo/Conference name */}
            <div className="relative h-full flex flex-col items-center justify-center text-white">
              <h1 className="text-2xl font-bold tracking-wide">AMBF CONNECT</h1>
              <p className="text-xs mt-1 tracking-widest opacity-90">2026 CONFERENCE</p>
            </div>
          </div>

          {/* Profile section */}
          <div className="relative px-6 pb-8">
            {/* Avatar - overlapping header */}
            <div className="flex justify-center -mt-16 mb-4">
              <div className="h-32 w-32 rounded-full bg-white p-2 shadow-xl">
                <div className="h-full w-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || "Attendee"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-gray-400">
                      {profile.full_name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Name and details */}
            <div className="text-center space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  {profile.full_name || "Attendee"}
                </h2>
                <p className="text-sm font-medium text-[#7c1d1d] mt-1">
                  {profile.job_title || "Participant"}
                </p>
              </div>

              {profile.company && (
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#7c1d1d]/10 to-[#d4af37]/10 rounded-full">
                  <p className="text-sm font-medium text-gray-700">
                    {profile.company}
                  </p>
                </div>
              )}
            </div>

            {/* Decorative line */}
            <div className="my-6 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>

            {/* Conference info */}
            <div className="space-y-2 text-center">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-50 rounded-lg py-2 px-3">
                  <p className="text-gray-500 font-medium">EVENT</p>
                  <p className="text-gray-900 font-semibold mt-0.5">AMBF 2026</p>
                </div>
                <div className="bg-gray-50 rounded-lg py-2 px-3">
                  <p className="text-gray-500 font-medium">ROLE</p>
                  <p className="text-gray-900 font-semibold mt-0.5 capitalize">
                    {role || "Attendee"}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer tagline */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 italic">
                Connecting Africa & Mediterranean Businesses
              </p>
            </div>

            <div className="mt-6 flex flex-col items-center">
              <img src="/images/partner-all.png" alt="Partners logos" />
            </div>

            {/* QR Code placeholder (optional for future) */}
            <div className="mt-4 flex justify-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                <div className="text-[8px] text-gray-400 text-center leading-tight">
                  QR<br/>CODE
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="mt-4 w-full py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
              Generating...
            </>
          ) : (
            <>
              <Download size={20} />
              Download Badge
            </>
          )}
        </button>
      </div>
    </div>
  )
}
