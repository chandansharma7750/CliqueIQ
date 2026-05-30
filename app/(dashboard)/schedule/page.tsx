"use client"

import { useState, useEffect, useCallback } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ImageIcon,
  X,
  Clock,
  Sparkles,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube } from "react-icons/fa"
import * as Dialog from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { BulkUploadModal } from "@/components/schedule/BulkUploadModal"

type PlatformKey = "instagram" | "facebook" | "linkedin" | "youtube"

interface ScheduledPost {
  id: string
  platform: PlatformKey
  caption: string
  scheduled_at: string
  status: "scheduled" | "published" | "failed" | "draft"
  image_url?: string | null
}

const platforms: { key: PlatformKey; label: string; icon: React.ReactNode; color: string }[] = [
  { key: "instagram", label: "Instagram", icon: <FaInstagram className="h-4 w-4" />, color: "#e1306c" },
  { key: "facebook",  label: "Facebook",  icon: <FaFacebook  className="h-4 w-4" />, color: "#1877f2" },
  { key: "linkedin",  label: "LinkedIn",  icon: <FaLinkedin  className="h-4 w-4" />, color: "#0a66c2" },
  { key: "youtube",   label: "YouTube",   icon: <FaYoutube   className="h-4 w-4" />, color: "#ff0000" },
]

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth]     = useState(new Date())
  const [selectedDate, setSelectedDate]     = useState<Date | null>(null)
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [caption, setCaption]               = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformKey[]>([])
  const [scheduleTime, setScheduleTime]     = useState("10:00")
  const [posts, setPosts]                   = useState<ScheduledPost[]>([])
  const [isSubmitting, setIsSubmitting]     = useState(false)
  const [isLoading, setIsLoading]           = useState(true)
  const [toast, setToast]                   = useState<{ type: "success" | "error"; msg: string } | null>(null)

  const monthKey = format(currentMonth, "yyyy-MM")

  // ── Fetch posts for current month ─────────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/posts?month=${monthKey}`)
      const data = await res.json()
      setPosts(data.posts || [])
    } catch {
      showToast("error", "Failed to load scheduled posts")
    } finally {
      setIsLoading(false)
    }
  }, [monthKey])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Calendar helpers ───────────────────────────────────────────────────────
  const monthStart  = startOfMonth(currentMonth)
  const monthEnd    = endOfMonth(currentMonth)
  const days        = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad    = monthStart.getDay()
  const paddedDays  = [...Array(startPad).fill(null), ...days]

  const getPostsForDay = (date: Date) =>
    posts.filter((p) => isSameDay(new Date(p.scheduled_at), date))

  // ── Handlers ──────────────────────────────────────────────────────────────
  const togglePlatform = (key: PlatformKey) =>
    setSelectedPlatforms((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    )

  const openComposer = (date?: Date) => {
    if (date) setSelectedDate(date)
    setIsComposerOpen(true)
  }

  const handleSchedulePost = async (asDraft = false) => {
    if (!selectedDate || selectedPlatforms.length === 0) return
    setIsSubmitting(true)
    try {
      // Build ISO timestamp from selected date + time
      const [h, m] = scheduleTime.split(":").map(Number)
      const dt = new Date(selectedDate)
      dt.setHours(h, m, 0, 0)

      // Create one post per platform
      await Promise.all(
        selectedPlatforms.map((platform) =>
          fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              platform,
              caption,
              scheduled_at: dt.toISOString(),
              status: asDraft ? "draft" : "scheduled",
            }),
          })
        )
      )
      setCaption("")
      setSelectedPlatforms([])
      setScheduleTime("10:00")
      setIsComposerOpen(false)
      showToast("success", asDraft ? "Saved as draft" : "Post scheduled!")
      fetchPosts()
    } catch {
      showToast("error", "Failed to schedule post. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePost = async (id: string) => {
    try {
      await fetch(`/api/posts?id=${id}`, { method: "DELETE" })
      setPosts((prev) => prev.filter((p) => p.id !== id))
      showToast("success", "Post deleted")
    } catch {
      showToast("error", "Failed to delete post")
    }
  }

  return (
    <div className="space-y-6 max-w-7xl">

      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg text-sm font-medium animate-in slide-in-from-top-2",
          toast.type === "success"
            ? "bg-green-50 border border-green-200 text-green-800"
            : "bg-red-50 border border-red-200 text-red-800"
        )}>
          {toast.type === "success"
            ? <CheckCircle className="h-4 w-4 text-green-600" />
            : <AlertCircle className="h-4 w-4 text-red-600" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Content Calendar</h2>
          <p className="text-slate-500 mt-1">Plan and schedule your social media content</p>
        </div>
        <div className="flex items-center gap-2">
          <BulkUploadModal onUploaded={fetchPosts} />
          <Button className="gap-2 bg-violet-600 hover:bg-violet-700 text-white" onClick={() => openComposer()}>
            <Plus className="h-4 w-4" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{format(currentMonth, "MMMM yyyy")}</CardTitle>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="min-h-[90px] rounded-lg bg-slate-50 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {paddedDays.map((day, idx) => {
                if (!day) return <div key={idx} />
                const dayPosts  = getPostsForDay(day)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isCurrent  = isToday(day)
                const inMonth    = isSameMonth(day, currentMonth)

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => { setSelectedDate(day); openComposer(day) }}
                    className={cn(
                      "min-h-[90px] rounded-lg p-2 cursor-pointer border transition-all hover:border-violet-300 hover:bg-violet-50/50",
                      isSelected ? "border-violet-400 bg-violet-50" : "border-transparent",
                      !inMonth && "opacity-40",
                    )}
                  >
                    <div className={cn(
                      "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1",
                      isCurrent ? "bg-violet-600 text-white" : "text-slate-700"
                    )}>
                      {format(day, "d")}
                    </div>
                    <div className="space-y-0.5">
                      {dayPosts.slice(0, 3).map((post, i) => {
                        const platform = platforms.find((p) => p.key === post.platform)
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-1 rounded px-1 py-0.5 text-xs truncate"
                            style={{ backgroundColor: platform?.color + "15", color: platform?.color }}
                          >
                            {platform?.icon}
                            <span className="truncate">
                              {post.caption ? post.caption.slice(0, 14) + "…" : post.platform}
                            </span>
                          </div>
                        )
                      })}
                      {dayPosts.length > 3 && (
                        <span className="text-xs text-slate-400">+{dayPosts.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Legend */}
      <div className="flex items-center gap-4">
        <span className="text-xs text-slate-500 font-medium">Platforms:</span>
        {platforms.map((p) => (
          <div key={p.key} className="flex items-center gap-1.5 text-xs text-slate-600">
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: p.color }} />
            {p.label}
          </div>
        ))}
      </div>

      {/* Upcoming posts list */}
      {posts.filter((p) => p.status !== "draft").length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-700">Upcoming Scheduled Posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {posts
              .filter((p) => p.status !== "draft")
              .slice(0, 8)
              .map((post) => {
                const plt = platforms.find((p) => p.key === post.platform)
                return (
                  <div key={post.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 bg-slate-50">
                    <div className="text-xs text-slate-500 w-28 shrink-0 font-medium">
                      {format(new Date(post.scheduled_at), "d MMM · h:mm a")}
                    </div>
                    <div
                      className="flex items-center gap-1.5 text-xs font-medium rounded-full px-2 py-0.5 shrink-0"
                      style={{ color: plt?.color, backgroundColor: (plt?.color ?? "#999") + "15" }}
                    >
                      {plt?.icon}
                      {plt?.label}
                    </div>
                    <p className="text-xs text-slate-700 flex-1 truncate">
                      {post.caption || "(no caption)"}
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id) }}
                      className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })}
          </CardContent>
        </Card>
      )}

      {/* Post Composer Modal */}
      <Dialog.Root open={isComposerOpen} onOpenChange={setIsComposerOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl p-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <Dialog.Title className="font-semibold text-slate-900">
                {selectedDate ? `Schedule for ${format(selectedDate, "d MMM yyyy")}` : "Create Post"}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Platform selector */}
              <div>
                <Label>Platforms</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {platforms.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => togglePlatform(p.key)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
                        selectedPlatforms.includes(p.key)
                          ? "border-2 shadow-sm"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      )}
                      style={
                        selectedPlatforms.includes(p.key)
                          ? { borderColor: p.color, color: p.color, backgroundColor: p.color + "10" }
                          : {}
                      }
                    >
                      {p.icon}
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Caption</Label>
                  <button className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700">
                    <Sparkles className="h-3 w-3" />
                    Generate with AI
                  </button>
                </div>
                <Textarea
                  placeholder="Write your caption here… or use AI to generate one in Hindi, English, or Hinglish."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="min-h-[120px]"
                />
                <div className="flex justify-end mt-1">
                  <span className={cn("text-xs", caption.length > 2200 ? "text-red-500" : "text-slate-400")}>
                    {caption.length} / 2,200
                  </span>
                </div>
              </div>

              {/* Media upload (UI only — storage wiring is Phase 2) */}
              <div>
                <Label>Media</Label>
                <div className="mt-2 flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-6 hover:border-violet-300 hover:bg-violet-50/30 transition-colors cursor-pointer">
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Click to upload or drag & drop</p>
                    <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, MP4 up to 100MB</p>
                  </div>
                </div>
              </div>

              {/* Schedule time */}
              <div>
                <Label htmlFor="time">Schedule Time</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <Input
                    id="time"
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-36"
                  />
                  <span className="text-sm text-slate-500">IST</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
              <Button variant="ghost" onClick={() => setIsComposerOpen(false)}>Cancel</Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSchedulePost(true)}
                  disabled={isSubmitting || selectedPlatforms.length === 0}
                >
                  Save as Draft
                </Button>
                <Button
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                  onClick={() => handleSchedulePost(false)}
                  disabled={selectedPlatforms.length === 0 || isSubmitting}
                >
                  {isSubmitting ? "Scheduling…" : "Schedule Post"}
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
