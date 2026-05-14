"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { FaFacebook } from "react-icons/fa"

export default function LoginPage() {
  const [googleLoading, setGoogleLoading] = useState(false)
  const [facebookLoading, setFacebookLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleGoogleLogin = async () => {
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

  const handleFacebookLogin = async () => {
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">CliqueIQ</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-3">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
          )}

          <Button
            variant="outline"
            className="w-full gap-3 h-12 text-sm font-medium"
            onClick={handleGoogleLogin}
            disabled={googleLoading || facebookLoading}
          >
            <FcGoogle className="h-5 w-5" />
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </Button>

          <Button
            className="w-full gap-3 h-12 text-sm font-medium bg-[#1877F2] hover:bg-[#166FE5] text-white"
            onClick={handleFacebookLogin}
            disabled={googleLoading || facebookLoading}
          >
            <FaFacebook className="h-5 w-5" />
            {facebookLoading ? "Redirecting…" : "Continue with Facebook"}
          </Button>
        </div>

        <p className="mt-4 text-center text-sm text-slate-500">
          Account nahi hai?{" "}
          <Link href="/signup" className="font-medium text-violet-600 hover:underline">
            Free trial shuru karo
          </Link>
        </p>
      </div>
    </div>
  )
}
