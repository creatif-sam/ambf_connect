export default function MessageBubble({
  message,
  isMe
}: {
  message: any
  isMe: boolean
}) {
  return (
    <div
      className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
        isMe
          ? "ml-auto bg-green-600 text-white"
          : "mr-auto bg-white text-gray-900 border"
      }`}
    >
      {message.content}
    </div>
  )
}
