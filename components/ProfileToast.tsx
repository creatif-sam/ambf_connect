"use client"

import { useEffect } from "react"
import { CheckCircle } from "lucide-react"

export default function ProfileToast({
  message,
  onClose
}: {
  message: string
  onClose: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 rounded-xl bg-black text-white px-4 py-3 shadow-lg text-sm">
        <CheckCircle size={18} />
        {message}
      </div>
    </div>
  )
}
