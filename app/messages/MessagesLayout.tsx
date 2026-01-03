"use client"

import { useState } from "react"
import MessagesList from "./MessagesList"
import ConversationPanel from "./ConversationPanel"

type Props = {
  meId: string
}

export default function MessagesLayout({ meId }: Props) {
  const [activeUserId, setActiveUserId] = useState<string | null>(null)

  return (
    <div className="hidden lg:flex h-[calc(100vh-64px)] bg-[#efeae2]">

      {/* LEFT INBOX */}
      <aside className="w-[380px] border-r bg-white">
        <MessagesList
          meId={meId}
          onSelect={setActiveUserId}
          activeUserId={activeUserId}
        />
      </aside>

      {/* RIGHT CONVERSATION */}
      <section className="flex-1">
        {activeUserId ? (
          <ConversationPanel
            meId={meId}
            otherUserId={activeUserId}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </section>
    </div>
  )
}
