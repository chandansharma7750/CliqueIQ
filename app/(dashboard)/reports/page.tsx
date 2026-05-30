"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  FileText, Download, Building2, Calendar, BarChart3,
  TrendingUp, Users, Heart, Eye, Loader2
} from "lucide-react"
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube } from "react-icons/fa"

const platformIcon: Record<string, React.ReactNode> = {
  instagram: <FaInstagram className="h-4 w-4" style={{ color: "#e1306c" }} />,
  facebook: <FaFacebook className="h-4 w-4" style={{ color: "#1877f2" }} />,
  linkedin: <FaLinkedin className="h-4 w-4" style={{ color: "#0a66c2" }} />,
  youtube: <FaYoutube className="h-4 w-4" style={{ color: "#ff0000" }} />,
}

const REPORT_TEMPLATES = [
  { id: "monthly", label: "Monthly Summary", desc: "Full month overview — reach, engagement, top posts", icon: Calendar },
  { id: "growth", label: "Growth Report", desc: "Follower & subscriber growth trends", icon: TrendingUp },
  { id: "engagement", label: "Engagement Report", desc: "Likes, comments, shares breakdown", icon: Heart },
]

interface ReportConfig {
  agencyName: string
  clientName: string
  dateRange: string
  template: string
  platforms: string[]
}

export default function ReportsPage() {
  const [config, setConfig] = useState<ReportConfig>({
    agencyName: "",
    clientName: "",
    dateRange: "last_30",
    template: "monthly",
    platforms: ["instagram", "facebook", "youtube", "linkedin"],
  })
  const [generating, setGenerating] = useState(false)
  const [preview, setPreview] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  const togglePlatform = (p: string) => {
    setConfig((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(p)
        ? prev.platforms.filter((x) => x !== p)
        : [...prev.platforms, p],
    }))
  }

  const dateRangeLabel = {
    last_7: "Last 7 Days",
    last_30: "Last 30 Days",
    last_90: "Last 90 Days",
  }[config.dateRange] ?? "Last 30 Days"

  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })

  const generatePDF = async () => {
    setGenerating(true)
    try {
      // Dynamically import jsPDF + html2canvas to keep bundle small
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ])

      setPreview(true)
      // Small delay to let the preview render
      await new Promise((r) => setTimeout(r, 400))

      if (!reportRef.current) return

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      // If content > 1 page, split
      const pageHeight = pdf.internal.pageSize.getHeight()
      let position = 0
      let remaining = pdfHeight

      while (remaining > 0) {
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight)
        remaining -= pageHeight
        position -= pageHeight
        if (remaining > 0) pdf.addPage()
      }

      const fileName = `${config.clientName || "client"}-analytics-report-${new Date().toISOString().slice(0, 10)}.pdf`
      pdf.save(fileName)
    } catch (err) {
      console.error("PDF generation error:", err)
      alert("Could not generate PDF. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">PDF Reports</h2>
        <p className="text-slate-500 mt-1">Generate white-label analytics reports for your clients</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Config panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Agency Branding */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-violet-600" /> Agency Branding
              </CardTitle>
              <CardDescription className="text-xs">Your details — shown in report header</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Agency / Your Name</Label>
                <Input
                  value={config.agencyName}
                  onChange={(e) => setConfig({ ...config, agencyName: e.target.value })}
                  placeholder="My Digital Agency"
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Client Name</Label>
                <Input
                  value={config.clientName}
                  onChange={(e) => setConfig({ ...config, clientName: e.target.value })}
                  placeholder="Brand / Client name"
                  className="mt-1 h-8 text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-violet-600" /> Date Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {[
                  { val: "last_7", label: "Last 7 days" },
                  { val: "last_30", label: "Last 30 days" },
                  { val: "last_90", label: "Last 90 days" },
                ].map((r) => (
                  <label key={r.val} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="dateRange"
                      value={r.val}
                      checked={config.dateRange === r.val}
                      onChange={() => setConfig({ ...config, dateRange: r.val })}
                      className="accent-violet-600"
                    />
                    {r.label}
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Template */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-violet-600" /> Report Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {REPORT_TEMPLATES.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setConfig({ ...config, template: t.id })}
                  className={`cursor-pointer rounded-lg border p-3 transition-all ${
                    config.template === t.id
                      ? "border-violet-300 bg-violet-50"
                      : "border-slate-200 hover:border-violet-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <t.icon className={`h-4 w-4 ${config.template === t.id ? "text-violet-600" : "text-slate-400"}`} />
                    <span className="text-sm font-medium text-slate-900">{t.label}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 ml-6">{t.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Platforms */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-violet-600" /> Include Platforms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["instagram", "facebook", "youtube", "linkedin"].map((p) => (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all capitalize ${
                      config.platforms.includes(p)
                        ? "border-violet-300 bg-violet-100 text-violet-700"
                        : "border-slate-200 text-slate-500 hover:border-violet-200"
                    }`}
                  >
                    {platformIcon[p]}
                    {p}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full gap-2"
            onClick={generatePDF}
            disabled={generating}
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating PDF…</>
            ) : (
              <><Download className="h-4 w-4" /> Download PDF Report</>
            )}
          </Button>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Report Preview</p>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div ref={reportRef} className="p-8 bg-white" style={{ fontFamily: "sans-serif", minHeight: 800 }}>
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-violet-600 pb-5 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">C</span>
                    </div>
                    <span className="font-bold text-slate-800 text-lg">
                      {config.agencyName || "Your Agency Name"}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm">Social Media Analytics Report</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">
                    {config.clientName || "Client Name"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{dateRangeLabel}</p>
                  <p className="text-xs text-slate-400">Generated: {today}</p>
                </div>
              </div>

              {/* KPI Summary */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Performance Summary</h3>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Total Reach", value: "—", icon: Eye, color: "bg-violet-50 text-violet-700" },
                    { label: "Engagements", value: "—", icon: Heart, color: "bg-pink-50 text-pink-700" },
                    { label: "Followers", value: "—", icon: Users, color: "bg-blue-50 text-blue-700" },
                    { label: "Posts", value: "—", icon: FileText, color: "bg-green-50 text-green-700" },
                  ].map((kpi) => (
                    <div key={kpi.label} className={`rounded-lg p-3 ${kpi.color}`}>
                      <kpi.icon className="h-4 w-4 mb-1 opacity-70" />
                      <p className="text-xl font-bold">{kpi.value}</p>
                      <p className="text-xs mt-0.5 opacity-80">{kpi.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platforms */}
              {config.platforms.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Platform Breakdown</h3>
                  <div className="space-y-2">
                    {config.platforms.map((p) => (
                      <div key={p} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                        <div className="flex-shrink-0">{platformIcon[p]}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800 capitalize">{p}</p>
                          <div className="flex gap-4 mt-1">
                            {["Reach", "Engagement", "Followers"].map((m) => (
                              <span key={m} className="text-xs text-slate-400">{m}: <span className="text-slate-600">—</span></span>
                            ))}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">Connected</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Posts */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Top Performing Posts</h3>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                      <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs flex-shrink-0">
                        IMG
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 truncate">Connect your accounts to see top posts here</p>
                        <p className="text-xs text-slate-400 mt-0.5">Reach: — · Likes: — · Comments: —</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Powered by <span className="font-semibold text-violet-600">CliqueIQ</span>
                </p>
                <p className="text-xs text-slate-400">{config.agencyName || "Your Agency"} · {today}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
