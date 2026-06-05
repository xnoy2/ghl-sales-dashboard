import { NextResponse } from "next/server";
import { updateOpportunityStage } from "@/lib/ghl";
import type { AccountType } from "@/lib/accounts";

export async function POST(req: Request) {
  try {
    const { opportunityId, stageId, account } = await req.json();

    if (!opportunityId || !stageId || !account) {
      return NextResponse.json(
        { error: "Missing opportunityId, stageId, or account" },
        { status: 400 }
      );
    }

    await updateOpportunityStage(opportunityId, stageId, account as AccountType);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("MOVE OPPORTUNITY ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
