"use client"

import { useEffect, useState } from "react"
import {
  AreaChart, Area, LineChart, Line,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Heart, Users, TrendingUp, Link2, Info, ExternalLink } from "lucide-react"
import { FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa"
import Link from "next/link"

// ─── Types ────────────────────────────────────────────────────────────────────
type Range = "7d" | "30d" | "90d"

interface DailyRow {
  date: string
  reach: number
  impressions: number
  engagement: number
  followers_gained: number
}
interface PlatRow {
  platform: string
  account_name: string
  followers: number
  reach: number
  engagement_rate: number
  posts: number
  extra?: { subscriber_count: number; video_count: number; view_count: number }
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
interface AnalData {
  isDemo: boolean
  youtubeOnly?: boolean
  summary: {
    reach: number
    impressions: number
    engagement: number
    engagement_rate: number
    followers_gained: number
    posts_published: number
  }
  daily: DailyRow[]
  platforms: PlatRow[]
  top_posts: TopPost[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fN(n: number): string {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(1)}Cr`
  if (n >= 100_000)    return `${(n / 100_000).toFixed(1)}L`
  if (n >= 1_000)      return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString("en-IN")
}
function fD(s: string): string {
  return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}
function ptColor(p: string): string {
  return p === "instagram" ? "#f7187c" : p === "facebook" ? "#2d7cf5" : p === "youtube" ? "#ff2244" : p === "linkedin" ? "#0a7bba" : "#7c3aed"
}
function ptBg(p: string): string {
  return p === "instagram" ? "bg-pink-50 text-pink-600" : p === "facebook" ? "bg-blue-50 text-blue-600" : p === "youtube" ? "bg-red-50 text-red-600" : "bg-violet-50 text-violet-600"
}

const PlatformIcon = ({ platform, className = "h-4 w-4" }: { platform: string; className?: string }) => {
  if (platform === "instagram") return <FaInstagram className={className} style={{ color: "#f7187c" }} />
  if (platform === "facebook")  return <FaFacebook  className={className} style={{ color: "#2d7cf5" }} />
  if (platform === "youtube")   return <FaYoutube   className={className} style={{ color: "#ff2244" }} />
  return null
}

// ─── Heatmap (demo) ───────────────────────────────────────────────────────────
const HMAP  = [.1,.08,.07,.06,.07,.09,.11,.16,.26,.36,.42,.46,.5,.47,.44,.5,.56,.66,.82,.92,.85,.68,.48,.28]
const WEEK  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
const DAYW  = [1,1,1,1,1,1.3,1.2]

function HeatmapViz() {
  return (
    <div>
      <div className="flex pl-10 gap-px mb-1">
        {Array.from({ length: 24 }, (_, h) => (
          <div key={h} className="flex-1 text-[9px] text-slate-400 text-center">
            {h % 6 === 0 ? `${h}h` : ""}
          </div>
        ))}
      </div>
      {WEEK.map((day, di) => (
        <div key={day} className="flex items-center gap-px mb-0.5">
          <div className="w-9 text-[10px] text-slate-400 text-right pr-1.5 shrink-0">{day}</div>
          {HMAP.map((base, h) => {
            const val   = Math.min(1, base * DAYW[di] * (0.75 + ((h * di + 17) % 9) / 18))
            const alpha = Math.round((0.07 + val * 0.87) * 100)
            return (
              <div
                key={h}
                title={`${day} ${h}:00 · Score: ${Math.round(val * 100)}%`}
                className="flex-1 h-3.5 rounded-sm cursor-pointer transition-transform hover:scale-150"
                style={{ background: `rgba(124,58,237,${alpha / 100})` }}
              />
            )
          })}
        </div>
      ))}
      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
        Low
        {[0.08, 0.25, 0.45, 0.65, 0.87].map((v, i) => (
          <div key={i} className="w-4 h-1.5 rounded-sm" style={{ background: `rgba(124,58,237,${v})` }} />
        ))}
        High
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [range, setRange]     = useState<Range>("30d")
  const [data, setData]       = useState<AnalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePt, setActivePt] = useState("all")

  useEffect(() => {
    setLoading(true)
    fetch(`/api/analytics/overview?range=${range}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [range])

  const days      = range === "7d" ? 7 : range === "90d" ? 90 : 30
  const totalFol  = data?.platforms?.reduce((s, p) => s + p.followers, 0) || 0
  const chartRows = data?.daily?.map(d => ({ date: fD(d.date), reach: d.reach, eng: d.engagement, fol: d.followers_gained })) || []
  const donut     = (data?.platforms || []).map(p => ({ name: p.platform, value: p.followers, color: ptColor(p.platform) }))

  const TABS = [
    { id: "all",       label: "All Platforms", icon: null },
    { id: "youtube",   label: "YouTube",       icon: <FaYoutube   className="h-3.5 w-3.5" style={{ color: "#ff2244" }} /> },
    { id: "instagram", label: "Instagram",     icon: <FaInstagram className="h-3.5 w-3.5" style={{ color: "#f7187c" }} /> },
    { id: "facebook",  label: "Facebook",      icon: <FaFacebook  className="h-3.5 w-3.5" style={{ color: "#2d7cf5" }} /> },
  ]

  // KPI cards — only real data, no hardcoded values
  const kpiCards = data
    ? data.youtubeOnly
      ? [
          { label: "Total Views",       value: fN(data.summary.reach),            icon: Eye,         color: "bg-red-100 text-red-700"     },
          { label: "Subscribers",       value: fN(data.summary.followers_gained), icon: Users,       color: "bg-green-100 text-green-700" },
          { label: "Videos Published",  value: String(data.summary.posts_published), icon: TrendingUp, color: "bg-violet-100 text-violet-700" },
          { label: "Engagement",        value: fN(data.summary.engagement),       icon: Heart,       color: "bg-rose-100 text-rose-700"   },
        ]
      : [
          { label: "Total Reach",       value: fN(data.summary.reach),            icon: Eye,         color: "bg-blue-100 text-blue-700"   },
          { label: "Impressions",       value: fN(data.summary.impressions),      icon: TrendingUp,  color: "bg-violet-100 text-violet-700" },
          { label: "Engagement Rate",   value: `${data.summary.engagement_rate}%`, icon: Heart,      color: "bg-rose-100 text-rose-700"   },
          { label: "New Followers",     value: `+${fN(totalFol || data.summary.followers_gained)}`, icon: Users, color: "bg-green-100 text-green-700" },
          { label: "Posts Published",   value: String(data.summary.posts_published), icon: TrendingUp, color: "bg-amber-100 text-amber-700" },
        ]
    : []

  return (
    <div className="max-w-7xl space-y-6">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analytics</h2>
          <p className="text-slate-500 mt-1 text-sm">Cross-platform performance overview</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(["7d", "30d", "90d"] as Range[]).map(r => (
            <Button
              key={r}
              size="sm"
              variant={range === r ? "default" : "outline"}
              onClick={() => setRange(r)}
            >
              {r}
            </Button>
          ))}
          <Button size="sm" variant="outline" className="gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            Export Report
          </Button>
        </div>
      </div>

      {/* ── DEMO BANNER ─────────────────────────────────────────────────────── */}
      {data?.isDemo && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <Info className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700">
            Sample data dikhaya ja raha hai — asli analytics ke liye{" "}
            <Link href="/connect" className="font-semibold underline">apna account connect karo</Link>
          </p>
        </div>
      )}

      {/* ── PLATFORM TABS ───────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActivePt(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activePt === t.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── KPI CARDS ───────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i}><CardContent className="p-5"><div className="h-16 animate-pulse bg-slate-100 rounded-lg" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className={`grid gap-4 ${kpiCards.length === 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-5"}`}>
          {kpiCards.map(m => (
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
      )}

      {/* ── YOUTUBE ONLY NOTICE ─────────────────────────────────────────────── */}
      {data?.youtubeOnly && data.daily.every(d => d.reach === 0) && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <FaYoutube className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-sm text-blue-700">
            YouTube channel stats shown above are live. Daily charts require Instagram or Facebook to be connected.
          </p>
        </div>
      )}

      {/* ── AREA CHART + PLATFORM SHARE ─────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              {data?.youtubeOnly ? "Views & Engagement" : "Reach & Engagement"} Over Time
            </CardTitle>
            <CardDescription>Daily performance · Last {days} days</CardDescription>
          </CardHeader>
          <CardContent>
            {chartRows.length > 0 && chartRows.some(r => r.reach > 0) ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartRows} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}    />
                    </linearGradient>
                    <linearGradient id="gEng" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={fN} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any, n: any) => [fN(Number(v)), n === "reach" ? (data?.youtubeOnly ? "Views" : "Reach") : "Engagement"] as any}
                    labelFormatter={l => l}
                  />
                  <Legend formatter={v => v === "reach" ? (data?.youtubeOnly ? "Views" : "Reach") : "Engagement"} wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="reach" stroke="#7c3aed" strokeWidth={2} fill="url(#gReach)" dot={false} />
                  <Area type="monotone" dataKey="eng"   stroke="#f43f5e" strokeWidth={2} fill="url(#gEng)"   dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 gap-3">
                <p className="text-sm text-slate-500">Chart data unavailable — connect Instagram or Facebook for daily analytics.</p>
                <Link href="/connect"><Button variant="outline" size="sm" className="gap-1.5"><Link2 className="h-3.5 w-3.5" />Connect Account</Button></Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Share Donut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platform Share</CardTitle>
            <CardDescription>By connected accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {donut.length > 0 ? (
              <>
                <div className="relative flex items-center justify-center mb-4">
                  <PieChart width={160} height={160}>
                    <Pie data={donut} cx={80} cy={80} innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                      {donut.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} formatter={(v: any) => [fN(Number(v)), ""] as any} />
                  </PieChart>
                  <div className="absolute text-center pointer-events-none">
                    <p className="text-lg font-bold text-slate-900">{fN(totalFol)}</p>
                    <p className="text-xs text-slate-400">Total</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {donut.map((d, i) => {
                    const pct = totalFol > 0 ? Math.round((d.value / totalFol) * 100) : 0
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: d.color }} />
                        <span className="text-xs font-medium flex-1 text-slate-700 capitalize">{d.name}</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: d.color }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-500 w-8 text-right">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <p className="text-sm text-slate-400 text-center">Connect accounts to see platform distribution</p>
                <Link href="/connect"><Button variant="outline" size="sm">Connect Account</Button></Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── FOLLOWER GROWTH + PLATFORM BREAKDOWN ────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Follower Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Follower Growth</CardTitle>
            <CardDescription>New followers gained per day</CardDescription>
          </CardHeader>
          <CardContent>
            {chartRows.some(r => r.fol > 0) ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartRows} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any) => [fN(Number(v)), "New Followers"] as any}
                    labelFormatter={l => l}
                  />
                  <Area type="monotone" dataKey="fol" stroke="#10b981" strokeWidth={2} fill="rgba(16,185,129,0.1)" dot={{ fill: "#10b981", r: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-44 gap-2">
                <p className="text-sm text-slate-400">No follower data available yet</p>
                <Link href="/connect"><Button variant="outline" size="sm">Connect Account</Button></Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platform Breakdown</CardTitle>
            <CardDescription>Connected platforms performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.platforms && data.platforms.length > 0 ? (
              data.platforms.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 shrink-0">
                    <PlatformIcon platform={p.platform} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-900 truncate">{p.account_name}</span>
                      <span className="text-xs text-slate-500 ml-2 shrink-0">
                        {p.platform === "youtube" ? `${fN(p.followers)} subs` : `${fN(p.followers)} followers`}
                      </span>
                    </div>
                    {p.platform === "youtube" && p.extra ? (
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>Views: <strong className="text-slate-700">{fN(p.extra.view_count)}</strong></span>
                        <span>Videos: <strong className="text-slate-700">{p.extra.video_count}</strong></span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>Reach: <strong className="text-slate-700">{fN(p.reach)}</strong></span>
                        <span>Eng: <strong className="text-slate-700">{p.engagement_rate}%</strong></span>
                        <span>Posts: <strong className="text-slate-700">{p.posts}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-44 gap-3">
                <Link2 className="h-8 w-8 text-slate-300" />
                <p className="text-sm text-slate-400">No accounts connected yet</p>
                <Link href="/connect"><Button variant="outline" size="sm">Connect Account</Button></Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── BEST TIME TO POST + COMPETITOR BENCHMARKING ──────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Heatmap */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Best Time to Post</CardTitle>
                <CardDescription>Engagement intensity by hour and day</CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">Demo</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <HeatmapViz />
          </CardContent>
        </Card>

        {/* Competitors */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Competitor Benchmarking</CardTitle>
                <CardDescription>vs. similar accounts in your niche</CardDescription>
              </div>
              <Badge className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-100">Coming Soon</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <RadarChart data={[
                { m: "Engagement", you: 87, avg: 72 },
                { m: "Reach",      you: 74, avg: 80 },
                { m: "Consistency",you: 80, avg: 74 },
                { m: "Content",    you: 92, avg: 70 },
                { m: "Growth",     you: 78, avg: 65 },
                { m: "Response",   you: 70, avg: 80 },
              ]}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="m" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar name="You" dataKey="you" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Avg" dataKey="avg" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.05} strokeWidth={1.5} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
            <p className="text-xs text-slate-400 text-center mt-2">
              Competitor data will be available in Phase 2. Values above are illustrative.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── SMART ALERTS ─────────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">⚡ Smart Alerts & Recommendations</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { icon:"🚀", title:"Engagement Spike",  body:"Tuesday posts are getting higher engagement. Try posting similar content on Tue–Wed evenings for better reach.",    color:"border-l-green-400",  bg:"bg-green-50"  },
            { icon:"💡", title:"Post Consistently", body:"Accounts posting 4× per week see 40% more profile visits. Open the scheduler to plan your next batch of posts.",   color:"border-l-violet-400", bg:"bg-violet-50" },
            { icon:"📅", title:"Festival Calendar", body:"Upcoming Indian festivals are great opportunities for branded content. Check the festival calendar for ready templates.", color:"border-l-amber-400",  bg:"bg-amber-50"  },
            { icon:"📊", title:"Connect More Platforms", body:"LinkedIn and YouTube connected together give a full picture of B2B + B2C reach. Connect more accounts to unlock blended analytics.", color:"border-l-blue-400", bg:"bg-blue-50" },
          ].map((a, i) => (
            <div key={i} className={`flex gap-3 p-4 rounded-xl border-l-4 ${a.color} ${a.bg}`}>
              <span className="text-lg shrink-0 mt-0.5">{a.icon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-800 mb-1">{a.title}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{a.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── AUDIENCE INSIGHTS ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Audience Insights</CardTitle>
              <CardDescription>Aggregated across connected platforms</CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">Demo data</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            {[
              { lbl: "Top Country", val: "🇮🇳 India",  sub: "42% of audience" },
              { lbl: "Peak Age",    val: "18–24",       sub: "34.1% of users"  },
              { lbl: "Gender",      val: "♂58% ♀42%",  sub: "Male majority"   },
              { lbl: "Peak Time",   val: "8–10 PM",     sub: "IST · Weekdays"  },
            ].map((a, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{a.lbl}</p>
                <p className="text-base font-bold text-slate-900">{a.val}</p>
                <p className="text-xs text-slate-500 mt-0.5">{a.sub}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2.5">
            {[["🇮🇳 India",42],["🇺🇸 USA",18],["🇬🇧 UK",12],["🇦🇪 UAE",9],["🇨🇦 Canada",7]].map(([flag, pct], i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm w-24 text-slate-700">{String(flag)}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-semibold text-slate-500 w-8 text-right">{pct}%</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4 text-center">
            Real audience data will appear here once Instagram or Facebook is connected.
          </p>
        </CardContent>
      </Card>

      {/* ── TOP POSTS ─────────────────────────────────────────────────────────── */}
      {data?.top_posts && data.top_posts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Posts</CardTitle>
            <CardDescription>Best performing content this period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.top_posts.map((post, i) => {
              const er = post.reach > 0 ? ((post.engagement / post.reach) * 100).toFixed(1) : "0.0"
              return (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 shrink-0 mt-0.5">
                    <PlatformIcon platform={post.platform} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 line-clamp-2">{post.caption}</p>
                    <div className="flex gap-3 mt-1.5 text-xs text-slate-500">
                      <span>👁 {fN(post.reach)}</span>
                      <span>❤️ {post.likes}</span>
                      <span>💬 {post.comments}</span>
                      <span className="text-green-600 font-medium">{er}% eng</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">
                    {fD(post.published_at)}
                  </span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* ── CONNECT CTA (demo only) ───────────────────────────────────────────── */}
      {data?.isDemo && (
        <Card className="border-dashed border-2 border-violet-200 bg-violet-50/30">
          <CardContent className="py-10 flex flex-col items-center text-center">
            <p className="text-lg font-bold text-slate-900 mb-2">Apna account connect karo</p>
            <p className="text-sm text-slate-500 max-w-sm mb-5">
              Instagram ya Facebook connect karo aur real reach, engagement aur follower data dekho.
            </p>
            <Link href="/connect">
              <Button className="gap-2 bg-violet-600 hover:bg-violet-700">
                <Link2 className="h-4 w-4" />
                Connect Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-center text-slate-400">
        Data refreshes every 6 hours via Meta Graph API & YouTube Analytics
      </p>
    </div>
  )
}
