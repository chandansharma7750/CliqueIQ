import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const YOUTUBE_SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
].join(" ")

export async function GET(req: NextRequest) {
  // Use request host as fallback so this works even if env var is missing at build time
  const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL ||
    `https://${req.headers.get("host")}`

  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
  const REDIRECT_URI = `${APP_URL}/api/auth/youtube/callback`

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(`${APP_URL}/login`)
    }

    if (!GOOGLE_CLIENT_ID) {
      console.error("GOOGLE_CLIENT_ID not configured")
      return NextResponse.redirect(`${APP_URL}/connect?error=google_not_configured`)
    }

    const state = Buffer.from(
      JSON.stringify({ userId: user.id, ts: Date.now() })
    ).toString("base64")

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(YOUTUBE_SCOPES)}` +
      `&access_type=offline` +
      `&prompt=consent` +
      `&state=${encodeURIComponent(state)}`

    return NextResponse.redirect(authUrl)
  } catch (err) {
    console.error("YouTube connect error:", err)
    return NextResponse.redirect(`${APP_URL}/connect?error=youtube_connect_failed`)
  }
}
