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
  Link2
} from "lucide-react"
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube } from "react-icons/fa"
import Link from "next/link"

const platformIcon: Record<string, React.ReactNode> = {
  instagram: <FaInstagram className="h-4 w-4" style={{ color: "#e1306c" }} />,
  facebook: <FaFacebook className="h-4 w-4" style={{ color: "#1877f2" }} />,
  linkedin: <FaLinkedin className="h-4 w-4" style={{ color: "#0a66c2" }} />,
  youtube: <FaYoutube className="h-4 w-4" style={{ color: "#ff0000" }} />,
}

const statsCards = [
  {
    label: "Scheduled Posts",
    value: "0",
    icon: Clock,
    color: "bg-violet-100 text-violet-700",
    trend: null,
  },
  {
    label: "Published This Month",
    value: "0",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700",
    trend: null,
  },
  {
    label: "Total Reach",
    value: "—",
    icon: TrendingUp,
    color: "bg-blue-100 text-blue-700",
    trend: null,
  },
  {
    label: "Avg Engagement",
    value: "—",
    icon: BarChart3,
    color: "bg-amber-100 text-amber-700",
    trend: null,
  },
]

const quickActions = [
  { href: "/schedule", icon: Calendar, label: "Schedule Post", desc: "Plan your content calendar" },
  { href: "/captions", icon: Sparkles, label: "Generate Caption", desc: "Hindi + English AI captions" },
  { href: "/connect", icon: Link2, label: "Connect Account", desc: "Add Instagram, Facebook & more" },
  { href: "/analytics", icon: BarChart3, label: "View Analytics", desc: "See your performance" },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single()

  const { data: socialAccounts } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("workspace_id", profile?.id ?? "")
    .limit(10)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
  }

  const name = profile?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there"

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

      {/* Quick Actions + Connected Accounts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Jump straight into your most common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
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
                      <p className="text-xs text-slate-500">{account.platform}</p>
                    </div>
                    <Badge variant={account.is_active ? "success" : "secondary"} className="flex-shrink-0 text-xs">
                      {account.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Festival */}
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
