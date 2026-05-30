import { NextRequest, NextResponse } from "next/server"

// Instagram permissions
const INSTAGRAM_SCOPES = [
  "instagram_basic",
  "instagram_content_publish",
  "instagram_manage_insights",
  "pages_show_list",
  "pages_read_engagement",
].join(",")

// Facebook permissions
const FACEBOOK_SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "pages_manage_metadata",
  "read_insights",
].join(",")

export async function GET(req: NextRequest) {
  // Resolve APP_URL dynamically so it works on Vercel and locally
  const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get("host")}`

  const META_APP_ID = process.env.META_APP_ID
  if (!META_APP_ID) {
    return NextResponse.redirect(`${APP_URL}/connect?error=meta_not_configured`)
  }

  const REDIRECT_URI = `${APP_URL}/api/auth/meta/callback`
  const platform = req.nextUrl.searchParams.get("platform") ?? "instagram"
  const scopes = platform === "facebook" ? FACEBOOK_SCOPES : INSTAGRAM_SCOPES

  const state = Buffer.from(JSON.stringify({ platform, ts: Date.now() })).toString("base64")

  const authUrl =
    `https://www.facebook.com/v19.0/dialog/oauth?` +
    `client_id=${META_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&state=${encodeURIComponent(state)}` +
    `&response_type=code`

  return NextResponse.redirect(authUrl)
}
