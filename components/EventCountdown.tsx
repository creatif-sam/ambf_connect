"use client"

import { useEffect, useState } from "react"
import { Clock, Calendar, CheckCircle2 } from "lucide-react"

type EventCountdownProps = {
  startDate: string
  endDate: string
}

export default function EventCountdown({ startDate, endDate }: EventCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [status, setStatus] = useState<"upcoming" | "ongoing" | "ended">("upcoming")

  useEffect(() => {
    function calculateCountdown() {
      const now = new Date().getTime()
      const start = new Date(startDate).getTime()
      const end = new Date(endDate).getTime()

      // Check if event has ended
      if (now > end) {
        setStatus("ended")
        setTimeLeft("")
        return
      }

      // Check if event is ongoing
      if (now >= start && now <= end) {
        setStatus("ongoing")
        setTimeLeft("")
        return
      }

      // Calculate time until event starts
      const distance = start - now

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setStatus("upcoming")
      
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`)
      } else {
        setTimeLeft(`${seconds}s`)
      }
    }

    calculateCountdown()
    const interval = setInterval(calculateCountdown, 1000)

    return () => clearInterval(interval)
  }, [startDate, endDate])

  if (status === "ended") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-600/20 border border-gray-600/30">
        <CheckCircle2 size={16} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-400">Event Ended</span>
      </div>
    )
  }

  if (status === "ongoing") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600/20 border border-green-600/30 animate-pulse">
        <Calendar size={16} className="text-green-400" />
        <span className="text-sm font-semibold text-green-400">Ongoing Now</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-600/20 border border-yellow-600/30">
      <Clock size={16} className="text-yellow-400" />
      <div className="flex flex-col">
        <span className="text-[10px] text-yellow-300/70 uppercase tracking-wide">Starts in</span>
        <span className="text-sm font-bold text-yellow-400 tabular-nums">{timeLeft}</span>
      </div>
    </div>
  )
}
