import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/settings  → returns profile + workspace
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [{ data: profile }, { data: workspace }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("workspaces").select("*").eq("owner_id", user.id).single(),
  ])

  return NextResponse.json({ profile, workspace, email: user.email })
}

// PUT /api/settings  → update profile and/or workspace
export async function PUT(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { full_name, workspace_name, gst_number } = body

  const results: Record<string, unknown> = {}

  // Update profile
  if (full_name !== undefined) {
    const { error } = await supabase
      .from("profiles")
      .update({ full_name, updated_at: new Date().toISOString() })
      .eq("id", user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    results.profile = "updated"
  }

  // Update workspace
  if (workspace_name !== undefined || gst_number !== undefined) {
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .single()

    if (workspace) {
      const updates: Record<string, string> = {}
      if (workspace_name !== undefined) updates.name = workspace_name
      if (gst_number !== undefined) updates.gst_number = gst_number

      const { error } = await supabase
        .from("workspaces")
        .update(updates)
        .eq("id", workspace.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      results.workspace = "updated"
    }
  }

  return NextResponse.json({ success: true, results })
}
