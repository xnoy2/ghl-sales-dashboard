import { NextResponse } from "next/server";
import { getOpportunities } from "@/lib/ghl";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pipeline = searchParams.get("pipeline");

    const pipelineId =
      pipeline === "SALES"
        ? process.env.SALES_PIPELINE_ID
        : process.env.LEAD_PIPELINE_ID;

    const leads = await getOpportunities(pipelineId!);

    return NextResponse.json({ leads });
  } catch (err) {
    console.error("FETCH PIPELINE ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}