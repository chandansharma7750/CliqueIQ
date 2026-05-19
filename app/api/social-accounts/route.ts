import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ accounts: [] })

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!workspace) return NextResponse.json({ accounts: [] })

  const { data: accounts } = await supabase
    .from("social_accounts")
    .select("platform, account_name, account_handle, avatar_url, is_active, metadata")
    .eq("workspace_id", workspace.id)
    .eq("is_active", true)

  return NextResponse.json({ accounts: accounts ?? [] })
}
