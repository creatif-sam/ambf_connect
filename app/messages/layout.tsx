export default function MessagesLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen flex">

      {/* LEFT: Inbox */}
      <div className="w-full md:w-[380px] border-r bg-white">
        {children}
      </div>

      {/* RIGHT: Conversation slot */}
      <div className="hidden md:flex flex-1 bg-[#efeae2]">
        {/* This will be replaced by /messages/[userId] */}
      </div>

    </div>
  )
}
