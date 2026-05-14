import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "CliqueIQ — India's Social Media Management Platform",
  description: "Schedule posts, analyze performance, generate Hindi AI captions, and grow your social media presence. India-first SMM tool with GST billing.",
  keywords: "social media management India, Instagram scheduler India, Hindi captions AI, WhatsApp analytics",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  )
}
