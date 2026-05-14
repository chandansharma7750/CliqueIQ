"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Bell, Plus, LogOut, Settings, User, ChevronDown } from "lucide-react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

interface TopbarProps {
  title: string
  userEmail?: string
  userAvatar?: string | null
  userName?: string | null
}

export function Topbar({ title, userEmail, userAvatar, userName }: TopbarProps) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : userEmail?.slice(0, 2).toUpperCase() ?? "U"

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-slate-200 bg-white">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>

      <div className="flex items-center gap-3">
        <Button variant="gradient" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Post
        </Button>

        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-violet-600" />
        </button>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 transition-colors">
              {userAvatar ? (
                <img src={userAvatar} alt="avatar" className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
                  {initials}
                </div>
              )}
              <span className="text-sm font-medium text-slate-700 hidden sm:block">
                {userName || userEmail?.split("@")[0] || "Account"}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
              align="end"
              sideOffset={8}
            >
              <div className="px-3 py-2 text-xs text-slate-500 border-b border-slate-100 mb-1">
                {userEmail}
              </div>
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 outline-none"
                onSelect={() => router.push("/settings")}
              >
                <User className="h-4 w-4 text-slate-400" />
                Profile
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 outline-none"
                onSelect={() => router.push("/settings")}
              >
                <Settings className="h-4 w-4 text-slate-400" />
                Settings
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 outline-none"
                onSelect={handleLogout}
                disabled={loggingOut}
              >
                <LogOut className="h-4 w-4" />
                {loggingOut ? "Signing out…" : "Sign out"}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  )
}
