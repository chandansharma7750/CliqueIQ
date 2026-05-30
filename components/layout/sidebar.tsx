"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Sparkles,
  CalendarDays,
  FileText,
  CreditCard,
  Settings,
  Link2,
  Zap,
  MessageCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/captions", label: "AI Captions", icon: Sparkles },
  { href: "/calendar", label: "Festival Calendar", icon: CalendarDays },
  { href: "/connect", label: "Connect Accounts", icon: Link2 },
  { href: "/reports", label: "PDF Reports", icon: FileText },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
]

const comingSoon = [
  { href: "/whatsapp", label: "WhatsApp Analytics", icon: MessageCircle, badge: "Soon" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col w-64 h-full border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-slate-900">CliqueIQ</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-violet-50 text-violet-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-violet-600" : "text-slate-400")} />
              {item.label}
            </Link>
          )
        })}

        <div className="pt-4 pb-1 px-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Coming Soon</p>
        </div>
        {comingSoon.map((item) => (
          <div
            key={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 cursor-not-allowed"
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {item.label}
            <Badge variant="secondary" className="ml-auto text-xs py-0">{item.badge}</Badge>
          </div>
        ))}
      </nav>

      {/* Trial Banner */}
      <div className="p-4 border-t border-slate-100">
        <div className="rounded-lg bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 p-3">
          <p className="text-xs font-semibold text-violet-800">14-day free trial</p>
          <p className="text-xs text-violet-600 mt-0.5">Upgrade to unlock all features</p>
          <Link href="/billing">
            <button className="mt-2 w-full rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700 transition-colors">
              Upgrade Plan
            </button>
          </Link>
        </div>
      </div>
    </aside>
  )
}
