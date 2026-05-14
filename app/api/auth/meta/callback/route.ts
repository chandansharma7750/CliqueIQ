import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const META_APP_ID = process.env.META_APP_ID!
const META_APP_SECRET = process.env.META_APP_SECRET!
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/meta/callback`

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get("code")
  const stateRaw = searchParams.get("state")
  const error = searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(`${origin}/connect?error=meta_auth_failed`)
  }

  let platform = "instagram"
  try {
    const state = JSON.parse(Buffer.from(stateRaw ?? "", "base64").toString())
    platform = state.platform ?? "instagram"
  } catch {
    // ignore
  }

  // Exchange code for access token
  const tokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?` +
      `client_id=${META_APP_ID}` +
      `&client_secret=${META_APP_SECRET}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&code=${code}`
  )
  const tokenData = await tokenRes.json()

  if (!tokenData.access_token) {
    return NextResponse.redirect(`${origin}/connect?error=token_exchange_failed`)
  }

  // Get user profile
  const profileRes = await fetch(
    `https://graph.facebook.com/v19.0/me?fields=id,name,picture&access_token=${tokenData.access_token}`
  )
  const profileData = await profileRes.json()

  // Save to database
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}/login`)
  }

  // Get user's workspace
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (workspace) {
    await supabase.from("social_accounts").upsert({
      workspace_id: workspace.id,
      platform,
      account_id: profileData.id,
      account_name: profileData.name ?? platform,
      account_handle: profileData.username ?? null,
      avatar_url: profileData.picture?.data?.url ?? null,
      access_token: tokenData.access_token,
      token_expires_at: tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null,
      is_active: true,
    }, {
      onConflict: "workspace_id,platform,account_id",
    })
  }

  return NextResponse.redirect(`${origin}/connect?success=true&platform=${platform}`)
}
