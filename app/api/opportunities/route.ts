import { NextResponse } from "next/server";
import { getOpportunities } from "@/lib/ghl";
import type { AccountType } from "@/lib/accounts";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pipelineId = searchParams.get("pipelineId");
    const account = (searchParams.get("account") || "BCF") as AccountType;

    if (!pipelineId) {
      return NextResponse.json({ error: "pipelineId is required" }, { status: 400 });
    }

    const leads = await getOpportunities(pipelineId, account);
    return NextResponse.json({ leads });
  } catch (err: any) {
    console.error("GET OPPORTUNITIES ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
