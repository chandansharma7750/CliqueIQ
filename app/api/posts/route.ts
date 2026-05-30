import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/posts?month=2026-05  → returns all posts for that month
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: workspace } = await supabase
    .from("workspaces").select("id").eq("owner_id", user.id).single()
  if (!workspace) return NextResponse.json({ posts: [] })

  const month = req.nextUrl.searchParams.get("month") // e.g. "2026-05"
  let query = supabase
    .from("scheduled_posts")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("scheduled_at", { ascending: true })

  if (month) {
    const start = `${month}-01T00:00:00.000Z`
    const [y, m] = month.split("-").map(Number)
    const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`
    const end = `${nextMonth}-01T00:00:00.000Z`
    query = query.gte("scheduled_at", start).lt("scheduled_at", end)
  }

  const { data: posts, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ posts })
}

// POST /api/posts  → create a new scheduled post
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: workspace } = await supabase
    .from("workspaces").select("id").eq("owner_id", user.id).single()
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 })

  const body = await req.json()
  const { platform, caption, scheduled_at, image_url, status = "scheduled" } = body

  if (!platform || !scheduled_at) {
    return NextResponse.json({ error: "platform and scheduled_at are required" }, { status: 400 })
  }

  const { data: post, error } = await supabase
    .from("scheduled_posts")
    .insert({
      workspace_id: workspace.id,
      platform,
      caption: caption || "",
      scheduled_at,
      image_url: image_url || null,
      status,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post }, { status: 201 })
}

// DELETE /api/posts?id=xxx  → delete a post
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })

  const { data: workspace } = await supabase
    .from("workspaces").select("id").eq("owner_id", user.id).single()
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 })

  const { error } = await supabase
    .from("scheduled_posts")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspace.id) // security: only delete own posts

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
