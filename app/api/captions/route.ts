import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { topic, tone, platform } = await req.json()

  if (!topic || !tone || !platform) {
    return NextResponse.json({ error: "topic, tone, and platform are required" }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
  }

  const toneInstructions: Record<string, string> = {
    professional: "Write in a formal, business-appropriate tone in English. Sound authoritative and polished.",
    casual: "Write in a friendly, conversational tone in English. Sound fun and approachable.",
    hinglish: "Write in Hinglish (Hindi + English mix) — the way young Indians text. Use Devanagari script for some Hindi words mixed with English naturally. Sound desi and relatable.",
    festive: "Write in a festive, celebratory tone mixing Hindi and English. Include relevant Indian festival emojis and energy. Sound warm and joyful.",
  }

  const platformInstructions: Record<string, string> = {
    Instagram: "Optimized for Instagram — include 5-8 relevant hashtags at the end, use emojis naturally, keep it engaging.",
    Facebook: "Optimized for Facebook — slightly longer, conversational, encourage engagement with a question. 2-3 hashtags max.",
    LinkedIn: "Optimized for LinkedIn — professional insight, add value, end with a thought-provoking question. 3-5 hashtags.",
    YouTube: "Optimized for a YouTube video description — compelling hook, brief description, call to action to watch/subscribe.",
  }

  const prompt = `You are an expert Indian social media content writer. Generate exactly 3 different caption variations for a ${platform} post.

Topic: ${topic}
Tone: ${toneInstructions[tone] || toneInstructions.casual}
Platform: ${platformInstructions[platform] || platformInstructions.Instagram}

Rules:
- Each variation must be meaningfully different (different angle, hook, or style)
- Make them feel authentic, not generic
- Include relevant emojis
- Make them work specifically for Indian audiences and Indian brands
- Do NOT number the variations or add labels like "Variation 1:"

Return ONLY a JSON array with exactly 3 strings, no other text:
["caption 1 text here", "caption 2 text here", "caption 3 text here"]`

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error("Gemini API error:", err)
      return NextResponse.json({ error: "AI generation failed" }, { status: 500 })
    }

    const data = await response.json()
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    // Parse the JSON array from response
    const jsonMatch = rawText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    const captions: string[] = JSON.parse(jsonMatch[0])

    if (!Array.isArray(captions) || captions.length === 0) {
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 })
    }

    return NextResponse.json({ captions })
  } catch (error) {
    console.error("Caption generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
