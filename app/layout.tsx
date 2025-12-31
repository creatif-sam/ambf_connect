import "./globals.css"
import TopNav from "@/components/TopNav"
import BottomNav from "@/components/BottomNav"

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <TopNav />

        <main className="pt-14 pb-16">
          {children}
        </main>

        <BottomNav />
      </body>
    </html>
  )
}
