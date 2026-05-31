@AGENTS.md

# RankCommander — AI Visibility Platform

Autonomous AI SEO SaaS. Users sign in, add domains, and the platform runs full SEO analysis (keywords, backlinks, competitor gaps, technical audits, live rankings) via third-party APIs. Monthly cron generates and saves reports automatically.

## Stack

- **Framework**: Next.js 16 (App Router, `src/` layout)
- **Auth**: NextAuth v4 — GitHub OAuth, JWT session strategy (no NextAuth DB tables)
- **Database**: PostgreSQL via Prisma 7 with `@prisma/adapter-pg` driver adapter
- **Payments**: Stripe (subscriptions: free / pro / agency)
- **SEO APIs**: SpyFu (keywords, competitors), DataForSEO (technical audit, backlinks), Serper (live SERP rankings)
- **Styling**: Tailwind CSS v4

## Key Files

| Path | Purpose |
|------|---------|
| `src/lib/seo-engine.ts` | All SEO API calls + `generateMonthlyReport()` |
| `src/lib/prisma.ts` | Prisma singleton with PrismaPg adapter |
| `src/middleware.ts` | Auth guard for `/dashboard` |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth config + DB user upsert |
| `src/app/api/analyze/route.ts` | Runs analysis, saves Domain+Report to DB |
| `src/app/api/reports/route.ts` | GET user's saved domains + latest scores |
| `src/app/api/audit/start/route.ts` | Kicks off async DataForSEO crawl |
| `src/app/api/audit/status/route.ts` | Polls DataForSEO crawl result |
| `src/app/api/cron/seo-update/route.ts` | Monthly cron — fetches all domains from DB, saves reports |
| `src/app/api/stripe/` | Stripe checkout, webhook, portal |
| `src/app/api/reports/email/route.ts` | POST — manual send of current report to user email |
| `src/lib/email.ts` | Resend client + HTML email template builder |
| `src/lib/export-pdf.ts` | Client-side PDF export via jsPDF (called from dashboard) |
| `src/app/page.tsx` | Public landing page |
| `src/app/dashboard/page.tsx` | Main dashboard (client component) |
| `prisma/schema.prisma` | User, Domain, Report models |

## Database Schema

```
User        id, email, name, stripeId, subscription ('free'|'pro'|'agency'), domains[]
Domain      id, url, userId, reports[], createdAt
Report      id, domainId, data (JSON string of MonthlyReport), month, year, overallScore, createdAt
```

## Pricing Tiers

| Tier | Price | Stripe lookup_key |
|------|-------|-------------------|
| free | $0 | — |
| pro | $49/mo | `pro_monthly` |
| agency | $199/mo | `agency_monthly` |

## Env Vars Required

```
DATABASE_URL=
GITHUB_ID=
GITHUB_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

SPYFU_API_KEY=
DATAFORSEO_LOGIN=
DATAFORSEO_PASSWORD=
SERPER_API_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

RESEND_API_KEY=

CRON_SECRET=
```

## Auth Flow

1. GitHub OAuth → NextAuth
2. `signIn` callback upserts User in DB
3. `jwt` callback fetches DB id + subscription → caches in token
4. `session` exposes `user.id` and `user.subscription` everywhere
5. `/dashboard` protected by `src/middleware.ts` (cookie check)

## Stripe Flow

1. User clicks upgrade → POST `/api/stripe/checkout` with `priceId`
2. Redirect to Stripe Checkout
3. On success → Stripe webhook → `checkout.session.completed` → set `user.subscription` + `user.stripeId`
4. `customer.subscription.updated` / `customer.subscription.deleted` keep DB in sync
5. Manage billing → POST `/api/stripe/portal` → redirect to Stripe Customer Portal

## Development Notes

- Prisma 7 uses `prisma.config.ts` for datasource config AND `url = env("DATABASE_URL")` in schema (both required)
- The cron route at `/api/cron/seo-update` is called by Vercel Cron; protect with `CRON_SECRET`
- DataForSEO technical audit is async — `/api/audit/start` kicks it off, dashboard polls `/api/audit/status` every 5s
- Analysis takes ~30s end-to-end; `maxDuration = 300` is set on the analyze route for Vercel
