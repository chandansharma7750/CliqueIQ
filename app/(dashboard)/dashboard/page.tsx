import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  BarChart3,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Link2,
  FileText,
} from "lucide-react"
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube } from "react-icons/fa"
import Link from "next/link"

const platformIcon: Record<string, React.ReactNode> = {
  instagram: <FaInstagram className="h-4 w-4" style={{ color: "#e1306c" }} />,
  facebook: <FaFacebook className="h-4 w-4" style={{ color: "#1877f2" }} />,
  linkedin: <FaLinkedin className="h-4 w-4" style={{ color: "#0a66c2" }} />,
  youtube: <FaYoutube className="h-4 w-4" style={{ color: "#ff0000" }} />,
}

const platformColor: Record<string, string> = {
  instagram: "bg-pink-50 text-pink-700",
  facebook: "bg-blue-50 text-blue-700",
  linkedin: "bg-sky-50 text-sky-700",
  youtube: "bg-red-50 text-red-700",
}

const quickActions = [
  { href: "/schedule", icon: Calendar, label: "Schedule Post", desc: "Plan your content calendar" },
  { href: "/captions", icon: Sparkles, label: "Generate Caption", desc: "Hindi + English AI captions" },
  { href: "/connect", icon: Link2, label: "Connect Account", desc: "Add Instagram, Facebook & more" },
  { href: "/reports", icon: FileText, label: "PDF Report", desc: "Export white-label analytics" },
]

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single()

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name")
    .eq("owner_id", user!.id)
    .single()

  const wsId = workspace?.id ?? ""

  // Parallel fetch of all stats
  const [
    { data: socialAccounts },
    { count: scheduledCount },
    { count: publishedCount },
    { data: upcomingPosts },
    { data: recentPublished },
  ] = await Promise.all([
    supabase
      .from("social_accounts")
      .select("*")
      .eq("workspace_id", wsId)
      .eq("is_active", true)
      .limit(10),

    supabase
      .from("scheduled_posts")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", wsId)
      .eq("status", "scheduled")
      .gte("scheduled_at", new Date().toISOString()),

    supabase
      .from("scheduled_posts")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", wsId)
      .eq("status", "published")
      .gte("published_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),

    supabase
      .from("scheduled_posts")
      .select("id, platform, caption, scheduled_at, status")
      .eq("workspace_id", wsId)
      .in("status", ["scheduled", "draft"])
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(5),

    supabase
      .from("scheduled_posts")
      .select("id, platform, caption, published_at")
      .eq("workspace_id", wsId)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(3),
  ])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
  }

  const name = profile?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there"

  const statsCards = [
    {
      label: "Upcoming Scheduled",
      value: scheduledCount ?? 0,
      icon: Clock,
      color: "bg-violet-100 text-violet-700",
    },
    {
      label: "Published This Month",
      value: publishedCount ?? 0,
      icon: CheckCircle2,
      color: "bg-green-100 text-green-700",
    },
    {
      label: "Connected Accounts",
      value: socialAccounts?.length ?? 0,
      icon: Link2,
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Platforms Active",
      value: [...new Set((socialAccounts ?? []).map((a) => a.platform))].length,
      icon: BarChart3,
      color: "bg-amber-100 text-amber-700",
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          {greeting()}, {name} 👋
        </h2>
        <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening with your social media today.</p>
      </div>

      {/* Alert: No accounts connected */}
      {(!socialAccounts || socialAccounts.length === 0) && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">Connect your social accounts to get started</p>
            <p className="text-xs text-amber-600 mt-0.5">Link your Instagram, Facebook, LinkedIn, or YouTube to begin scheduling posts.</p>
          </div>
          <Link href="/connect">
            <Button size="sm" className="flex-shrink-0">Connect Now</Button>
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Posts + Connected Accounts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Posts */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Upcoming Posts</CardTitle>
                <CardDescription>Your next scheduled content</CardDescription>
              </div>
              <Link href="/schedule">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Schedule <ArrowUpRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {!upcomingPosts || upcomingPosts.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No upcoming posts scheduled</p>
                <Link href="/schedule">
                  <Button size="sm" variant="outline" className="mt-3">Schedule your first post</Button>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {upcomingPosts.map((post) => (
                  <li key={post.id} className="py-3 flex items-start gap-3">
                    <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md ${platformColor[post.platform] ?? "bg-slate-100 text-slate-600"}`}>
                      {platformIcon[post.platform] ?? <Calendar className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 truncate">{post.caption || "(No caption)"}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(post.scheduled_at)}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`flex-shrink-0 text-xs capitalize ${post.status === "draft" ? "bg-amber-100 text-amber-700" : "bg-violet-100 text-violet-700"}`}
                    >
                      {post.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Connected Accounts */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Connected Accounts</CardTitle>
              <Link href="/connect">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Add <ArrowUpRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {!socialAccounts || socialAccounts.length === 0 ? (
              <div className="text-center py-6">
                <Link2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No accounts yet</p>
                <Link href="/connect">
                  <Button size="sm" variant="outline" className="mt-3">
                    Connect first account
                  </Button>
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {socialAccounts.map((account) => (
                  <li key={account.id} className="flex items-center gap-3">
                    {platformIcon[account.platform] ?? null}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{account.account_name}</p>
                      <p className="text-xs text-slate-500 capitalize">{account.platform}</p>
                    </div>
                    <Badge variant="secondary" className="flex-shrink-0 text-xs bg-green-100 text-green-700">
                      Active
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <CardDescription>Jump straight into your most common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="flex items-start gap-3 rounded-lg border border-slate-100 p-4 hover:border-violet-200 hover:bg-violet-50/50 transition-all cursor-pointer group">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 group-hover:bg-violet-200 transition-colors">
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{action.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{action.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Festival Banner */}
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="text-3xl">🎉</div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">Indian Festival Calendar</p>
            <p className="text-sm text-slate-600 mt-0.5">200+ Indian festivals with ready-made post templates — never miss Diwali, IPL season, or Budget Day again.</p>
          </div>
          <Link href="/calendar">
            <Button variant="outline" size="sm">View Calendar</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
