"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle, CheckCircle2, ExternalLink,
  AlertCircle, Loader2, Trash2, RefreshCw,
} from "lucide-react"
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube } from "react-icons/fa"
import { cn } from "@/lib/utils"

type ConnectionStatus = "connected" | "disconnected" | "connecting" | "error"

interface Platform {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  bgColor: string
  description: string
  status: ConnectionStatus
  accountName?: string
  accountHandle?: string
  comingSoon?: boolean
}

const PLATFORM_META: Omit<Platform, "status" | "accountName" | "accountHandle">[] = [
  { id: "instagram", name: "Instagram", icon: <FaInstagram className="h-6 w-6" />, color: "#e1306c", bgColor: "#fdf2f8", description: "Schedule posts, Stories, and Reels. Track reach and engagement." },
  { id: "facebook", name: "Facebook", icon: <FaFacebook className="h-6 w-6" />, color: "#1877f2", bgColor: "#eff6ff", description: "Post to Pages and Groups. Track impressions and reactions." },
  { id: "youtube", name: "YouTube", icon: <FaYoutube className="h-6 w-6" />, color: "#ff0000", bgColor: "#fff1f2", description: "Connect your channel to track subscribers, views, and video count." },
  { id: "linkedin", name: "LinkedIn", icon: <FaLinkedin className="h-6 w-6" />, color: "#0a66c2", bgColor: "#eff6ff", description: "Share professional content to your Company Page or Profile.", comingSoon: true },
  { id: "whatsapp", name: "WhatsApp Business", icon: <MessageCircle className="h-6 w-6" />, color: "#25d366", bgColor: "#f0fdf4", description: "Track broadcast campaigns, open rates, and reply rates — India's biggest USP.", comingSoon: true },
]

const OAUTH_URLS: Record<string, string> = {
  instagram: `/api/auth/meta/connect?platform=instagram`,
  facebook: `/api/auth/meta/connect?platform=facebook`,
  youtube: `/api/auth/youtube/connect`,
}

export default function ConnectPage() {
  const searchParams = useSearchParams()
  const [platforms, setPlatforms] = useState<Platform[]>(
    PLATFORM_META.map((p) => ({ ...p, status: "disconnected" }))
  )
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  const fetchConnectedAccounts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/social-accounts")
      const { accounts } = await res.json()

      setPlatforms(
        PLATFORM_META.map((meta) => {
          const connected = accounts?.find(
            (a: { platform: string; account_name: string; account_handle: string }) =>
              a.platform === meta.id
          )
          return {
            ...meta,
            status: (connected ? "connected" : "disconnected") as ConnectionStatus,
            accountName: connected?.account_name,
            accountHandle: connected?.account_handle,
          }
        })
      )
    } catch {
      // keep defaults on error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConnectedAccounts()
  }, [fetchConnectedAccounts])

  // Handle OAuth callback result (?success=youtube / ?error=youtube_denied)
  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")
    if (success) {
      const name = success.charAt(0).toUpperCase() + success.slice(1)
      setToast({ type: "success", msg: `${name} connected successfully! 🎉` })
      fetchConnectedAccounts()
      setTimeout(() => setToast(null), 5000)
    } else if (error) {
      const msgs: Record<string, string> = {
        youtube_denied: "YouTube connection was cancelled.",
        youtube_failed: "YouTube connection failed. Please try again.",
        google_not_configured: "Google credentials not set up. Contact support.",
        no_youtube_channel: "No YouTube channel found on this Google account.",
      }
      setToast({ type: "error", msg: msgs[error] ?? `Connection error: ${error}` })
      setTimeout(() => setToast(null), 5000)
    }
  }, [searchParams, fetchConnectedAccounts])

  const handleConnect = (platformId: string) => {
    if (!OAUTH_URLS[platformId]) return
    setPlatforms((prev) =>
      prev.map((p) => (p.id === platformId ? { ...p, status: "connecting" } : p))
    )
    window.location.href = OAUTH_URLS[platformId]
  }

  const handleDisconnect = async (platformId: string) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === platformId
          ? { ...p, status: "disconnected", accountName: undefined, accountHandle: undefined }
          : p
      )
    )
  }

  const connectedCount = platforms.filter((p) => p.status === "connected").length

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Connect Accounts</h2>
          <p className="text-slate-500 mt-1">
            Link your social media accounts to start scheduling and tracking.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchConnectedAccounts}
          className="gap-2 text-slate-500"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border p-4 text-sm font-medium",
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          {toast.msg}
        </div>
      )}

      {/* Connection summary */}
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
            connectedCount > 0 ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"
          )}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : connectedCount}
        </div>
        <div>
          <p className="font-medium text-slate-900">
            {loading
              ? "Checking connections…"
              : connectedCount === 0
              ? "No accounts connected yet"
              : `${connectedCount} account${connectedCount > 1 ? "s" : ""} connected`}
          </p>
          <p className="text-sm text-slate-500">
            {connectedCount === 0
              ? "Connect at least one account to start scheduling posts."
              : "Your accounts are ready for scheduling and analytics."}
          </p>
        </div>
      </div>

      {/* Meta API note */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">
            Meta App Review Required for Instagram &amp; Facebook
          </p>
          <p className="text-xs text-amber-600 mt-1">
            Apply at{" "}
            <a
              href="https://developers.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              developers.facebook.com
            </a>{" "}
            — approval takes 2–4 weeks. <strong>YouTube works right now</strong> — just click Connect.
          </p>
        </div>
      </div>

      {/* Platform cards */}
      <div className="space-y-3">
        {platforms.map((platform) => (
          <Card
            key={platform.id}
            className={cn(
              "overflow-hidden transition-all",
              platform.status === "connected" && "border-green-200 bg-green-50/20"
            )}
          >
            <CardContent className="p-0">
              <div className="flex items-center gap-4 p-5">
                {/* Icon */}
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: platform.bgColor, color: platform.color }}
                >
                  {platform.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900">{platform.name}</h3>
                    {platform.comingSoon && (
                      <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                    )}
                    {platform.status === "connected" && (
                      <Badge className="text-xs gap-1 bg-green-100 text-green-700 border border-green-200">
                        <CheckCircle2 className="h-3 w-3" />
                        Connected
                      </Badge>
                    )}
                    {platform.status === "error" && (
                      <Badge variant="destructive" className="text-xs">Error</Badge>
                    )}
                  </div>
                  {platform.status === "connected" && platform.accountName && (
                    <p className="text-sm font-medium text-violet-600 mt-0.5">
                      {platform.accountHandle
                        ? `@${platform.accountHandle}`
                        : platform.accountName}
                    </p>
                  )}
                  <p className="text-sm text-slate-500 mt-0.5">{platform.description}</p>
                </div>

                {/* Action */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {platform.status === "connected" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                      onClick={() => handleDisconnect(platform.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Disconnect
                    </Button>
                  ) : platform.status === "connecting" ? (
                    <Button disabled size="sm" className="gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting…
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant={platform.comingSoon ? "secondary" : "outline"}
                      disabled={!!platform.comingSoon}
                      onClick={() => handleConnect(platform.id)}
                      className="gap-2"
                    >
                      {platform.comingSoon ? (
                        "Coming Soon"
                      ) : (
                        <>
                          <ExternalLink className="h-3 w-3" />
                          Connect
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Help card */}
      <Card className="border-violet-100 bg-violet-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Connect YouTube (Ready Now)</CardTitle>
          <CardDescription className="text-xs">
            No Meta review needed — connect your YouTube channel instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs text-slate-600 space-y-1">
          <p>1. Click <strong>Connect</strong> next to YouTube above.</p>
          <p>2. Sign in with your Google account and allow access.</p>
          <p>3. Your channel stats (subscribers, views, videos) appear in Analytics.</p>
        </CardContent>
      </Card>
    </div>
  )
}
