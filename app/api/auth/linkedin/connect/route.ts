import { NextRequest, NextResponse } from "next/server"

const LINKEDIN_SCOPES = ["openid", "profile", "email", "w_member_social"].join(" ")

export async function GET(req: NextRequest) {
  const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get("host")}`

  const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID
  if (!LINKEDIN_CLIENT_ID) {
    return NextResponse.redirect(`${APP_URL}/connect?error=linkedin_not_configured`)
  }

  const REDIRECT_URI = `${APP_URL}/api/auth/linkedin/callback`
  const state = Buffer.from(JSON.stringify({ ts: Date.now() })).toString("base64")

  const authUrl =
    `https://www.linkedin.com/oauth/v2/authorization?` +
    `response_type=code` +
    `&client_id=${LINKEDIN_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=${encodeURIComponent(LINKEDIN_SCOPES)}` +
    `&state=${encodeURIComponent(state)}`

  return NextResponse.redirect(authUrl)
}
