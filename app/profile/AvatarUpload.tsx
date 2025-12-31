"use client"

import { useTransition } from "react"
import { uploadAvatar } from "./actions"

export default function AvatarUpload() {
  const [pending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(() => {
      uploadAvatar(formData)
    })
  }

  return (
    <form action={handleSubmit} className="space-y-2">
      <input
        type="file"
        name="avatar"
        accept="image/*"
        required
      />

      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 border rounded"
      >
        {pending ? "Uploading..." : "Upload photo"}
      </button>
    </form>
  )
}
