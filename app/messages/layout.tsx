export default function MessagesLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-[calc(100vh-3.5rem)] md:h-screen flex overflow-hidden">
      {children}
    </div>
  )
}
