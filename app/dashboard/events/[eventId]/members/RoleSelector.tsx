"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type RoleSelectorProps = {
  memberId: string
  currentRole: string
  eventId: string
}

const roles = [
  { value: "admin", label: "Admin", color: "text-red-600" },
  { value: "organizer", label: "Organizer", color: "text-purple-600" },
  { value: "speaker", label: "Speaker", color: "text-green-600" },
  { value: "media", label: "Media", color: "text-yellow-600" },
  { value: "attendee", label: "Attendee", color: "text-zinc-600" }
]

export default function RoleSelector({
  memberId,
  currentRole,
  eventId
}: RoleSelectorProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedRole, setSelectedRole] = useState(currentRole)
  const router = useRouter()

  const handleRoleChange = async (newRole: string) => {
    if (newRole === selectedRole) return

    setIsUpdating(true)

    try {
      console.log("Updating role from", selectedRole, "to", newRole, "for member", memberId)
      
      const response = await fetch("/api/members/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          memberId,
          newRole
        })
      })

      const data = await response.json()
      console.log("API Response:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to update role")
      }

      // Update local state
      setSelectedRole(newRole)
      
      // Refresh server data
      router.refresh()
      
      console.log("Role updated successfully")
    } catch (error) {
      console.error("Error updating role:", error)
      alert(error instanceof Error ? error.message : "Failed to update role")
      // Reset to original role on error
      setSelectedRole(currentRole)
    } finally {
      setIsUpdating(false)
    }
  }

  const currentRoleInfo = roles.find(r => r.value === selectedRole)

  return (
    <div className="relative">
      <select
        value={selectedRole}
        onChange={e => handleRoleChange(e.target.value)}
        disabled={isUpdating}
        className={`
          rounded-md border px-3 py-1.5 text-sm font-medium
          ${currentRoleInfo?.color ?? "text-zinc-600"}
          ${isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          hover:bg-zinc-50 transition-colors
          focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1
        `}
      >
        {roles.map(role => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>

      {isUpdating && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-black" />
        </div>
      )}
    </div>
  )
}
