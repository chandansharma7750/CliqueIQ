"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap, Mail } from "lucide-react"
import { FcGoogle } from "react-icons/fc"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [sent, setSent] = useState(false)
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

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
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

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {/* Google OAuth */}
          <Button
            variant="outline"
            className="w-full gap-3 h-11"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            <FcGoogle className="h-5 w-5" />
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-slate-400">ya email se login karo</span>
            </div>
          </div>

          {/* Magic Link */}
          {sent ? (
            <div className="text-center py-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 mx-auto mb-3">
                <Mail className="h-5 w-5 text-violet-600" />
              </div>
              <p className="text-sm font-semibold text-slate-900">Check your inbox!</p>
              <p className="text-xs text-slate-500 mt-1">
                Magic link bheja hai <strong>{email}</strong> pe
              </p>
              <button onClick={() => setSent(false)} className="mt-3 text-xs text-violet-600 hover:underline">
                Dobara try karo
              </button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@agency.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading || !email}>
                {loading ? "Sending…" : "Send Magic Link"}
              </Button>
            </form>
          )}
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
