"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle2, Zap, Shield, Receipt, CreditCard } from "lucide-react"
import { PLANS } from "@/types"
import type { Plan } from "@/types"
import { cn } from "@/lib/utils"

const plans = PLANS

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, unknown>) => { open(): void }
  }
}

export default function BillingPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly")
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (plan: Plan) => {
    setLoading(plan.id)
    try {
      // 1. Create Razorpay order on server
      const res = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, billing }),
      })
      const { orderId, amount, currency, keyId } = await res.json()

      // 2. Load Razorpay script dynamically
      if (!window.Razorpay) {
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        document.body.appendChild(script)
        await new Promise((resolve) => (script.onload = resolve))
      }

      // 3. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: "CliqueIQ",
        description: `${plan.name} Plan — ${billing === "monthly" ? "Monthly" : "Annual"}`,
        image: "/logo.png",
        prefill: { email: "" },
        theme: { color: "#7C3AED" },
        handler: async (response: Record<string, string>) => {
          // Verify payment on server
          await fetch("/api/billing/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          })
          window.location.reload()
        },
      })
      rzp.open()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(null)
    }
  }

  const getPrice = (plan: Plan) =>
    billing === "monthly" ? plan.price_monthly : Math.round(plan.price_annual / 12)

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Billing & Plans</h2>
        <p className="text-slate-500 mt-1">Choose the right plan for your agency. All plans include GST invoice.</p>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1">
          <button
            onClick={() => setBilling("monthly")}
            className={cn(
              "rounded-lg px-5 py-2 text-sm font-medium transition-all",
              billing === "monthly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={cn(
              "rounded-lg px-5 py-2 text-sm font-medium transition-all flex items-center gap-2",
              billing === "annual" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Annual
            <Badge variant="success" className="text-xs py-0 px-1.5">Save 20%</Badge>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan: Plan) => {
          const isPopular = plan.id === "professional"
          return (
            <Card
              key={plan.id}
              className={cn(
                "relative overflow-hidden transition-all",
                isPopular && "border-violet-400 shadow-violet-100 shadow-xl ring-1 ring-violet-400"
              )}
            >
              {isPopular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-violet-600 to-indigo-600 py-1.5 text-center text-xs font-semibold text-white">
                  ⭐ Most Popular — Sweet spot for agencies
                </div>
              )}
              <CardHeader className={cn("pb-4", isPopular && "pt-10")}>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">
                    ₹{getPrice(plan).toLocaleString("en-IN")}
                  </span>
                  <span className="text-slate-500 text-sm">/month</span>
                </div>
                {billing === "annual" && (
                  <p className="text-xs text-green-600 font-medium">
                    ₹{plan.price_annual.toLocaleString("en-IN")}/year — save ₹{((plan.price_monthly * 12) - plan.price_annual).toLocaleString("en-IN")}
                  </p>
                )}
                <CardDescription className="mt-1">+ 18% GST</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2.5">
                  {plan.features.map((f: string) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-violet-600 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={isPopular ? "gradient" : "outline"}
                  className="w-full"
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading === plan.id}
                >
                  {loading === plan.id ? "Processing…" : "Start Free Trial"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Trust signals */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: Shield, title: "Secure Payments", desc: "All payments via Razorpay — India's most trusted payment gateway." },
          { icon: Receipt, title: "GST Invoice Auto-Generated", desc: "Tax invoice automatically sent to your email after every payment." },
          { icon: CreditCard, title: "UPI / Cards / NetBanking", desc: "Pay with any method — UPI, debit card, credit card, or net banking." },
        ].map((t) => (
          <div key={t.title} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
              <t.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{t.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Current Plan Info */}
      <Card className="border-violet-200 bg-violet-50/50">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
              <Zap className="h-5 w-5 text-violet-700" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">You&apos;re on the Free Trial</p>
              <p className="text-sm text-slate-600">14 days remaining. Upgrade to keep access to all features.</p>
            </div>
            <Badge variant="warning">Trial</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
