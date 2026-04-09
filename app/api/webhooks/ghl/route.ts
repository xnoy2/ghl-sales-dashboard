import { NextResponse } from "next/server";
import { addNotification } from "@/lib/notifications";
import { pusherServer } from "@/lib/pusher"; // ✅ ADD

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const event = payload.type ?? "unknown";

    console.log("[GHL Webhook]", event, payload);

    let message = "";

    switch (event) {
      case "ContactCreate":
        message = "👤 New contact created";
        break;

      case "ContactUpdate":
        message = "✏️ Contact updated";
        break;

      case "OpportunityCreate":
        message = "💼 New opportunity created";
        break;

      case "OpportunityStageUpdate":
        message = "📊 Opportunity stage changed";
        break;

      default:
        message = `📩 Event: ${event}`;
        break;
    }

    // ✅ SAVE (your existing)
    addNotification(message);

    // 🚀 🚀 🚀 CRITICAL PART
    await pusherServer.trigger("dashboard", "new-event", {
      id: Date.now().toString(),
      text: message,
      createdAt: Date.now(),
    });

        // ✅ KEEP YOUR EXISTING STRUCTURE (UNCHANGED)
    switch (event) {
      case "ContactCreate":
        break;

      case "OpportunityStageUpdate":
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