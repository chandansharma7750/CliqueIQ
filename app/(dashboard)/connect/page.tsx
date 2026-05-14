"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Loader2,
  Trash2,
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
  comingSoon?: boolean
}

const initialPlatforms: Platform[] = [
  {
    id: "instagram",
    name: "Instagram",
    icon: <FaInstagram className="h-6 w-6" />,
    color: "#e1306c",
    bgColor: "#fdf2f8",
    description: "Schedule posts, Stories, and Reels. Track reach and engagement.",
    status: "disconnected",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: <FaFacebook className="h-6 w-6" />,
    color: "#1877f2",
    bgColor: "#eff6ff",
    description: "Post to Pages and Groups. Track impressions and reactions.",
    status: "disconnected",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: <FaLinkedin className="h-6 w-6" />,
    color: "#0a66c2",
    bgColor: "#eff6ff",
    description: "Share professional content to your Company Page or Profile.",
    status: "disconnected",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: <FaYoutube className="h-6 w-6" />,
    color: "#ff0000",
    bgColor: "#fff1f2",
    description: "Schedule video uploads and track views, watch time, and subscribers.",
    status: "disconnected",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    icon: <MessageCircle className="h-6 w-6" />,
    color: "#25d366",
    bgColor: "#f0fdf4",
    description: "Track broadcast campaigns, open rates, and reply rates. India's biggest USP.",
    status: "disconnected",
    comingSoon: true,
  },
]

const OAUTH_URLS: Record<string, string> = {
  instagram: `/api/auth/meta/connect?platform=instagram`,
  facebook: `/api/auth/meta/connect?platform=facebook`,
  linkedin: `/api/auth/linkedin/connect`,
  youtube: `/api/auth/youtube/connect`,
}

export default function ConnectPage() {
  const [platforms, setPlatforms] = useState<Platform[]>(initialPlatforms)

  const handleConnect = async (platformId: string) => {
    if (platformId === "whatsapp") return

    setPlatforms((prev) =>
      prev.map((p) => (p.id === platformId ? { ...p, status: "connecting" } : p))
    )

    // Redirect to OAuth URL
    window.location.href = OAUTH_URLS[platformId] ?? "#"
  }

  const handleDisconnect = async (platformId: string) => {
    // In production: call API to revoke token
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === platformId ? { ...p, status: "disconnected", accountName: undefined } : p
      )
    )
  }

  const connectedCount = platforms.filter((p) => p.status === "connected").length

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Connect Accounts</h2>
        <p className="text-slate-500 mt-1">
          Link your social media accounts to start scheduling and tracking.
        </p>
      </div>

      {/* Connection summary */}
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
          connectedCount > 0 ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"
        )}>
          {connectedCount}
        </div>
        <div>
          <p className="font-medium text-slate-900">
            {connectedCount === 0 ? "No accounts connected yet" : `${connectedCount} account${connectedCount > 1 ? "s" : ""} connected`}
          </p>
          <p className="text-sm text-slate-500">
            {connectedCount === 0
              ? "Connect at least one account to start scheduling posts."
              : "Your accounts are ready for scheduling."}
          </p>
        </div>
      </div>

      {/* Meta API note */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Meta App Review Required</p>
          <p className="text-xs text-amber-600 mt-1">
            Instagram and Facebook connections require a Meta Developer App with approved permissions.
            Apply at <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="underline">developers.facebook.com</a> — approval takes 2–4 weeks.
            In the meantime, you can test with a developer account.
          </p>
        </div>
      </div>

      {/* Platform cards */}
      <div className="space-y-3">
        {platforms.map((platform) => (
          <Card key={platform.id} className="overflow-hidden">
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
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{platform.name}</h3>
                    {platform.comingSoon && (
                      <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                    )}
                    {platform.status === "connected" && (
                      <Badge variant="success" className="text-xs gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Connected
                      </Badge>
                    )}
                    {platform.status === "error" && (
                      <Badge variant="destructive" className="text-xs">Error</Badge>
                    )}
                  </div>
                  {platform.accountName && (
                    <p className="text-sm font-medium text-violet-600">@{platform.accountName}</p>
                  )}
                  <p className="text-sm text-slate-500 mt-0.5">{platform.description}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {platform.status === "connected" ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                        onClick={() => handleDisconnect(platform.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Disconnect
                      </Button>
                    </>
                  ) : platform.status === "connecting" ? (
                    <Button disabled size="sm" className="gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting…
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant={platform.comingSoon ? "secondary" : "outline"}
                      disabled={platform.comingSoon}
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

      {/* Help */}
      <Card className="border-violet-100 bg-violet-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Need help connecting?</CardTitle>
          <CardDescription className="text-xs">
            Follow these steps to get your Meta App approved and connect Instagram + Facebook.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs text-slate-600 space-y-2">
          <p>1. Go to <a href="https://developers.facebook.com" className="text-violet-600 underline" target="_blank">developers.facebook.com</a> and create an app (Business type).</p>
          <p>2. Add <strong>Instagram Basic Display</strong> and <strong>Facebook Login</strong> products.</p>
          <p>3. Set redirect URI to: <code className="bg-white rounded px-1 py-0.5">{typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/api/auth/meta/callback</code></p>
          <p>4. Add your <code className="bg-white rounded px-1 py-0.5">META_APP_ID</code> and <code className="bg-white rounded px-1 py-0.5">META_APP_SECRET</code> to <code className="bg-white rounded px-1 py-0.5">.env.local</code>.</p>
          <p>5. Submit for App Review to get production access.</p>
        </CardContent>
      </Card>
    </div>
  )
}
