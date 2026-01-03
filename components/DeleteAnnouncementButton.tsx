"use client"

import { useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal"

type Props = {
  announcementId: string
  eventId: string
}

export default function DeleteAnnouncementButton({
  announcementId,
  eventId
}: Props) {
  const supabase = createSupabaseBrowserClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)

    await supabase
      .from("announcements")
      .delete()
      .eq("id", announcementId)

    setLoading(false)
    setOpen(false)

    window.location.href = `/dashboard/events/${eventId}/announcements`
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border px-3 py-1 text-sm text-red-600"
      >
        Delete
      </button>

      <ConfirmDeleteModal
        open={open}
        onCancel={() => setOpen(false)}
        onConfirm={handleDelete}
        confirmLabel={loading ? "Deleting…" : "Delete"}
      />
    </>
  )
}
