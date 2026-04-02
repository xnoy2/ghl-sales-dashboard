# GHL Sales Dashboard

Live sales pipeline dashboard built with Next.js 14, connected to GoHighLevel CRM.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local with your credentials

# 3. Run dev server
npm run dev
# Open http://localhost:3000

# Demo login (no setup needed):
# Email:    admin@demo.com
# Password: demo1234
```

---

## Project Structure

```
app/
  api/
    auth/[...nextauth]/   ← Auth endpoint
    leads/                ← GET + POST leads
    stats/                ← GET KPI stats
    webhooks/ghl/         ← GHL real-time events (Phase 2)
  dashboard/              ← Protected main page
  login/                  ← Auth page
components/
  dashboard/
    Navbar.tsx            ← Top bar with user + refresh
    StatGrid.tsx          ← 5 KPI cards
    PipelineBoard.tsx     ← Kanban pipeline columns
    LeadCard.tsx          ← Individual lead card
    AddLeadModal.tsx      ← Add lead form
    TeamActivity.tsx      ← Team deal progress
    AlertsPanel.tsx       ← Follow-up alerts
    ActivityFeed.tsx      ← Timeline of recent activity
    QuickActions.tsx      ← Bottom action buttons
lib/
  ghl.ts                  ← GHL API wrapper (auto-mocks without key)
  mock-data.ts            ← Sample data for development
types/
  index.ts                ← All shared TypeScript types
```

---

## Phase 1 — Frontend (current)
- [x] Login page with NextAuth credentials
- [x] Protected dashboard route
- [x] KPI stat cards
- [x] Kanban pipeline board
- [x] Lead detail side sheet
- [x] Add lead modal
- [x] Team activity with progress bars
- [x] Follow-up alerts panel
- [x] Activity feed timeline
- [x] Mock data (works without GHL key)

## Phase 2 — GHL API Integration
- [ ] Add `GHL_API_KEY` + `GHL_LOCATION_ID` to `.env.local`
- [ ] Map GHL contact/opportunity objects to `Lead` type in `lib/ghl.ts`
- [ ] Set up GHL webhook → `/api/webhooks/ghl`
- [ ] Add Pusher/Ably for real-time push to clients

## Phase 3 — Production
- [ ] Deploy to Vercel (`vercel --prod`)
- [ ] Set env vars in Vercel dashboard
- [ ] Add GHL webhook URL: `https://yourdomain.vercel.app/api/webhooks/ghl`
- [ ] Switch from polling to WebSocket updates

---

## Add Team Members

In `.env.local`, add numbered blocks:

```env
TEAM_USER_1_EMAIL=alice@company.com
TEAM_USER_1_PASSWORD=secure_password
TEAM_USER_1_NAME=Alice
TEAM_USER_1_ROLE=admin

TEAM_USER_2_EMAIL=bob@company.com
TEAM_USER_2_PASSWORD=secure_password
TEAM_USER_2_NAME=Bob
TEAM_USER_2_ROLE=agent
```

---

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add secrets
vercel env add NEXTAUTH_SECRET
vercel env add GHL_API_KEY
vercel env add GHL_LOCATION_ID

# Production deploy
vercel --prod
```
