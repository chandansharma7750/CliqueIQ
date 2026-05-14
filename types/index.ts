export type Platform = "instagram" | "facebook" | "linkedin" | "youtube"

export type PostStatus = "draft" | "scheduled" | "published" | "failed"

export type SubscriptionTier = "free" | "starter" | "professional" | "agency"

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  subscription_tier: SubscriptionTier
  subscription_status: "active" | "trialing" | "canceled" | "past_due"
  trial_ends_at: string | null
  created_at: string
}

export interface Workspace {
  id: string
  name: string
  owner_id: string
  logo_url: string | null
  created_at: string
}

export interface SocialAccount {
  id: string
  workspace_id: string
  platform: Platform
  account_id: string
  account_name: string
  account_handle: string
  avatar_url: string | null
  access_token: string
  refresh_token: string | null
  token_expires_at: string | null
  is_active: boolean
  created_at: string
}

export interface Post {
  id: string
  workspace_id: string
  social_account_id: string
  caption: string
  media_urls: string[]
  platform: Platform
  status: PostStatus
  scheduled_at: string | null
  published_at: string | null
  platform_post_id: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface Plan {
  id: string
  name: string
  price_monthly: number
  price_annual: number
  features: string[]
  limits: {
    social_accounts: number
    posts_per_month: number | null
    users: number
    ai_captions_per_day: number | null
  }
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price_monthly: 799,
    price_annual: 7670, // 20% off
    features: [
      "5 social accounts",
      "100 scheduled posts/month",
      "Basic analytics (30 days)",
      "2 AI captions/day",
      "1 user",
    ],
    limits: {
      social_accounts: 5,
      posts_per_month: 100,
      users: 1,
      ai_captions_per_day: 2,
    },
  },
  {
    id: "professional",
    name: "Professional",
    price_monthly: 1999,
    price_annual: 19190,
    features: [
      "20 social accounts",
      "Unlimited scheduling",
      "Full analytics + PDF reports",
      "Unlimited AI captions",
      "Festival calendar + templates",
      "WhatsApp analytics (1 number)",
      "3 users",
      "White-label reports",
    ],
    limits: {
      social_accounts: 20,
      posts_per_month: null,
      users: 3,
      ai_captions_per_day: null,
    },
  },
  {
    id: "agency",
    name: "Agency",
    price_monthly: 4999,
    price_annual: 47990,
    features: [
      "Unlimited accounts",
      "Everything in Professional",
      "Competitor spy tool",
      "Viral score predictor",
      "WhatsApp analytics (5 numbers)",
      "Team collaboration + approvals",
      "Priority support",
      "10 users",
      "Custom branding",
    ],
    limits: {
      social_accounts: -1,
      posts_per_month: null,
      users: 10,
      ai_captions_per_day: null,
    },
  },
]
