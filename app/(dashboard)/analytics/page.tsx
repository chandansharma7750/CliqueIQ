import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Users, Eye, Heart, Link2 } from "lucide-react"
import Link from "next/link"

const metrics = [
  { label: "Total Reach", value: "—", change: null, icon: Eye, color: "bg-blue-100 text-blue-700" },
  { label: "Engagement Rate", value: "—", change: null, icon: Heart, color: "bg-rose-100 text-rose-700" },
  { label: "Follower Growth", value: "—", change: null, icon: Users, color: "bg-green-100 text-green-700" },
  { label: "Posts Published", value: "0", change: null, icon: TrendingUp, color: "bg-violet-100 text-violet-700" },
]

export default function AnalyticsPage() {
  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analytics</h2>
          <p className="text-slate-500 mt-1">Cross-platform performance overview</p>
        </div>
        <div className="flex gap-2">
          {["7d", "30d", "90d"].map((r) => (
            <Button key={r} variant={r === "30d" ? "default" : "outline"} size="sm">{r}</Button>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{m.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{m.value}</p>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${m.color}`}>
                  <m.icon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Connect CTA */}
      <Card className="border-dashed border-2 border-slate-200">
        <CardContent className="py-16 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 mb-4">
            <BarChart3 className="h-8 w-8 text-violet-600" />
          </div>
          <CardTitle className="text-xl mb-2">Connect accounts to see analytics</CardTitle>
          <CardDescription className="max-w-sm mb-6">
            Link your Instagram, Facebook, LinkedIn, or YouTube accounts to start tracking reach, engagement, and follower growth in real time.
          </CardDescription>
          <Link href="/connect">
            <Button variant="gradient" className="gap-2">
              <Link2 className="h-4 w-4" />
              Connect Accounts
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div className="text-xs text-center text-slate-400">
        Analytics data refreshes every 6 hours via Meta Graph API, LinkedIn API, and YouTube Data API.
      </div>
    </div>
  )
}
