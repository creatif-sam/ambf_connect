import type { Metadata } from "next"
import "./globals.css"
import ClientProviders from "./providers"

export const metadata: Metadata = {
  title: "AMBF Connect",
  description: "Event platform for conferences and networking"
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
