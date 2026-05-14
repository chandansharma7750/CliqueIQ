import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/server"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single()

  return (
    <div className="max-w-2xl space-y-6">
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
              {profile?.full_name?.slice(0, 2)?.toUpperCase() ?? user?.email?.slice(0, 2)?.toUpperCase() ?? "U"}
            </div>
            <Button variant="outline" size="sm">Change Avatar</Button>
          </div>
          <div className="grid gap-3">
            <div>
              <Label>Full Name</Label>
              <Input defaultValue={profile?.full_name ?? ""} placeholder="Your name" className="mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input defaultValue={user?.email ?? ""} disabled className="mt-1 bg-slate-50" />
            </div>
          </div>
          <Button>Save Changes</Button>
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
            <Input placeholder="My Agency" className="mt-1" />
          </div>
          <div>
            <Label>GST Number</Label>
            <Input placeholder="22AAAAA0000A1Z5" className="mt-1" />
            <p className="text-xs text-slate-500 mt-1">Used for auto-generating GST invoices</p>
          </div>
          <Button>Save Workspace</Button>
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
