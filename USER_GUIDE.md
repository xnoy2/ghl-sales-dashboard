# GHL Sales Dashboard — SOP & User Guide

## Overview

The GHL Sales Dashboard is a real-time sales pipeline tool connected to GoHighLevel (GHL) CRM. It gives your team visibility across two accounts (**BCF** and **BGR**) and two pipelines (**Lead** and **Sales**), with live updates and KPI tracking.

---

## 1. Logging In

1. Navigate to the dashboard URL in your browser.
2. Enter your credentials on the login screen.
3. Click **Sign In**.

If login fails, contact your system admin — accounts are managed centrally and credentials will be provided to you directly.

---

## 2. Dashboard Layout

Once logged in you will see the main dashboard with these sections:

| Section | What it shows |
|---|---|
| **Stat Grid** (top) | 5 KPI cards: New Leads, Contacted, Quoted, Follow-ups, Closed Deals |
| **Pipeline Board** (centre) | Kanban columns, one per pipeline stage, with lead cards |
| **Team Activity** (right) | Each team member's deal count vs. their target |
| **Alerts Panel** | Follow-up reminders sorted by urgency (Critical / Warning / Info) |
| **Activity Feed** | Chronological log of recent events (new lead, quoted, closed, etc.) |

---

## 3. Switching Accounts and Pipelines

Use the controls at the top of the dashboard:

- **Account selector** — Switch between **BCF** and **BGR**. Each account has its own GHL location and pipeline data.
- **Pipeline switcher** — Toggle between **LEAD** and **SALES**.

The page reloads the relevant data automatically when you switch.

### Pipeline Stages

**LEAD pipeline**

| Stage | Meaning |
|---|---|
| New Lead | Just entered the system |
| Warm | Initial contact made |
| Quote Sent | Proposal delivered |
| No Response / Retarget | Unresponsive — re-engagement needed |

**SALES pipeline**

| Stage | Meaning |
|---|---|
| Deposit Taken | Sale confirmed, deposit received |
| Install Date Needed | Awaiting scheduling |
| Installation Scheduled | Date booked |
| Completed | Job done |
| Lost | Deal fallen through |

---

## 4. Reading Lead Cards

Each card on the pipeline board shows:

- **Name** and contact details (email / phone)
- **Deal value** (£)
- **Current stage**
- **Days in stage** — how long the lead has been in that column

Cards with a high "days in stage" count that also appear in the Alerts Panel need immediate attention.

---

## 5. Moving a Lead Between Stages

1. Click and hold a lead card.
2. Drag it to the target stage column.
3. Release — the card snaps into place and the change is synced to GHL automatically.

> The stage update is sent to GoHighLevel in real time. No manual save is required.

---

## 6. Adding a New Lead

1. Click **+ Add Lead** (button in the top-right area of the pipeline board).
2. Fill in the form:
   - Name (required)
   - Email
   - Phone
   - Deal value
   - Pipeline stage to place them in
3. Click **Save** — the lead appears on the board and is created in GHL.

---

## 7. KPI Stats Explained

| KPI Card | Definition |
|---|---|
| New Leads | Leads that entered the system today / this period |
| Contacted | Leads that have moved past the "New Lead" stage |
| Quoted | Leads with a quote sent |
| Follow-ups | Leads flagged for follow-up action |
| Closed Deals | Leads that reached the "Completed" stage |

Stats refresh automatically via Pusher (real-time WebSocket). You can also force a manual refresh using the **Refresh** button in the top navigation bar.

---

## 8. Alerts and Follow-ups

The **Alerts Panel** surfaces leads that need action:

- **Critical** (red) — overdue follow-up, immediate action required
- **Warning** (amber) — follow-up due soon
- **Info** (blue) — general reminders

Click an alert to view the lead details and take action (call, email, or move stage).

---

## 9. Real-Time Updates

The dashboard uses Pusher WebSockets to push live updates. If a colleague moves a lead or a new enquiry comes in from GHL, your board updates automatically without a page refresh.

If the board appears stale, click **Refresh** in the navbar to force a data pull.

---

## 10. Admin — System Setup (IT / Admin Use Only)

### Environment Variables

The following must be set before the app will connect to live GHL data. These are stored in a `.env.local` file (local dev) or in Vercel environment settings (production).

```
# Authentication
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=<your-deployment-url>

# BCF Account
GHL_API_KEY_BCF=<ghl-private-integration-token>
GHL_LOCATION_ID_BCF=<ghl-location-id>
LEAD_PIPELINE_ID_BCF=<pipeline-id>
SALES_PIPELINE_ID_BCF=<pipeline-id>

# BGR Account
GHL_API_KEY_BCF=<ghl-private-integration-token>
GHL_LOCATION_ID_BGR=<ghl-location-id>
LEAD_PIPELINE_ID_BGR=<pipeline-id>
SALES_PIPELINE_ID_BGR=<pipeline-id>

# Pusher (real-time updates)
PUSHER_APP_ID=<id>
PUSHER_KEY=<key>
PUSHER_SECRET=<secret>
PUSHER_CLUSTER=<cluster>
NEXT_PUBLIC_PUSHER_KEY=<key>
NEXT_PUBLIC_PUSHER_CLUSTER=<cluster>
```

### Adding a New User

User accounts are currently defined in the NextAuth credentials configuration in the codebase. To add a new user, update the credentials list in `app/api/auth/[...nextauth]/route.ts` (or the relevant auth config file) and redeploy.

### Deploying to Production

1. Push your changes to the `main` branch on GitHub.
2. Vercel will automatically build and deploy.
3. Verify environment variables are set in the Vercel project dashboard before the first deploy.

### Stage Mapping (GHL UUIDs)

GHL pipeline stages use UUID identifiers. If stages ever change in GHL (renamed or re-created), update `lib/stageMap.ts` with the new UUIDs to keep the board labels accurate.

---

## 11. Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Board shows no leads | GHL API key missing or expired | Check `GHL_API_KEY_*` env vars |
| Stage drag has no effect | GHL API key lacks write permission | Generate a new private integration token with full access in GHL |
| Real-time updates not working | Pusher config missing | Verify all `PUSHER_*` env vars are set |
| Login fails | Wrong credentials or `NEXTAUTH_SECRET` not set | Check auth config and env vars |
| Alerts panel empty | No overdue follow-ups — or API not connected | Confirm GHL integration is live |

---

## 12. Contacts

For technical issues, contact **Jomel Reyes** (Developer).

For GoHighLevel-specific questions (pipeline config, stage names, API tokens), contact **Mie** or **Jomel Reyes**.
