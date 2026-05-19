"use client"

import { useEffect, useState } from "react"
import {
  AreaChart, Area, LineChart, Line,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import Link from "next/link"

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  bg:  "#05070f",
  s1:  "#0a0d1a",
  s2:  "#0f1224",
  s3:  "#141828",
  b1:  "rgba(255,255,255,0.06)",
  b2:  "rgba(255,255,255,0.11)",
  tx:  "#dde1f0",
  tx2: "#8892b0",
  mu:  "#4a5170",
  ac:  "#6c63ff",
  ac2: "#00d4ff",
  gr:  "#00e5a0",
  rd:  "#ff4d6d",
  yt:  "#ff2244",
  ig:  "#f7187c",
  li:  "#0a7bba",
  fb:  "#2d7cf5",
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Range = "7d" | "30d" | "90d"
interface DailyRow { date: string; reach: number; impressions: number; engagement: number; followers_gained: number }
interface PlatRow  { platform: string; account_name: string; followers: number; reach: number; engagement_rate: number; posts: number; extra?: { subscriber_count: number; video_count: number; view_count: number } }
interface TopPost  { id: string; platform: string; caption: string; reach: number; engagement: number; likes: number; comments: number; published_at: string }
interface AnalData { isDemo: boolean; youtubeOnly?: boolean; summary: { reach: number; impressions: number; engagement: number; engagement_rate: number; followers_gained: number; posts_published: number }; daily: DailyRow[]; platforms: PlatRow[]; top_posts: TopPost[] }

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
function ptCol(p: string) {
  return p === "instagram" ? C.ig : p === "facebook" ? C.fb : p === "youtube" ? C.yt : p === "linkedin" ? C.li : C.ac
}
function ptIco(p: string): string {
  return p === "instagram" ? "📸" : p === "facebook" ? "f" : p === "youtube" ? "▶" : p === "linkedin" ? "in" : "●"
}

// ─── Static Demo Data ─────────────────────────────────────────────────────────
const HMAP = [.1,.08,.07,.06,.07,.09,.11,.16,.26,.36,.42,.46,.5,.47,.44,.5,.56,.66,.82,.92,.85,.68,.48,.28]
const WEEK  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
const DAYW  = [1,1,1,1,1,1.3,1.2]

const SPARK: number[][] = [
  [80,85,78,92,88,95,100,98,105,112,118],
  [60,70,65,80,75,90,85,95,100,110,120],
  [50,55,52,60,58,55,62,60,58,65,70],
  [30,45,40,55,50,65,60,75,70,85,90],
  [12,15,10,18,14,16,20,17,22,19,23],
]

const RADAR_DATA = [
  { m:"Engagement", you:87, avg:72 },
  { m:"Reach",      you:74, avg:80 },
  { m:"Consistency",you:80, avg:74 },
  { m:"Content",    you:92, avg:70 },
  { m:"Growth",     you:78, avg:65 },
  { m:"Response",   you:70, avg:80 },
]

const COMPS = [
  { name:"You",              handle:"@yourbrand",     eng:4.67, col:C.ac,  isYou:true  },
  { name:"Competitor Beta",  handle:"@betacreatives", eng:5.21, col:C.ac2, isYou:false },
  { name:"Competitor Alpha", handle:"@alphabrands",   eng:3.89, col:C.yt,  isYou:false },
  { name:"Competitor Gamma", handle:"@gammadigital",  eng:3.12, col:C.ig,  isYou:false },
]

const ALERTS = [
  { icon:"🚀", title:"Engagement Spike",  body:"Tuesday posts get 3.2× avg engagement. Post Tue–Wed 7–9 PM for max reach.", action:"Create post →",      col:C.gr  },
  { icon:"⚠️", title:"Reach Declining",   body:"Reach dropped 18% this week. Refresh content formats and A/B test thumbnails.", action:"View tips →",  col:C.rd  },
  { icon:"💡", title:"Posting Gap",       body:"No posts in 12 days. Accounts posting 4×/week see 40% more profile visits.", action:"Open Scheduler →", col:C.ac  },
  { icon:"🎉", title:"AI Insight",        body:"Reels outperform static posts by 3.4×. Reallocate 20% budget to short-form video.", action:"Full Analysis →", col:C.ac2 },
]

const ROI = [
  { icon:"💰", val:"₹4.2L",  lbl:"Est. Earned Media Value" },
  { icon:"🎯", val:"312%",   lbl:"Social Media ROI"        },
  { icon:"📣", val:"₹0.82",  lbl:"Cost Per Engagement"     },
  { icon:"🏆", val:"94/100", lbl:"Brand Health Score"      },
]

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Spark({ data, color }: { data: number[]; color: string }) {
  return (
    <div style={{ position:"absolute", bottom:12, right:12, opacity:.35, pointerEvents:"none" }}>
      <ResponsiveContainer width={80} height={28}>
        <LineChart data={data.map((v,i)=>({v,i}))}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.8} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, trend, up, color, spark, delay=0 }: {
  label:string; value:string; sub:string; trend:string; up:boolean; color:string; spark:number[]; delay?:number
}) {
  const [hov, setHov] = useState(false)
  return (
    <div style={{
      background:C.s1, border:`1px solid ${C.b1}`, borderRadius:14, padding:"19px",
      position:"relative", overflow:"hidden", cursor:"pointer",
      animation:`fadeUp .4s ease ${delay}s both`,
      transform:hov?"translateY(-2px)":"", transition:"transform .2s",
    }}
    onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={{ position:"absolute", top:0, left:18, right:18, height:2, background:color, borderRadius:"0 0 2px 2px" }} />
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
        <div />
        <span style={{
          display:"inline-flex", alignItems:"center", gap:3, fontSize:11, fontWeight:600,
          padding:"3px 7px", borderRadius:20,
          background:up?"rgba(0,229,160,.12)":"rgba(255,77,109,.12)",
          color:up?C.gr:C.rd,
        }}>{up?"▲":"▼"} {trend}</span>
      </div>
      <div style={{ fontFamily:"Syne,var(--font-heading,sans-serif)", fontSize:26, fontWeight:800, letterSpacing:-1, lineHeight:1, color:"#fff" }}>{value}</div>
      <div style={{ fontSize:11, color:C.mu, marginTop:5, textTransform:"uppercase", letterSpacing:.4, fontWeight:500 }}>{label}</div>
      <div style={{ fontSize:11, color:C.tx2, marginTop:5 }}>{sub}</div>
      <Spark data={spark} color={color} />
    </div>
  )
}

// ─── ROI Card ─────────────────────────────────────────────────────────────────
function RoiCard({ icon, val, lbl, delay=0 }: { icon:string; val:string; lbl:string; delay?:number }) {
  const [hov, setHov] = useState(false)
  return (
    <div style={{
      background:C.s1, border:`1px solid ${C.b1}`, borderRadius:13, padding:17,
      textAlign:"center", cursor:"pointer",
      animation:`fadeUp .45s ease ${delay}s both`,
      transform:hov?"translateY(-2px)":"", transition:"transform .2s",
    }}
    onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={{ fontSize:22, marginBottom:7 }}>{icon}</div>
      <div style={{ fontFamily:"Syne,sans-serif", fontSize:22, fontWeight:800, color:"#fff" }}>{val}</div>
      <div style={{ fontSize:11, color:C.mu, marginTop:3 }}>{lbl}</div>
    </div>
  )
}

// ─── Heatmap ──────────────────────────────────────────────────────────────────
function HeatmapViz() {
  return (
    <div>
      <div style={{ display:"flex", paddingLeft:42, gap:2, marginBottom:4 }}>
        {Array.from({length:24},(_,h)=>(
          <div key={h} style={{ flex:1, fontSize:9, color:C.mu, textAlign:"center" }}>{h%6===0?`${h}h`:""}</div>
        ))}
      </div>
      {WEEK.map((day,di)=>(
        <div key={day} style={{ display:"flex", alignItems:"center", gap:2, marginBottom:2 }}>
          <div style={{ width:38, fontSize:10, color:C.mu, textAlign:"right", paddingRight:6, flexShrink:0 }}>{day}</div>
          {HMAP.map((base,h)=>{
            const val = Math.min(1, base * DAYW[di] * (0.75 + ((h*di+17)%9)/18))
            const alpha = 0.07 + val * 0.87
            return (
              <div key={h} title={`${day} ${h}:00 · Score: ${Math.round(val*100)}%`}
                style={{ flex:1, height:15, borderRadius:3, cursor:"pointer", background:`rgba(108,99,255,${alpha})`, transition:"transform .15s" }}
                onMouseEnter={e=>(e.currentTarget.style.transform="scale(1.5)")}
                onMouseLeave={e=>(e.currentTarget.style.transform="")} />
            )
          })}
        </div>
      ))}
      <div style={{ display:"flex", alignItems:"center", gap:7, marginTop:10, fontSize:10, color:C.mu }}>
        Low
        {[.08,.25,.45,.65,.87].map((v,i)=>(
          <div key={i} style={{ width:18, height:7, borderRadius:2, background:`rgba(108,99,255,${v})` }} />
        ))}
        High
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("30d")
  const [data, setData]   = useState<AnalData|null>(null)
  const [loading, setLoading] = useState(true)
  const [activePt, setActivePt] = useState("all")
  const [hideBanner, setHideBanner] = useState(false)

  useEffect(()=>{
    setLoading(true)
    fetch(`/api/analytics/overview?range=${range}`)
      .then(r=>r.json())
      .then(d=>{ setData(d); setLoading(false) })
      .catch(()=>setLoading(false))
  },[range])

  const days = range==="7d"?7:range==="90d"?90:30

  const chartRows = data?.daily?.map(d=>({
    date:fD(d.date), reach:d.reach, eng:d.engagement, fol:d.followers_gained,
  })) || []

  const totalFol = data?.platforms?.reduce((s,p)=>s+p.followers,0) || 0
  const donut    = (data?.platforms||[]).map(p=>({ name:p.platform, value:p.followers, color:ptCol(p.platform) }))

  const TABS = [
    { id:"all",       label:"All Platforms", icon:"⚡", sub:String(data?.platforms?.length||0) },
    { id:"youtube",   label:"YouTube",       icon:"▶" },
    { id:"instagram", label:"Instagram",     icon:"📸" },
    { id:"facebook",  label:"Facebook",      icon:"f" },
  ]

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      background:C.bg, margin:"-24px", padding:"24px 28px",
      color:C.tx, minHeight:"calc(100vh - 64px)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes blink  { 0%,100%{opacity:1}50%{opacity:.45} }
        .an-grid-5 { display:grid; grid-template-columns:repeat(5,1fr); gap:13px; }
        .an-grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:13px; }
        .an-grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr;   gap:17px; }
        .an-grid-2 { display:grid; grid-template-columns:1fr 1fr;       gap:17px; }
        .an-hero   { display:grid; grid-template-columns:1fr 310px;     gap:17px; }
        @media(max-width:1280px){
          .an-grid-5{ grid-template-columns:repeat(3,1fr); }
          .an-grid-4{ grid-template-columns:repeat(2,1fr); }
          .an-hero  { grid-template-columns:1fr; }
        }
        @media(max-width:900px){
          .an-grid-5{ grid-template-columns:repeat(2,1fr); }
          .an-grid-3{ grid-template-columns:1fr 1fr; }
        }
        @media(max-width:640px){
          .an-grid-5{ grid-template-columns:1fr; }
          .an-grid-3{ grid-template-columns:1fr; }
          .an-grid-2{ grid-template-columns:1fr; }
          .an-grid-4{ grid-template-columns:1fr 1fr; }
        }
      `}</style>

      {/* ── HERO BAR ─────────────────────────────────────────────────────── */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:14 }}>
        <div>
          <h1 style={{ fontFamily:"Syne,sans-serif", fontSize:26, fontWeight:800, letterSpacing:-.5, color:"#fff", margin:0 }}>
            Performance <span style={{ color:C.ac }}>Analytics</span>
          </h1>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:7, fontSize:13, color:C.tx2 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:C.gr, boxShadow:`0 0 8px ${C.gr}`, display:"inline-block", animation:"blink 2s infinite" }} />
            Live · Updated 2 min ago · {new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
          </div>
        </div>
        <div style={{ display:"flex", gap:9, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ display:"flex", background:C.s1, border:`1px solid ${C.b1}`, borderRadius:9, overflow:"hidden" }}>
            {(["7d","30d","90d"] as Range[]).map(r=>(
              <button key={r} onClick={()=>setRange(r)} style={{
                padding:"7px 13px", fontSize:12, fontWeight:500, cursor:"pointer", border:"none",
                fontFamily:"inherit", transition:"all .2s",
                background:range===r?C.ac:"transparent", color:range===r?"#fff":C.mu,
              }}>{r.toUpperCase()}</button>
            ))}
          </div>
          <button style={{
            display:"flex", alignItems:"center", gap:6, padding:"8px 15px",
            background:`linear-gradient(135deg,${C.ac},${C.ac2})`, border:"none",
            borderRadius:9, color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
          }}>↓ Export PDF Report</button>
        </div>
      </div>

      {/* ── BANNER ───────────────────────────────────────────────────────── */}
      {!hideBanner && (
        <div style={{
          display:"flex", alignItems:"center", gap:11, padding:"11px 16px", marginBottom:22,
          background:"linear-gradient(135deg,rgba(108,99,255,.12),rgba(0,212,255,.05))",
          border:`1px solid rgba(108,99,255,.22)`, borderRadius:12,
        }}>
          <span style={{ fontSize:17 }}>🧠</span>
          <span style={{ fontSize:13, lineHeight:1.5 }}>
            {data?.isDemo
              ? <><strong style={{ color:C.ac2 }}>Sample data</strong> — <Link href="/connect" style={{ color:C.ac, fontWeight:600 }}>Connect accounts</Link> for real analytics.</>
              : <><strong style={{ color:C.ac2 }}>AI Insight:</strong> Reels outperform static posts by <strong style={{ color:C.gr }}>3.4×</strong> this month. Reallocating 20% of budget to Reels could boost reach by ₹48K/month.</>
            }
          </span>
          <span style={{ marginLeft:"auto", cursor:"pointer", color:C.mu, fontSize:15, lineHeight:1, flexShrink:0 }} onClick={()=>setHideBanner(true)}>✕</span>
        </div>
      )}

      {/* ── PLATFORM TABS ────────────────────────────────────────────────── */}
      <div style={{ display:"flex", gap:4, background:C.s1, border:`1px solid ${C.b1}`, borderRadius:13, padding:5, marginBottom:22, overflowX:"auto" }}>
        {TABS.map(t=>{
          const iAct = activePt===t.id
          const col  = t.id==="youtube"?C.yt:t.id==="instagram"?C.ig:t.id==="facebook"?C.fb:C.ac
          return (
            <button key={t.id} onClick={()=>setActivePt(t.id)} style={{
              display:"flex", alignItems:"center", gap:7, padding:"8px 14px",
              borderRadius:9, cursor:"pointer", fontSize:13, fontWeight:500,
              border:iAct?`1px solid ${col}44`:"1px solid transparent",
              background:iAct?`${col}12`:"transparent",
              color:iAct?col:C.mu, transition:"all .2s", fontFamily:"inherit", whiteSpace:"nowrap",
            }}>
              <span>{t.icon}</span> {t.label}
              {t.sub && <span style={{ fontSize:10, color:C.mu, marginLeft:2 }}>{t.sub}</span>}
            </button>
          )
        })}
      </div>

      {/* ── KPI CARDS ────────────────────────────────────────────────────── */}
      <div className="an-grid-5" style={{ marginBottom:18 }}>
        {loading
          ? [1,2,3,4,5].map(i=>(
              <div key={i} style={{ background:C.s1, borderRadius:14, height:120, animation:"blink 1.5s infinite" }} />
            ))
          : <>
              <KpiCard label="Total Followers"   value={fN(totalFol||data?.summary?.followers_gained||0)}  sub="+9,412 this month"    trend="8.3%"  up color={C.ac}  spark={SPARK[0]} delay={.05} />
              <KpiCard label="Total Impressions"  value={fN(data?.summary?.impressions||0)}                sub="Across all platforms"  trend="14.2%" up color={C.gr}  spark={SPARK[1]} delay={.10} />
              <KpiCard label="Engagement Rate"    value={`${data?.summary?.engagement_rate||0}%`}          sub="Industry avg: 3.2%"   trend="1.1%"  up color={C.ig}  spark={SPARK[2]} delay={.15} />
              <KpiCard label="Total Engagement"   value={fN(data?.summary?.engagement||0)}                sub="Likes + comments"      trend="22.1%" up color={C.ac2} spark={SPARK[3]} delay={.20} />
              <KpiCard label="Posts Published"    value={String(data?.summary?.posts_published||0)}        sub="Optimal: 50–60/mo"    trend="5.7%"  up color={C.yt}  spark={SPARK[4]} delay={.25} />
            </>
        }
      </div>

      {/* ── ROI ROW ──────────────────────────────────────────────────────── */}
      <div className="an-grid-4" style={{ marginBottom:18 }}>
        {ROI.map((r,i)=><RoiCard key={i} {...r} delay={.08+i*.05} />)}
      </div>

      {/* ── GROWTH CHART + DONUT ─────────────────────────────────────────── */}
      <div className="an-hero" style={{ marginBottom:17 }}>
        {/* Area Chart */}
        <div style={{ background:C.s1, border:`1px solid ${C.b1}`, borderRadius:15, padding:20 }}>
          <div style={{ fontFamily:"Syne,sans-serif", fontSize:14, fontWeight:700, color:"#fff", marginBottom:3 }}>
            {data?.youtubeOnly ? "Views & Engagement" : "Reach & Engagement"} Over Time
          </div>
          <div style={{ fontSize:11, color:C.mu, marginBottom:16 }}>Daily performance · Last {days} days</div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={chartRows} margin={{ top:5, right:10, left:0, bottom:5 }}>
              <defs>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.ac} stopOpacity={.2}/>
                  <stop offset="95%" stopColor={C.ac} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.ig} stopOpacity={.2}/>
                  <stop offset="95%" stopColor={C.ig} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
              <XAxis dataKey="date" tick={{ fontSize:11, fill:C.mu }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize:11, fill:C.mu }} tickLine={false} axisLine={false} tickFormatter={fN} />
              <Tooltip
                contentStyle={{ background:C.s2, border:`1px solid ${C.b2}`, borderRadius:8, fontSize:12 }}
                labelStyle={{ color:C.tx }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(v:any, n:any)=>[fN(Number(v)), n==="reach"?(data?.youtubeOnly?"Views":"Reach"):"Engagement"] as any}
              />
              <Legend formatter={v=>v==="reach"?(data?.youtubeOnly?"Views":"Reach"):"Engagement"} wrapperStyle={{ fontSize:12, color:C.tx2 }} />
              <Area type="monotone" dataKey="reach" stroke={C.ac} strokeWidth={2} fill="url(#gR)" dot={false} />
              <Area type="monotone" dataKey="eng"   stroke={C.ig} strokeWidth={2} fill="url(#gE)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut */}
        <div style={{ background:C.s1, border:`1px solid ${C.b1}`, borderRadius:15, padding:20 }}>
          <div style={{ fontFamily:"Syne,sans-serif", fontSize:14, fontWeight:700, color:"#fff", marginBottom:3 }}>Platform Share</div>
          <div style={{ fontSize:11, color:C.mu, marginBottom:14 }}>By connected accounts</div>
          {donut.length>0 ? (
            <>
              <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
                <PieChart width={180} height={180}>
                  <Pie data={donut} cx={90} cy={90} innerRadius={56} outerRadius={82} paddingAngle={3} dataKey="value">
                    {donut.map((d,i)=><Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background:C.s2, border:`1px solid ${C.b2}`, borderRadius:8, fontSize:12 }} />
                </PieChart>
                <div style={{ position:"absolute", textAlign:"center", pointerEvents:"none" }}>
                  <div style={{ fontFamily:"Syne,sans-serif", fontSize:18, fontWeight:800, color:"#fff" }}>{fN(totalFol)}</div>
                  <div style={{ fontSize:10, color:C.mu }}>Total</div>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                {donut.map((d,i)=>{
                  const pct = totalFol>0 ? Math.round((d.value/totalFol)*100) : 0
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:d.color, flexShrink:0 }} />
                      <span style={{ fontSize:12, fontWeight:500, flex:1, color:C.tx, textTransform:"capitalize" }}>{d.name}</span>
                      <div style={{ width:58, height:3, background:C.s3, borderRadius:99, overflow:"hidden" }}>
                        <div style={{ width:`${pct}%`, height:"100%", background:d.color, borderRadius:99 }} />
                      </div>
                      <span style={{ fontSize:12, fontWeight:700, color:C.tx2, minWidth:28, textAlign:"right" }}>{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:200, gap:10 }}>
              <div style={{ fontSize:32 }}>📊</div>
              <span style={{ fontSize:13, color:C.mu }}>No accounts connected</span>
              <Link href="/connect" style={{ color:C.ac, fontSize:13, fontWeight:600 }}>Connect accounts →</Link>
            </div>
          )}
        </div>
      </div>

      {/* ── 3-COL: Follower Growth / Platform Breakdown / Audience ─────── */}
      <div className="an-grid-3" style={{ marginBottom:17 }}>
        {/* Follower Growth */}
        <div style={{ background:C.s1, border:`1px solid ${C.b1}`, borderRadius:15, padding:20 }}>
          <div style={{ fontFamily:"Syne,sans-serif", fontSize:14, fontWeight:700, color:"#fff", marginBottom:3 }}>Follower Growth</div>
          <div style={{ fontSize:11, color:C.mu, marginBottom:14 }}>New followers gained per day</div>
          <ResponsiveContainer width="100%" height={195}>
            <AreaChart data={chartRows} margin={{ top:5, right:5, left:0, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
              <XAxis dataKey="date" tick={{ fontSize:10, fill:C.mu }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize:10, fill:C.mu }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background:C.s2, border:`1px solid ${C.b2}`, borderRadius:8, fontSize:11 }} labelStyle={{ color:C.tx }} formatter={(v:any)=>[Number(v),"New Followers"] as any} />
              <Area type="monotone" dataKey="fol" stroke={C.gr} strokeWidth={2} fill="rgba(0,229,160,.1)" dot={{ fill:C.gr, r:2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Breakdown */}
        <div style={{ background:C.s1, border:`1px solid ${C.b1}`, borderRadius:15, padding:20 }}>
          <div style={{ fontFamily:"Syne,sans-serif", fontSize:14, fontWeight:700, color:"#fff", marginBottom:3 }}>Platform Breakdown</div>
          <div style={{ fontSize:11, color:C.mu, marginBottom:16 }}>Connected platforms</div>
          {data?.platforms && data.platforms.length>0 ? (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {data.platforms.map((p,i)=>{
                const col = ptCol(p.platform)
                const ico = ptIco(p.platform)
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:11 }}>
                    <div style={{ width:36, height:36, borderRadius:9, background:`${col}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>{ico}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:12, fontWeight:500, color:C.tx }}>{p.account_name}</span>
                        <span style={{ fontSize:11, color:C.tx2 }}>{fN(p.followers)} {p.platform==="youtube"?"subs":"fol"}</span>
                      </div>
                      {p.platform==="youtube"&&p.extra
                        ? <div style={{ fontSize:11, color:C.mu }}>Views: {fN(p.extra.view_count)} · {p.extra.video_count} videos</div>
                        : <div style={{ fontSize:11, color:C.mu }}>Reach: {fN(p.reach)} · Eng: {p.engagement_rate}%</div>
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign:"center", padding:"50px 0", color:C.mu, fontSize:13 }}>
              <Link href="/connect" style={{ color:C.ac, fontWeight:600 }}>Connect accounts →</Link>
            </div>
          )}
        </div>

        {/* Audience */}
        <div style={{ background:C.s1, border:`1px solid ${C.b1}`, borderRadius:15, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
            <div>
              <div style={{ fontFamily:"Syne,sans-serif", fontSize:14, fontWeight:700, color:"#fff", marginBottom:3 }}>Audience Insights</div>
              <div style={{ fontSize:11, color:C.mu }}>Aggregated across platforms</div>
            </div>
            <span style={{ fontSize:10, padding:"2px 8px", background:C.s2, borderRadius:6, color:C.mu, border:`1px solid ${C.b1}` }}>Demo</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:14 }}>
            {[
              { lbl:"Top Country", val:"🇮🇳 India",  sub:"42% of audience" },
              { lbl:"Peak Age",    val:"18–24",       sub:"34.1%" },
              { lbl:"Gender",      val:"♂58% ♀42%",  sub:"" },
              { lbl:"Peak Time",   val:"8–10 PM",     sub:"IST · Weekdays" },
            ].map((a,i)=>(
              <div key={i} style={{ background:C.s2, borderRadius:10, padding:11, border:`1px solid ${C.b1}` }}>
                <div style={{ fontSize:10, color:C.mu, textTransform:"uppercase", letterSpacing:.5, marginBottom:3 }}>{a.lbl}</div>
                <div style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{a.val}</div>
                {a.sub&&<div style={{ fontSize:10, color:C.tx2, marginTop:2 }}>{a.sub}</div>}
              </div>
            ))}
          </div>
          <div style={{ fontSize:11, color:C.mu, marginBottom:8 }}>Top Countries</div>
          {(["🇮🇳 India:42","🇺🇸 USA:18","🇬🇧 UK:12","🇦🇪 UAE:9"] as string[]).map((s,i)=>{
            const [flag, pct] = [s.split(":")[0], parseInt(s.split(":")[1])]
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
                <span style={{ fontSize:13, minWidth:70 }}>{flag}</span>
                <div style={{ flex:1, height:3, background:C.s3, borderRadius:99, overflow:"hidden" }}>
                  <div style={{ width:`${pct}%`, height:"100%", background:C.ac, borderRadius:99 }} />
                </div>
                <span style={{ fontSize:11, fontWeight:600, color:C.tx2, minWidth:28, textAlign:"right" }}>{pct}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── HEATMAP + COMPETITORS ────────────────────────────────────────── */}
      <div className="an-grid-2" style={{ marginBottom:17 }}>
        {/* Heatmap */}
        <div style={{ background:C.s1, border:`1px solid ${C.b1}`, borderRadius:15, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
            <div>
              <div style={{ fontFamily:"Syne,sans-serif", fontSize:14, fontWeight:700, color:"#fff" }}>Best Time to Post</div>
              <div style={{ fontSize:11, color:C.mu, marginTop:2 }}>Engagement intensity · Hour × Day</div>
            </div>
            <span style={{ fontSize:10, padding:"2px 8px", background:C.s2, borderRadius:6, color:C.mu, border:`1px solid ${C.b1}` }}>Demo</span>
          </div>
          <HeatmapViz />
        </div>

        {/* Competitors */}
        <div style={{ background:C.s1, border:`1px solid ${C.b1}`, borderRadius:15, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
            <div>
              <div style={{ fontFamily:"Syne,sans-serif", fontSize:14, fontWeight:700, color:"#fff" }}>Competitor Benchmarking</div>
              <div style={{ fontSize:11, color:C.mu, marginTop:2 }}>vs. similar accounts in your niche</div>
            </div>
            <span style={{ fontSize:10, padding:"2px 8px", background:"rgba(255,153,0,.08)", borderRadius:6, color:"#ff9900", border:"1px solid rgba(255,153,0,.2)" }}>Coming Soon</span>
          </div>
          <ResponsiveContainer width="100%" height={165}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="rgba(255,255,255,.07)" />
              <PolarAngleAxis dataKey="m" tick={{ fontSize:10, fill:C.mu }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar name="You" dataKey="you" stroke={C.ac} fill={C.ac} fillOpacity={.1} strokeWidth={2} />
              <Radar name="Avg" dataKey="avg" stroke={C.yt} fill={C.yt} fillOpacity={.04} strokeWidth={1.5} />
              <Legend wrapperStyle={{ fontSize:11, color:C.tx2 }} />
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:12 }}>
            {COMPS.map((c,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:30, height:30, borderRadius:"50%", background:`${c.col}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0 }}>
                  {c.isYou?"👤":"🅰"}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:500, color:C.tx }}>{c.name}</div>
                  <div style={{ fontSize:11, color:C.mu }}>{c.handle}</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontFamily:"Syne,sans-serif", fontSize:13, fontWeight:700, color:c.isYou?C.ac:C.tx }}>{c.eng}%</div>
                  {!c.isYou&&(
                    <div style={{ fontSize:10, color:c.eng>4.67?C.rd:C.gr }}>
                      {c.eng>4.67?`▲ ${(c.eng-4.67).toFixed(2)}% ahead`:`▼ Win by ${(4.67-c.eng).toFixed(2)}%`}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SMART ALERTS ─────────────────────────────────────────────────── */}
      <div style={{ fontFamily:"Syne,sans-serif", fontSize:15, fontWeight:700, color:"#fff", marginBottom:13 }}>
        ⚡ Smart Alerts & Recommendations
      </div>
      <div className="an-grid-2" style={{ marginBottom:22 }}>
        {ALERTS.map((a,i)=>(
          <div key={i} style={{
            padding:15, borderRadius:12, background:C.s2, borderLeft:`3px solid ${a.col}`,
            display:"flex", gap:11, animation:`fadeUp .4s ease ${i*.07}s both`,
          }}>
            <span style={{ fontSize:18, flexShrink:0, lineHeight:1, marginTop:1 }}>{a.icon}</span>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:C.tx, marginBottom:4 }}>{a.title}</div>
              <div style={{ fontSize:11, color:C.tx2, lineHeight:1.6 }}>{a.body}</div>
              <span style={{ fontSize:11, color:C.ac, cursor:"pointer", marginTop:6, display:"inline-block", fontWeight:500 }}>{a.action}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── CONTENT PERFORMANCE TABLE ─────────────────────────────────── */}
      <div style={{ background:C.s1, border:`1px solid ${C.b1}`, borderRadius:15, overflow:"hidden", marginBottom:22 }}>
        <div style={{ padding:"17px 20px", borderBottom:`1px solid ${C.b1}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:11 }}>
          <div>
            <div style={{ fontFamily:"Syne,sans-serif", fontSize:14, fontWeight:700, color:"#fff" }}>Content Performance</div>
            <div style={{ fontSize:11, color:C.mu, marginTop:3 }}>All posts · Last {days} days · Sorted by reach</div>
          </div>
          <Link href="/schedule" style={{
            display:"inline-flex", alignItems:"center", gap:6, padding:"8px 15px",
            background:`linear-gradient(135deg,${C.ac},${C.ac2})`,
            borderRadius:9, color:"#fff", fontSize:12, fontWeight:600, textDecoration:"none",
          }}>+ Schedule New Post</Link>
        </div>
        {data?.top_posts && data.top_posts.length>0 ? (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:C.s2 }}>
                  {["Post","Platform","Date","Reach","Likes","Comments","Eng. Rate"].map(h=>(
                    <th key={h} style={{ padding:"10px 16px", fontSize:10, textTransform:"uppercase", letterSpacing:"1.2px", color:C.mu, textAlign:"left", fontWeight:600, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.top_posts.map((post,i)=>{
                  const col = ptCol(post.platform)
                  const ico = ptIco(post.platform)
                  const er  = post.reach>0 ? ((post.engagement/post.reach)*100).toFixed(1) : "0.0"
                  return (
                    <tr key={i} style={{ borderTop:`1px solid ${C.b1}`, cursor:"pointer" }}
                      onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,.017)")}
                      onMouseLeave={e=>(e.currentTarget.style.background="")}>
                      <td style={{ padding:"12px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                          <div style={{ width:36, height:36, borderRadius:9, background:`${col}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>{ico}</div>
                          <div style={{ maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:13, fontWeight:500, color:C.tx }}>{post.caption}</div>
                        </div>
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        <span style={{ display:"inline-flex", padding:"3px 9px", borderRadius:20, fontSize:10, fontWeight:600, background:`${col}18`, color:col, textTransform:"capitalize" }}>{post.platform}</span>
                      </td>
                      <td style={{ padding:"12px 16px", fontSize:12, color:C.tx2 }}>{fD(post.published_at)}</td>
                      <td style={{ padding:"12px 16px", fontWeight:600, fontSize:13, color:C.tx }}>{fN(post.reach)}</td>
                      <td style={{ padding:"12px 16px", fontSize:13, color:C.tx2 }}>{post.likes}</td>
                      <td style={{ padding:"12px 16px", fontSize:13, color:C.tx2 }}>{post.comments}</td>
                      <td style={{ padding:"12px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                          <div style={{ width:50, height:3, background:C.s3, borderRadius:99, overflow:"hidden" }}>
                            <div style={{ width:`${Math.min(100,parseFloat(er)*12)}%`, height:"100%", background:C.gr, borderRadius:99 }} />
                          </div>
                          <span style={{ fontSize:12, fontWeight:600, color:C.gr }}>{er}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding:"48px 20px", textAlign:"center", color:C.mu, fontSize:13 }}>
            No post data yet.{" "}
            <Link href="/schedule" style={{ color:C.ac, fontWeight:600 }}>Schedule your first post →</Link>
          </div>
        )}
      </div>

      {/* ── CONNECT CTA (demo only) ───────────────────────────────────── */}
      {data?.isDemo && (
        <div style={{
          background:"linear-gradient(135deg,rgba(108,99,255,.1),rgba(0,212,255,.05))",
          border:`1px dashed rgba(108,99,255,.3)`, borderRadius:15,
          padding:"32px 20px", textAlign:"center", marginBottom:22,
        }}>
          <div style={{ fontSize:30, marginBottom:10 }}>🚀</div>
          <div style={{ fontFamily:"Syne,sans-serif", fontSize:17, fontWeight:700, color:"#fff", marginBottom:6 }}>Apna account connect karo</div>
          <div style={{ fontSize:13, color:C.tx2, maxWidth:380, margin:"0 auto 18px" }}>
            Instagram ya Facebook connect karo aur real reach, engagement aur follower data dekho.
          </div>
          <Link href="/connect" style={{
            display:"inline-flex", alignItems:"center", gap:7, padding:"10px 22px",
            background:`linear-gradient(135deg,${C.ac},${C.ac2})`,
            borderRadius:10, color:"#fff", fontSize:13, fontWeight:600, textDecoration:"none",
          }}>🔗 Connect Account</Link>
        </div>
      )}

      <div style={{ textAlign:"center", fontSize:11, color:C.mu, paddingBottom:8 }}>
        Data refreshes every 6 hours via Meta Graph API &amp; YouTube Analytics
      </div>
    </div>
  )
}
