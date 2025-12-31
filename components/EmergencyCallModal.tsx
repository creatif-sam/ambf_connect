"use client"

import { Phone, X, ShieldAlert } from "lucide-react"
import { useEffect } from "react"

type EmergencyContact = {
  label: string
  number: string
}

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { label: "Medical Emergency", number: "+212 522-989898" },
  { label: "Police ", number: "112" },
  { label: "Event Coordinator", number: "+212 632-819399" }
]

export default function EmergencyCallModal({
  open,
  onClose
}: {
  open: boolean
  onClose: () => void
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="
        absolute bottom-0 left-0 right-0
        rounded-t-3xl
        bg-black
        border-t border-yellow-500/30
        px-6 pt-6 pb-10
        animate-slide-up
      ">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="
              h-10 w-10 rounded-full
              flex items-center justify-center
              bg-gradient-to-br from-yellow-400 to-yellow-600
              text-black
            ">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              Emergency Assistance
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-400 mb-6">
          Tap a contact below to call immediately.  
          This will use your phone dialer.
        </p>

        {/* Emergency Numbers */}
        <div className="space-y-3">
          {EMERGENCY_CONTACTS.map(contact => (
            <a
              key={contact.number}
              href={`tel:${contact.number}`}
              className="
                flex items-center justify-between
                rounded-xl
                px-4 py-4
                bg-gradient-to-br from-zinc-900 to-black
                border border-yellow-500/20
                hover:border-yellow-500/50
                transition
              "
            >
              <div>
                <p className="text-white font-medium">
                  {contact.label}
                </p>
                <p className="text-xs text-gray-400">
                  {contact.number}
                </p>
              </div>

              <div className="
                h-10 w-10 rounded-full
                flex items-center justify-center
                bg-gradient-to-br from-yellow-400 to-yellow-600
                text-black
              ">
                <Phone className="h-5 w-5" />
              </div>
            </a>
          ))}
        </div>

        {/* Footer */}
        <p className="mt-6 text-xs text-gray-500 text-center">
          Use only in case of real emergency
        </p>
      </div>
    </div>
  )
}
