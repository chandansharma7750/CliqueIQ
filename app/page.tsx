import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  BarChart3,
  Sparkles,
  MessageCircle,
  FileText,
  CheckCircle2,
  ArrowRight,
  Zap,
  Globe
} from "lucide-react"
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube } from "react-icons/fa"

const features = [
  {
    icon: Calendar,
    title: "Multi-Platform Scheduler",
    desc: "Schedule posts on Instagram, Facebook, LinkedIn & YouTube with a beautiful drag-and-drop calendar.",
    color: "bg-violet-100 text-violet-700",
  },
  {
    icon: BarChart3,
    title: "Unified Analytics",
    desc: "Cross-platform performance dashboard with reach, engagement, and follower growth in one view.",
    color: "bg-blue-100 text-blue-700",
  },
  {
    icon: Sparkles,
    title: "Hindi + English AI Captions",
    desc: "GPT-4o powered caption generator with Hinglish, Professional, Casual, and Festive tones.",
    color: "bg-amber-100 text-amber-700",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Analytics",
    desc: "Track broadcast open rates, reply rates, and link clicks — no other tool does this.",
    color: "bg-green-100 text-green-700",
  },
  {
    icon: Calendar,
    title: "Indian Festival Calendar",
    desc: "200+ pre-loaded events — Diwali, IPL, Budget Day, Eid — with ready-made templates.",
    color: "bg-orange-100 text-orange-700",
  },
  {
    icon: FileText,
    title: "White-Label PDF Reports",
    desc: "Auto-generate GST-compliant reports with your agency logo — impress clients instantly.",
    color: "bg-rose-100 text-rose-700",
  },
]

const plans = [
  {
    name: "Starter",
    price: "₹799",
    period: "/month",
    desc: "For freelancers & solo creators",
    features: ["5 social accounts", "100 posts/month", "Basic analytics", "2 AI captions/day"],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "₹1,999",
    period: "/month",
    desc: "For growing agencies",
    features: ["20 social accounts", "Unlimited scheduling", "Full analytics + PDF reports", "Unlimited AI captions", "Festival calendar", "WhatsApp analytics", "3 users"],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Agency",
    price: "₹4,999",
    period: "/month",
    desc: "For large agencies",
    features: ["Unlimited accounts", "Competitor spy tool", "Viral score predictor", "WhatsApp analytics (5 numbers)", "Team collaboration", "Priority support", "10 users"],
    cta: "Start Free Trial",
    highlighted: false,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">CliqueIQ</span>
              <Badge variant="secondary" className="ml-1 text-xs">Beta</Badge>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button variant="gradient" size="sm">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-white to-white pt-20 pb-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <Badge variant="outline" className="mb-4 border-violet-200 text-violet-700">
            🇮🇳 India-first Social Media Tool
          </Badge>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            Grow your brand on <br />
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              every platform
            </span>
          </h1>
          <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto">
            Schedule posts, analyze performance, generate Hindi AI captions, and track WhatsApp campaigns — all in one platform built for Indian agencies.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button variant="gradient" size="lg" className="gap-2">
                Start 14-Day Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <p className="text-sm text-slate-500">No credit card required</p>
          </div>
          {/* Platform logos */}
          <div className="mt-12 flex items-center justify-center gap-8 opacity-60">
            <FaInstagram className="h-7 w-7 text-[#e1306c]" />
            <FaFacebook className="h-7 w-7 text-[#1877f2]" />
            <FaLinkedin className="h-7 w-7 text-[#0a66c2]" />
            <FaYoutube className="h-7 w-7 text-[#ff0000]" />
            <MessageCircle className="h-7 w-7 text-[#25d366]" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-100 bg-slate-50 py-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: "1/4th price", label: "vs Hootsuite" },
              { val: "Hindi AI", label: "Caption Generator" },
              { val: "200+", label: "Indian Festivals" },
              { val: "14-day", label: "Free Trial" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-violet-600">{s.val}</div>
                <div className="text-sm text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Everything Indian agencies need</h2>
            <p className="mt-3 text-slate-500">Built for India. Priced for India. Designed for growth.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-slate-100 p-6 bg-white hover:shadow-md transition-shadow">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${f.color} mb-4`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USP Banner */}
      <section className="py-12 bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="mx-auto max-w-3xl px-4 text-center text-white">
          <Globe className="h-8 w-8 mx-auto mb-3 opacity-80" />
          <h2 className="text-2xl font-bold">The only tool with WhatsApp Analytics</h2>
          <p className="mt-2 opacity-90">500M+ Indians use WhatsApp. Track your broadcast open rates, reply rates, and campaign ROI — no other tool does this.</p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Simple, honest pricing</h2>
            <p className="mt-3 text-slate-500">20% off on annual plans. GST invoice included.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 ${
                  plan.highlighted
                    ? "bg-gradient-to-b from-violet-600 to-indigo-700 text-white shadow-2xl scale-105"
                    : "border border-slate-200 bg-white"
                }`}
              >
                {plan.highlighted && (
                  <Badge className="mb-3 bg-white/20 text-white border-0">Most Popular</Badge>
                )}
                <div className="font-semibold text-lg">{plan.name}</div>
                <div className={`mt-2 text-sm ${plan.highlighted ? "text-violet-200" : "text-slate-500"}`}>{plan.desc}</div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={`text-sm ${plan.highlighted ? "text-violet-200" : "text-slate-500"}`}>{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${plan.highlighted ? "text-violet-200" : "text-violet-600"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block mt-8">
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "outline" : "default"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-violet-600 to-indigo-600">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="font-semibold text-slate-700">CliqueIQ</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 CliqueIQ. Made with ❤️ in India. GST No. will be added.</p>
        </div>
      </footer>
    </div>
  )
}
