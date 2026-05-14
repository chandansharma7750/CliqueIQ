import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback`
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(`${APP_URL}/connect?error=youtube_denied`)
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    })

    const tokens = await tokenRes.json()
    if (!tokens.access_token) {
      return NextResponse.redirect(`${APP_URL}/connect?error=youtube_token_failed`)
    }

    // Fetch YouTube channel info
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true`,
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    )
    const channelData = await channelRes.json()
    const channel = channelData.items?.[0]

    if (!channel) {
      return NextResponse.redirect(`${APP_URL}/connect?error=no_youtube_channel`)
    }

    // Save to social_accounts
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(`${APP_URL}/login`)

    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .single()

    if (workspace) {
      await supabase.from("social_accounts").upsert({
        workspace_id: workspace.id,
        platform: "youtube",
        account_id: channel.id,
        account_name: channel.snippet.title,
        account_handle: channel.snippet.customUrl || channel.id,
        avatar_url: channel.snippet.thumbnails?.default?.url,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
        is_active: true,
        metadata: {
          subscriber_count: channel.statistics?.subscriberCount,
          video_count: channel.statistics?.videoCount,
          view_count: channel.statistics?.viewCount,
        },
      }, { onConflict: "workspace_id,platform" })
    }

    return NextResponse.redirect(`${APP_URL}/connect?success=youtube`)
  } catch (err) {
    console.error("YouTube callback error:", err)
    return NextResponse.redirect(`${APP_URL}/connect?error=youtube_failed`)
  }
}
