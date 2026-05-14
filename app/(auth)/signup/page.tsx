"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Zap, CheckCircle2 } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { FaFacebook } from "react-icons/fa"

const perks = [
  "14-day free trial, no credit card required",
  "Hindi + English AI caption generator",
  "Indian festival calendar with templates",
  "GST invoice auto-generation",
]

export default function SignupPage() {
  const [googleLoading, setGoogleLoading] = useState(false)
  const [facebookLoading, setFacebookLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  const handleFacebookSignup = async () => {
    setFacebookLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setFacebookLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left panel */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-center px-16 bg-gradient-to-br from-violet-600 to-indigo-700">
        <Link href="/" className="inline-flex items-center gap-2 mb-12">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">CliqueIQ</span>
        </Link>
        <h2 className="text-3xl font-bold text-white mb-4">
          India&apos;s most powerful social media tool
        </h2>
        <p className="text-violet-200 mb-8">
          Join 100+ agencies growing their clients&apos; social presence with CliqueIQ.
        </p>
        <ul className="space-y-4">
          {perks.map((p) => (
            <li key={p} className="flex items-center gap-3 text-white">
              <CheckCircle2 className="h-5 w-5 text-violet-300 flex-shrink-0" />
              <span className="text-sm">{p}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <Link href="/" className="inline-flex items-center gap-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-slate-900">CliqueIQ</span>
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="mt-1 text-sm text-slate-500">Free for 14 days. No credit card.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-3">
            {error && (
              <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
            )}

            <Button
              variant="outline"
              className="w-full gap-3 h-12 text-sm font-medium"
              onClick={handleGoogleSignup}
              disabled={googleLoading || facebookLoading}
            >
              <FcGoogle className="h-5 w-5" />
              {googleLoading ? "Redirecting…" : "Sign up with Google"}
            </Button>

            <Button
              className="w-full gap-3 h-12 text-sm font-medium bg-[#1877F2] hover:bg-[#166FE5] text-white"
              onClick={handleFacebookSignup}
              disabled={googleLoading || facebookLoading}
            >
              <FaFacebook className="h-5 w-5" />
              {facebookLoading ? "Redirecting…" : "Sign up with Facebook"}
            </Button>
          </div>

          <p className="mt-4 text-center text-xs text-slate-500">
            Sign up karne se tum hamare{" "}
            <Link href="#" className="underline">Terms</Link> aur{" "}
            <Link href="#" className="underline">Privacy Policy</Link> se agree karte ho.
          </p>
          <p className="mt-2 text-center text-sm text-slate-500">
            Pehle se account hai?{" "}
            <Link href="/login" className="font-medium text-violet-600 hover:underline">
              Sign in karo
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
