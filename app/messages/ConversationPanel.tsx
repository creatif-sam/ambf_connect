"use client"

import ConversationClient from "./[userId]/ConversationClient"

type Props = {
  meId: string
  otherUserId: string
}

export default function ConversationPanel({
  meId,
  otherUserId
}: Props) {
  return (
    <ConversationClient
      meId={meId}
      otherUser={{ id: otherUserId, full_name: "", avatar_url: null }}
      initialMessages={[]}
    />
  )
}
