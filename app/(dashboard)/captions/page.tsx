"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Copy, RefreshCw, Check } from "lucide-react"
import * as Select from "@radix-ui/react-select"
import { cn } from "@/lib/utils"

type Tone = "professional" | "casual" | "hinglish" | "festive"

const tones: { value: Tone; label: string; desc: string; emoji: string }[] = [
  { value: "professional", label: "Professional", desc: "Formal, business-appropriate", emoji: "💼" },
  { value: "casual", label: "Casual", desc: "Friendly, conversational", emoji: "😊" },
  { value: "hinglish", label: "Hinglish", desc: "Hindi + English mix", emoji: "🇮🇳" },
  { value: "festive", label: "Festive", desc: "Celebratory, seasonal", emoji: "🎉" },
]

const platforms = ["Instagram", "Facebook", "LinkedIn", "YouTube"]

const exampleOutputs: Record<Tone, string[]> = {
  professional: [
    "We are thrilled to announce our latest product launch — crafted with precision and designed to elevate your everyday experience. Discover the difference today. 🚀\n\n#Innovation #ProductLaunch #Quality",
    "Excellence is not an accident — it's a commitment. We're proud to share our newest offering, built for those who demand the best. Learn more in the link below.\n\n#BusinessGrowth #Leadership #Excellence",
    "Transforming the way you work, one step at a time. Our new solution is here to make your business more efficient and impactful. Let's build something great together.\n\n#B2B #Solutions #Productivity",
  ],
  casual: [
    "Guess what? 🎉 We just dropped something really exciting and you're going to LOVE it! Tap the link to check it out — trust us, you don't want to miss this! 🙌\n\n#NewDrop #MustHave #Excited",
    "Hey everyone! Quick question — have you tried our new product yet? We've been getting amazing feedback and honestly we're lowkey obsessed 😍 Let us know your thoughts!\n\n#Community #Feedback #Loving",
    "Hot take: this might just be the most useful thing we've ever made. 🔥 Seriously though, we put SO much work into this and we can't wait for you to experience it!\n\n#BehindTheScenes #Launched #Proud",
  ],
  hinglish: [
    "Yaar, kuch toh naya hona chahiye na? 😄 Toh hum leke aaye hain aapke liye ek zabardast cheez! Ekdum fresh, ekdum dhamakedar! Link in bio mein check karo! 🔥\n\n#NavinShuruat #NayaSaal #IndiaFirst",
    "Bhai, sach mein ek baar try karo — guarantee hai ki pasand aayega! ❤️ Humare customers pehle se hi deewane ho rahe hain, ab tumhari baari hai!\n\n#Zabardast #TrustKaro #DesiVibes",
    "Zindagi badi hai, toh kyun na kuch bada try karein? 🚀 Presenting something that'll make your everyday life thoda aur easy aur exciting! Ab der kyun? Dekho toh sahi!\n\n#LifeHacks #Hinglish #Startup",
  ],
  festive: [
    "🪔 इस दिवाली, रोशनी फैलाएं खुशियों की! Wishing you and your family a joyful and prosperous Diwali filled with love, laughter, and sweet moments. From all of us at [Brand Name] ✨\n\n#HappyDiwali #Diwali2026 #FestiveVibes",
    "🎊 Eid Mubarak! May this auspicious occasion bring peace, joy, and new beginnings to you and your loved ones. Celebrate togetherness this Eid! From our family to yours. 💫\n\n#EidMubarak #Eid2026 #Celebration",
    "🏏 IPL season is HERE and the excitement is REAL! Who's your team this year? Drop a 🙌 if you're cheering for the same team as us! Let the games begin!\n\n#IPL2026 #CricketFever #India",
  ],
}

export default function CaptionsPage() {
  const [topic, setTopic] = useState("")
  const [tone, setTone] = useState<Tone>("casual")
  const [platform, setPlatform] = useState("Instagram")
  const [variations, setVariations] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const handleGenerate = async () => {
    if (!topic) return
    setLoading(true)
    try {
      const res = await fetch("/api/captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone, platform }),
      })
      const data = await res.json()
      if (data.captions && Array.isArray(data.captions)) {
        setVariations(data.captions)
      } else {
        // fallback to examples if API fails
        setVariations(exampleOutputs[tone])
      }
    } catch {
      setVariations(exampleOutputs[tone])
    }
    setLoading(false)
  }

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">AI Caption Generator</h2>
        <p className="text-slate-500 mt-1">Generate engaging captions in Hindi, English, or Hinglish</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input panel */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Generate Captions</CardTitle>
            <CardDescription>Powered by Gemini 1.5 Flash ✨</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>What&apos;s your post about?</Label>
              <Textarea
                placeholder="E.g. New product launch, Diwali offer, client success story…"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1 min-h-[100px]"
              />
            </div>

            <div>
              <Label>Tone</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {tones.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border p-2.5 text-left text-sm transition-all",
                      tone === t.value
                        ? "border-violet-400 bg-violet-50 text-violet-800"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    )}
                  >
                    <span>{t.emoji}</span>
                    <div>
                      <div className="font-medium text-xs">{t.label}</div>
                      <div className="text-xs opacity-70">{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Platform</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {platforms.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                      platform === p
                        ? "border-violet-400 bg-violet-50 text-violet-700"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="gradient"
              className="w-full gap-2"
              onClick={handleGenerate}
              disabled={loading || !topic}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate 3 Variations
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output panel */}
        <div className="lg:col-span-3 space-y-4">
          {variations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center rounded-xl border-2 border-dashed border-slate-200 p-8">
              <Sparkles className="h-10 w-10 text-violet-300 mb-3" />
              <p className="text-slate-600 font-medium">Your captions will appear here</p>
              <p className="text-sm text-slate-400 mt-1">Fill in the topic and hit Generate</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">3 variations generated</p>
                <Button variant="ghost" size="sm" className="gap-2 text-xs" onClick={handleGenerate}>
                  <RefreshCw className="h-3 w-3" />
                  Regenerate
                </Button>
              </div>
              {variations.map((v, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <Badge variant="secondary" className="mb-2 text-xs">Variation {idx + 1}</Badge>
                        <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{v}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(v, idx)}
                        className="flex-shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 transition-colors"
                      >
                        {copiedIdx === idx ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-400">{v.length} chars</span>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                        Use in Post
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
