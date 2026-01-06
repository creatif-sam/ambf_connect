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
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export default function EventHubTabs({ 
  announcementsCount, 
  activeTab = "announcements",
  onTabChange 
}: Props) {
  const [emergencyOpen, setEmergencyOpen] = useState(false)

  const tabs = [
    {
      id: "announcements",
      label: "Announcements",
      icon: Megaphone,
      badge: announcementsCount
    },
    {
      id: "agenda",
      label: "Agenda",
      icon: Calendar
    }
  ]

  return (
    <>
      {/* Sticky tab bar */}
      <div className="sticky top-0 z-40 bg-black -mx-4 px-4 border-b border-yellow-500/20">
        <div className="flex gap-2 overflow-x-auto py-3">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={`
                  relative flex items-center gap-2
                  px-4 py-2 rounded-full text-sm font-medium
                  whitespace-nowrap transition
                  ${
                    isActive
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black"
                      : "bg-zinc-900 text-gray-400 hover:text-yellow-400"
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {tab.label}

                {tab.badge && tab.badge > 0 && (
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
          
          {/* Emergency button separate */}
          <button
            onClick={() => setEmergencyOpen(true)}
            className="
              relative flex items-center gap-2
              px-4 py-2 rounded-full text-sm font-medium
              whitespace-nowrap transition
              bg-red-600 text-white hover:bg-red-700
            "
          >
            <Phone className="h-4 w-4" />
            Emergency
          </button>
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
