import { NextResponse } from "next/server";
import { updateOpportunityStage } from "@/lib/ghl";

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const { opportunityId, stageId, account } = body; // ✅ ADD account

    if (!opportunityId || !stageId) {
      return NextResponse.json(
        { error: "Missing opportunityId or stageId" },
        { status: 400 }
      );
    }

    if (!account) {
      return NextResponse.json(
        { error: "Missing account" },
        { status: 400 }
      );
    }

    await updateOpportunityStage(opportunityId, stageId, account); // ✅ NOW VALID

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("UPDATE STAGE ERROR:", err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}