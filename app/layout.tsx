import "./globals.css"
import TopNav from "@/components/TopNav"
import BottomNav from "@/components/BottomNav"
import PushBootstrap from "@/components/PushBootstrap"
import PWAInstallPrompt from "@/components/PWAInstallPrompt"

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c1d1d" />
      </head>
      <body suppressHydrationWarning>
        <PushBootstrap />

        <TopNav />
        <main className="pt-14 pb-16">{children}</main>
        <BottomNav />

        <PWAInstallPrompt />
      </body>
    </html>
  )
}
