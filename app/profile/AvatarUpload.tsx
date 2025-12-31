"use client"

import { useState, useTransition } from "react"
import { uploadAvatarAction } from "./actions"


export default function AvatarUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [pending, startTransition] = useTransition()

  function handleUpload() {
    if (!file) return

    const formData = new FormData()
    formData.append("avatar", file)

    startTransition(async () => {
      await uploadAvatarAction(formData)
    })
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        onChange={e => setFile(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || pending}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        {pending ? "Uploading..." : "Upload photo"}
      </button>
    </div>
  )
}
