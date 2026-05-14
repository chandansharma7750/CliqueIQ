# CliqueIQ — Setup Guide

India's first social media management SaaS. Built with Next.js 16, Supabase, Tailwind CSS, and Razorpay.

---

## 🚀 Quick Start (5 minutes)

### Step 1 — Install dependencies

```bash
cd /Users/chandansharma/Documents/Claude/Projects/Cliqueiq
npm install
```

### Step 2 — Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the keys (see sections below).

### Step 3 — Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll see the landing page.

---

## 🔑 Setting Up Each Service

### 1. Supabase (Database + Auth)

**Time: ~10 minutes**

1. Go to [supabase.com](https://supabase.com) → create a free account
2. Create a new project (name: `cliqueiq`, region: `ap-south-1` — Mumbai)
3. Go to **Settings → API** → copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
4. Go to **SQL Editor** → paste the contents of `supabase/schema.sql` → Run
5. Go to **Authentication → Providers → Google** → enable it
6. Set up Google OAuth:
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create OAuth 2.0 credentials
   - Authorized redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret into Supabase Google provider settings

### 2. Razorpay (Payments + GST Invoices)

**Time: ~10 minutes**

1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com) → Sign up (use your GST number)
2. Go to **Settings → API Keys** → Generate test keys
3. Copy into `.env.local`:
   - `RAZORPAY_KEY_ID` → Key ID (starts with `rzp_test_`)
   - `RAZORPAY_KEY_SECRET` → Key Secret
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID` → same as Key ID

> **Note:** For production, switch to live keys and complete KYC verification.

### 3. Meta (Instagram + Facebook API)

**Time: ~30 minutes to set up, 2–4 weeks for App Review**

1. Go to [developers.facebook.com](https://developers.facebook.com) → **My Apps → Create App**
2. Choose app type: **Business**
3. Add products:
   - **Facebook Login** (for web)
   - **Instagram Basic Display**
4. Under **Facebook Login → Settings**:
   - Valid OAuth Redirect URI: `http://localhost:3000/api/auth/meta/callback`
5. Copy App ID and Secret into `.env.local`:
   - `META_APP_ID`
   - `META_APP_SECRET`
   - `NEXT_PUBLIC_META_APP_ID`
6. **For testing:** Add yourself as a test user in **Roles → Test Users**
7. **For production:** Submit for App Review with use case description

**Required Permissions for App Review:**
- `instagram_basic` — read profile and media
- `instagram_content_publish` — publish posts
- `instagram_manage_insights` — read analytics
- `pages_show_list` — list Facebook Pages
- `pages_manage_posts` — post to Facebook Pages
- `read_insights` — Facebook Page analytics

### 4. OpenAI (AI Caption Generator)

**Time: 2 minutes**

1. Go to [platform.openai.com](https://platform.openai.com) → API Keys → Create key
2. Add to `.env.local`: `OPENAI_API_KEY`

> **Budget tip:** Use `gpt-4o-mini` for captions (~₹0.05/1000 tokens) instead of `gpt-4o`. 
> For Hindi, Google Gemini 1.5 Flash is also excellent and cheaper.

---

## 🗂️ Project Structure

```
cliqueiq/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page (Google OAuth + Magic Link)
│   │   └── signup/         # Signup page
│   ├── (dashboard)/
│   │   ├── layout.tsx      # Dashboard shell (sidebar + topbar)
│   │   ├── dashboard/      # Main dashboard with stats + quick actions
│   │   ├── schedule/       # Content calendar + post composer
│   │   ├── analytics/      # Cross-platform analytics
│   │   ├── captions/       # AI caption generator
│   │   ├── calendar/       # Indian festival calendar
│   │   ├── connect/        # Social account connections
│   │   ├── billing/        # Razorpay pricing + subscription
│   │   └── settings/       # Profile + workspace settings
│   ├── api/
│   │   ├── auth/meta/      # Meta OAuth callback + connect routes
│   │   └── billing/        # Razorpay order creation + payment verification
│   ├── auth/callback/      # Supabase auth callback
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # Reusable UI components (Button, Card, Badge, etc.)
│   └── layout/             # Sidebar + Topbar
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser Supabase client
│   │   └── server.ts       # Server Supabase client
│   └── utils.ts            # cn(), formatINR(), formatDate()
├── types/
│   └── index.ts            # TypeScript types + PLANS array
├── supabase/
│   └── schema.sql          # Complete DB schema — run this in Supabase SQL Editor
├── middleware.ts            # Auth protection for dashboard routes
└── .env.example            # All required environment variables
```

---

## 📅 Phase 1 Build Status

| Feature | Status |
|---------|--------|
| Next.js 16 + Tailwind + shadcn/ui | ✅ Done |
| Supabase Auth (Google OAuth + Magic Link) | ✅ Done |
| Database schema (users, posts, accounts, invoices) | ✅ Done |
| Dashboard shell + sidebar navigation | ✅ Done |
| Content calendar + post composer UI | ✅ Done |
| Indian festival calendar (16 events) | ✅ Done |
| AI caption generator (Hindi/English/Hinglish) | ✅ Done (UI + mock) |
| Connect accounts UI (Meta, LinkedIn, YouTube) | ✅ Done |
| Meta Graph API OAuth flow | ✅ Done |
| Razorpay billing (₹799/₹1999/₹4999 plans) | ✅ Done |
| GST invoice recording in DB | ✅ Done |
| Analytics dashboard shell | ✅ Done |
| Settings page | ✅ Done |
| Landing page with pricing | ✅ Done |

### Phase 1 Next Steps

- [ ] Wire up OpenAI API for real caption generation (`/app/api/captions/route.ts`)
- [ ] Add BullMQ + Redis for post scheduling queue
- [ ] Implement actual post publishing via Meta Graph API
- [ ] Pull real analytics from Meta + LinkedIn + YouTube APIs
- [ ] Add PDF report generation
- [ ] Deploy to Vercel + add production env vars

---

## 🚢 Deployment (Vercel)

```bash
npm run build    # Verify build passes locally first
```

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add all env vars from `.env.local` to Vercel project settings
4. Deploy!

Update your Supabase Google OAuth redirect URI to your production URL:
`https://your-cliqueiq.vercel.app/api/auth/meta/callback`

---

## 💰 Pricing

| Plan | Monthly | Annual (20% off) |
|------|---------|-----------------|
| Starter | ₹799 + GST | ₹7,670 + GST |
| Professional ⭐ | ₹1,999 + GST | ₹19,190 + GST |
| Agency | ₹4,999 + GST | ₹47,990 + GST |

Break-even at 100–120 Professional customers = ₹2L+/month revenue.
