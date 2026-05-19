"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Heart, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Link2, Info } from "lucide-react"
import Link from "next/link"
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts"
import { FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa"

type Range = "7d" | "30d" | "90d"

interface DailyData {
  date: string
  reach: number
  impressions: number
  engagement: number
  followers_gained: number
}

interface PlatformData {
  platform: string
  account_name: string
  followers: number
  reach: number
  engagement_rate: number
  posts: number
  extra?: {
    subscriber_count: number
    video_count: number
    view_count: number
  }
}

interface TopPost {
  id: string
  platform: string
  caption: string
  reach: number
  engagement: number
  likes: number
  comments: number
  published_at: string
}

interface AnalyticsData {
  isDemo: boolean
  summary: {
    reach: number
    impressions: number
    engagement: number
    engagement_rate: number
    followers_gained: number
    posts_published: number
  }
  daily: DailyData[]
  platforms: PlatformData[]
  top_posts: TopPost[]
}

function formatNum(n: number) {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

const PlatformIcon = ({ platform }: { platform: string }) => {
  if (platform === "instagram") return <FaInstagram className="h-4 w-4 text-pink-500" />
  if (platform === "facebook") return <FaFacebook className="h-4 w-4 text-blue-600" />
  if (platform === "youtube") return <FaYoutube className="h-4 w-4 text-red-600" />
  return null
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("30d")
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/analytics/overview?range=${range}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [range])

  const metrics = data
    ? [
        {
          label: "Total Reach",
          value: formatNum(data.summary.reach),
          raw: data.summary.reach,
          icon: Eye,
          color: "bg-blue-100 text-blue-700",
          trend: +12,
        },
        {
          label: "Engagement Rate",
          value: `${data.summary.engagement_rate}%`,
          raw: data.summary.engagement_rate,
          icon: Heart,
          color: "bg-rose-100 text-rose-700",
          trend: +0.4,
        },
        {
          label: "New Followers",
          value: `+${formatNum(data.summary.followers_gained)}`,
          raw: data.summary.followers_gained,
          icon: Users,
          color: "bg-green-100 text-green-700",
          trend: +8,
        },
        {
          label: "Posts Published",
          value: data.summary.posts_published.toString(),
          raw: data.summary.posts_published,
          icon: TrendingUp,
          color: "bg-violet-100 text-violet-700",
          trend: +3,
        },
      ]
    : []

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analytics</h2>
          <p className="text-slate-500 mt-1">Cross-platform performance overview</p>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as Range[]).map((r) => (
            <Button
              key={r}
              variant={range === r ? "default" : "outline"}
              size="sm"
              onClick={() => setRange(r)}
            >
              {r}
            </Button>
          ))}
        </div>
      </div>

      {/* Demo banner */}
      {data?.isDemo && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <Info className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            Sample data dikhaya ja raha hai — asli analytics ke liye{" "}
            <Link href="/connect" className="font-semibold underline">
              apna account connect karo
            </Link>
          </p>
        </div>
      )}

      {/* Metric cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="h-16 animate-pulse bg-slate-100 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <Card key={m.label}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{m.label}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{m.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {m.trend > 0 ? (
                        <ArrowUpRight className="h-3 w-3 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-500" />
                      )}
                      <span className={`text-xs font-medium ${m.trend > 0 ? "text-green-600" : "text-red-500"}`}>
                        {m.trend > 0 ? "+" : ""}{m.trend}% vs prev
                      </span>
                    </div>
                  </div>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${m.color}`}>
                    <m.icon className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reach & Engagement Chart */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reach & Engagement Over Time</CardTitle>
            <CardDescription>Daily performance across all connected platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.daily} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatNum}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                  formatter={(val, name) => [
                    formatNum(Number(val) || 0),
                    name === "reach" ? "Reach" : "Engagement",
                  ]}
                  labelFormatter={(label) => formatDate(label)}
                />
                <Legend
                  formatter={(val) => val === "reach" ? "Reach" : "Engagement"}
                  wrapperStyle={{ fontSize: 12 }}
                />
                <Area type="monotone" dataKey="reach" stroke="#8b5cf6" strokeWidth={2} fill="url(#reachGrad)" dot={false} />
                <Area type="monotone" dataKey="engagement" stroke="#f43f5e" strokeWidth={2} fill="url(#engGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Follower Growth Chart */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Follower Growth</CardTitle>
            <CardDescription>New followers gained per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data.daily} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                  formatter={(val) => [Number(val) || 0, "New Followers"]}
                  labelFormatter={(label) => formatDate(label)}
                />
                <Line
                  type="monotone"
                  dataKey="followers_gained"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Platform breakdown */}
        {data && data.platforms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Platform Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.platforms.map((p) => (
                <div key={p.platform} className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <PlatformIcon platform={p.platform} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-900 capitalize">{p.account_name}</span>
                      <span className="text-xs text-slate-500">
                        {p.platform === "youtube" ? `${formatNum(p.followers)} subscribers` : `${formatNum(p.followers)} followers`}
                      </span>
                    </div>
                    {p.platform === "youtube" && p.extra ? (
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Views: <strong className="text-slate-700">{formatNum(p.extra.view_count)}</strong></span>
                        <span>Videos: <strong className="text-slate-700">{p.extra.video_count}</strong></span>
                        <span>Subs: <strong className="text-slate-700">{formatNum(p.extra.subscriber_count)}</strong></span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Reach: <strong className="text-slate-700">{formatNum(p.reach)}</strong></span>
                        <span>Eng: <strong className="text-slate-700">{p.engagement_rate}%</strong></span>
                        <span>Posts: <strong className="text-slate-700">{p.posts}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Top Posts */}
        {data && data.top_posts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Posts</CardTitle>
              <CardDescription>Best performing content this period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.top_posts.map((post) => (
                <div key={post.id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 flex-shrink-0 mt-0.5">
                    <PlatformIcon platform={post.platform} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 line-clamp-2">{post.caption}</p>
                    <div className="flex gap-3 mt-1.5 text-xs text-slate-500">
                      <span>👁 {formatNum(post.reach)}</span>
                      <span>❤️ {post.likes}</span>
                      <span>💬 {post.comments}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Connect CTA if demo */}
      {data?.isDemo && (
        <Card className="border-dashed border-2 border-violet-200 bg-violet-50/30">
          <CardContent className="py-10 flex flex-col items-center text-center">
            <CardTitle className="text-lg mb-2">Apna account connect karo</CardTitle>
            <CardDescription className="max-w-sm mb-5">
              Instagram ya Facebook connect karo aur real reach, engagement aur follower data dekho.
            </CardDescription>
            <Link href="/connect">
              <Button variant="gradient" className="gap-2">
                <Link2 className="h-4 w-4" />
                Connect Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-center text-slate-400">
        Data refreshes every 6 hours via Meta Graph API
      </p>
    </div>
  )
}
