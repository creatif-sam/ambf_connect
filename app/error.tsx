"use client"

export default function Error({
  error,
  reset
}: {
  error: Error
  reset: () => void
}) {
  return (
    <main className="p-6 max-w-md mx-auto">
      <h2 className="text-lg font-semibold text-red-600 mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-gray-700 mb-4">
        {error.message}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-black text-yellow-500 rounded"
      >
        Try again
      </button>
    </main>
  )
}
