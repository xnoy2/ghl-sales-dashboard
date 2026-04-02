import { NextResponse } from "next/server";

/**
 * POST /api/webhooks/ghl
 * ─────────────────────────────────────────────────────
 * Receives real-time events from GoHighLevel webhooks.
 * Configure in GHL → Settings → Integrations → Webhooks
 *
 * Supported events:
 *   - ContactCreate
 *   - ContactUpdate
 *   - OpportunityCreate
 *   - OpportunityStageUpdate
 *
 * Phase 2: pipe these into a Pusher/Ably channel so the
 *          frontend updates without polling.
 */
export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const event   = payload.type ?? "unknown";

    console.log("[GHL Webhook]", event, payload);

    // TODO Phase 2: broadcast to Pusher
    // await pusher.trigger("dashboard", event, payload);

    switch (event) {
      case "ContactCreate":
        // invalidate leads cache
        break;
      case "OpportunityStageUpdate":
        // push stage change to clients
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[GHL Webhook error]", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
