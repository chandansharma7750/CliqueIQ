import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@/lib/supabase/server"
import { PLANS } from "@/types"

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear()
  const num = Math.floor(Math.random() * 90000) + 10000
  return `CIQ-${year}-${num}`
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      billing,
    } = await req.json()

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const plan = PLANS.find((p) => p.id === planId)
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const baseAmount = billing === "annual" ? plan.price_annual : plan.price_monthly
    const gstAmount = Math.round(baseAmount * 0.18)
    const totalAmount = baseAmount + gstAmount

    // Record invoice
    await supabase.from("invoices").insert({
      user_id: user.id,
      razorpay_payment_id,
      razorpay_order_id,
      plan: planId,
      amount: baseAmount * 100,
      gst_amount: gstAmount * 100,
      total_amount: totalAmount * 100,
      status: "paid",
      invoice_number: generateInvoiceNumber(),
      billing_period_start: new Date().toISOString(),
      billing_period_end: new Date(
        billing === "annual"
          ? Date.now() + 365 * 24 * 60 * 60 * 1000
          : Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
    })

    // Update profile subscription
    await supabase
      .from("profiles")
      .update({
        subscription_tier: planId,
        subscription_status: "active",
        razorpay_subscription_id: razorpay_payment_id,
      })
      .eq("id", user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
