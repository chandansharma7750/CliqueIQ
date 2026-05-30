import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get("host")}`

  const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID!
  const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET!
  const REDIRECT_URI = `${APP_URL}/api/auth/linkedin/callback`

  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(`${APP_URL}/connect?error=linkedin_auth_failed`)
  }

  // Exchange code for access token
  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET,
    }),
  })

  const tokenData = await tokenRes.json()

  if (!tokenData.access_token) {
    return NextResponse.redirect(`${APP_URL}/connect?error=linkedin_token_failed`)
  }

  // Get profile via OpenID userinfo endpoint
  const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })
  const profileData = await profileRes.json()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(`${APP_URL}/login`)
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (workspace) {
    const accountId = profileData.sub ?? profileData.id ?? "unknown"
    const displayName = profileData.name ?? `${profileData.given_name ?? ""} ${profileData.family_name ?? ""}`.trim()

    await supabase.from("social_accounts").upsert({
      workspace_id: workspace.id,
      platform: "linkedin",
      account_id: accountId,
      account_name: displayName || "LinkedIn Account",
      account_handle: profileData.email ?? null,
      avatar_url: profileData.picture ?? null,
      access_token: tokenData.access_token,
      token_expires_at: tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null,
      is_active: true,
    }, {
      onConflict: "workspace_id,platform,account_id",
    })
  }

  return NextResponse.redirect(`${APP_URL}/connect?success=true&platform=linkedin`)
}
