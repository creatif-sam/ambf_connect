"use client"

type Props = {
  open: boolean
  title?: string
  description?: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDeleteModal({
  open,
  title = "Delete announcement",
  description = "This action cannot be undone. The announcement will be permanently removed.",
  confirmLabel = "Delete",
  onConfirm,
  onCancel
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold">
          {title}
        </h2>

        <p className="mt-2 text-sm text-zinc-600">
          {description}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md border px-4 py-2 text-sm"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-sm text-white"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
