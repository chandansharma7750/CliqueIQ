"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SettingsData {
  email: string
  profile: { full_name?: string } | null
  workspace: { name?: string; gst_number?: string } | null
}

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null)
  const [fullName, setFullName] = useState("")
  const [workspaceName, setWorkspaceName] = useState("")
  const [gstNumber, setGstNumber] = useState("")
  const [saving, setSaving] = useState(false)
  const [savingWs, setSavingWs] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d: SettingsData) => {
        setData(d)
        setFullName(d.profile?.full_name ?? "")
        setWorkspaceName(d.workspace?.name ?? "")
        setGstNumber(d.workspace?.gst_number ?? "")
      })
      .catch(() => showToast("Failed to load settings", false))
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName }),
      })
      if (!res.ok) throw new Error()
      showToast("Profile saved!")
    } catch {
      showToast("Failed to save profile", false)
    } finally {
      setSaving(false)
    }
  }

  const saveWorkspace = async () => {
    setSavingWs(true)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspace_name: workspaceName, gst_number: gstNumber }),
      })
      if (!res.ok) throw new Error()
      showToast("Workspace saved!")
    } catch {
      showToast("Failed to save workspace", false)
    } finally {
      setSavingWs(false)
    }
  }

  const initials =
    fullName?.slice(0, 2)?.toUpperCase() ||
    data?.email?.slice(0, 2)?.toUpperCase() ||
    "U"

  return (
    <div className="max-w-2xl space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg transition-all ${
            toast.ok
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500 mt-1">Manage your account and workspace settings</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
              {initials}
            </div>
          </div>
          <div className="grid gap-3">
            <div>
              <Label>Full Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={data?.email ?? ""}
                disabled
                className="mt-1 bg-slate-50"
              />
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed here</p>
            </div>
          </div>
          <Button onClick={saveProfile} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Workspace */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workspace</CardTitle>
          <CardDescription>Your agency or brand workspace settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Workspace Name</Label>
            <Input
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="My Agency"
              className="mt-1"
            />
          </div>
          <div>
            <Label>GST Number</Label>
            <Input
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              placeholder="22AAAAA0000A1Z5"
              className="mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">Used for auto-generating GST invoices</p>
          </div>
          <Button onClick={saveWorkspace} disabled={savingWs}>
            {savingWs ? "Saving…" : "Save Workspace"}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Post scheduled", desc: "When a post is successfully scheduled" },
            { label: "Post published", desc: "When a post goes live" },
            { label: "Post failed", desc: "When a scheduled post fails to publish" },
            { label: "Festival reminders", desc: "7 days before upcoming Indian festivals" },
            { label: "Weekly analytics report", desc: "Every Monday morning" },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-900">{n.label}</p>
                <p className="text-xs text-slate-500">{n.desc}</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-violet-600" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-base text-red-700">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Delete Account</p>
              <p className="text-xs text-slate-500">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
