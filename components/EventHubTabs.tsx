"use client"

import { useState } from "react"
import {
  Megaphone,
  Calendar,
  LayoutList,
  Phone
} from "lucide-react"
import EmergencyCallModal from "@/components/EmergencyCallModal"

type Props = {
  announcementsCount: number
}

export default function EventHubTabs({ announcementsCount }: Props) {
  const [emergencyOpen, setEmergencyOpen] = useState(false)

  const tabs = [
    {
      label: "Announcements",
      icon: Megaphone,
      active: true,
      badge: announcementsCount
    },
    {
      label: "Agenda",
      icon: Calendar,
      badge: 3
    },
    {
      label: "Sessions",
      icon: LayoutList,
      badge: 5
    },
    {
      label: "Emergency",
      icon: Phone,
      badge: 1,
      onClick: () => setEmergencyOpen(true)
    }
  ]

  return (
    <>
      {/* Sticky tab bar */}
      <div className="sticky top-0 z-40 bg-black -mx-4 px-4 border-b border-yellow-500/20">
        <div className="flex gap-2 overflow-x-auto py-3">
          {tabs.map(tab => {
            const Icon = tab.icon

            return (
              <button
                key={tab.label}
                onClick={tab.onClick}
                className={`
                  relative flex items-center gap-2
                  px-4 py-2 rounded-full text-sm font-medium
                  whitespace-nowrap transition
                  ${
                    tab.active
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black"
                      : "bg-zinc-900 text-gray-400 hover:text-yellow-400"
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {tab.label}

                {tab.badge > 0 && (
                  <span className="
                    absolute -top-1 -right-1
                    h-5 min-w-[20px] px-1
                    flex items-center justify-center
                    rounded-full text-[10px] font-bold
                    bg-yellow-500 text-black
                  ">
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Emergency modal */}
      <EmergencyCallModal
        open={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
      />
    </>
  )
}
