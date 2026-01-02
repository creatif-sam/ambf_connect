"use client"

import { useRef, useState, useTransition } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { updateAvatarUrl } from "./actions"

type AvatarUploadProps = {
  onSuccess?: () => void
}

export default function AvatarUpload({
  onSuccess
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setError(null)

      const supabase = createSupabaseBrowserClient()

      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Not authenticated")
      }

      const fileExt = file.name.split(".").pop()
      const filePath = `${user.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      const {
        data: { publicUrl }
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath)

      startTransition(() => {
        updateAvatarUrl(publicUrl)
          .then(() => {
            onSuccess?.()
          })
          .catch(err => {
            setError(err.message ?? "Profile update failed")
          })
      })
    } catch (err: any) {
      setError(err.message ?? "Upload failed")
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={pending}
        className="w-full px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
      >
        {pending ? "Uploading..." : "Change profile photo"}
      </button>

      {error && (
        <p className="text-xs text-red-600 text-center">
          {error}
        </p>
      )}
    </div>
  )
}
