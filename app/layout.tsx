import "./globals.css"
import TopNav from "@/components/TopNav"
import NavGuard from "@/components/NavGuard"

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <TopNav />

        <main className="pt-14 pb-16">
          {children}
        </main>

        <NavGuard />
      </body>
    </html>
  )
}
