# Pending Commit — Run These Commands in Terminal

Open Terminal, `cd` into your project folder, then run:

```bash
cd ~/Documents/Claude/Projects/Cliqueiq

# Remove the leftover proxy.ts (replaced by middleware.ts)
rm proxy.ts

# Remove the leftover git locks if they exist
rm -f .git/index.lock .git/HEAD.lock

# Stage all changes
git add -A

# Commit
git commit -m "feat: auth middleware, schedule DB, settings save, YouTube analytics

- middleware.ts: fix auth protection (proxy.ts was ignored by Next.js)
- .env.local: add GOOGLE_CLIENT_ID/SECRET, fix APP_URL
- OAuth: dynamic redirect URIs in meta connect/callback routes
- scheduled_posts: new table migration + RLS policy + /api/posts CRUD
- schedule page: rewrite from mock data to real Supabase persistence
- settings page: convert to client component with real save/update
- /api/settings: GET + PUT route for profile & workspace
- analytics: YouTube audience demographics wiring
- .gitignore: exclude design/.claude worktrees"

# Push to GitHub
git push origin main
```

## ⚠️ Before pushing to production (Vercel)

Add these env vars in your Vercel dashboard → Project Settings → Environment Variables:

| Variable | Value |
|---|---|
| `GOOGLE_CLIENT_ID` | From Google Cloud Console → OAuth credentials |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console → OAuth credentials |
| `META_APP_ID` | From Meta Developer portal |
| `META_APP_SECRET` | From Meta Developer portal |
| `RAZORPAY_KEY_ID` | From Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | From Razorpay dashboard |
| `NEXT_PUBLIC_APP_URL` | `https://clique-iq.vercel.app` |

## ⚠️ Run this SQL in Supabase dashboard

Go to Supabase → SQL Editor → paste and run the file at:
`supabase/migrations/20260530_scheduled_posts.sql`

Also check if `workspaces` table has `gst_number` column. If not, run:
```sql
alter table public.workspaces add column if not exists gst_number text;
```
