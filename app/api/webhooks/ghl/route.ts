import { NextResponse } from "next/server";
import { addNotification } from "@/lib/notifications";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: Request) {
  try {
    // Optional auth: if WEBHOOK_SECRET is set, require ?secret= to match.
    // Until you set it, the endpoint stays open so existing workflows work.
    const reqUrl = new URL(req.url);
    const requiredSecret = process.env.WEBHOOK_SECRET;
    if (requiredSecret && reqUrl.searchParams.get("secret") !== requiredSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();

    // Event type: native webhooks send `type` in the body; GHL workflow
    // webhooks don't, so we also accept it from the URL (?type=...).
    const event =
      payload.type ?? payload.event_type ?? reqUrl.searchParams.get("type") ?? "unknown";

    // Extract names — tolerant of both native (nested/camelCase) and
    // workflow (flat/snake_case) GHL payload shapes.
    const contactName =
      payload.contact?.name ||
      payload.full_name ||
      payload.contact_name ||
      `${payload.contact?.firstName ?? payload.first_name ?? ""} ${
        payload.contact?.lastName ?? payload.last_name ?? ""
      }`.trim() ||
      payload.opportunity?.name ||
      payload.opportunity_name ||
      payload.name ||
      "Unknown";

    const stageName =
      payload.opportunity?.pipelineStageName ||
      payload.pipelineStageName ||
      payload.pipeline_stage ||
      payload.stage ||
      "";

    let message = "";
    let icon = "🔔";

    switch (event) {
      case "ContactCreate":
        icon = "👤";
        message = `New contact: ${contactName}`;
        break;

      case "ContactUpdate":
        icon = "✏️";
        message = `Contact updated: ${contactName}`;
        break;

      case "OpportunityCreate":
        icon = "💼";
        message = `New opportunity: ${contactName}${stageName ? ` → ${stageName}` : ""}`;
        break;

      case "OpportunityStageUpdate":
        icon = "📊";
        message = stageName
          ? `${contactName} moved to ${stageName}`
          : `Stage updated: ${contactName}`;
        break;

      case "OpportunityUpdate":
        icon = "🔄";
        message = `Opportunity updated: ${contactName}`;
        break;

      case "NoteCreate":
        icon = "📝";
        message = `Note added on ${contactName}`;
        break;

      case "TaskCreate":
        icon = "✅";
        message = `Task created for ${contactName}`;
        break;

      default: {
        // One-workflow setup: GHL doesn't tell us which trigger fired, so
        // infer the message from whatever data is in the payload.
        const hasOpportunity =
          !!payload.opportunity ||
          !!payload.pipelineStageId ||
          !!payload.pipeline_id ||
          !!payload.pipeline_stage ||
          !!stageName;

        if (hasOpportunity && stageName) {
          icon = "📊";
          message = `${contactName} → ${stageName}`;
        } else if (hasOpportunity) {
          icon = "💼";
          message = `Opportunity update: ${contactName}`;
        } else {
          icon = "✏️";
          message = `Update: ${contactName}`;
        }
        break;
      }
    }

    const notification = {
      id: Date.now().toString(),
      text: `${icon} ${message}`,
      event,
      createdAt: Date.now(),
    };

    addNotification(notification.text);

    await pusherServer.trigger("dashboard", "new-event", notification);

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error("[GHL Webhook error]", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
