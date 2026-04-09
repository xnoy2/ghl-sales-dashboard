import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { leadId, stage } = await req.json();

  await fetch(
    `https://services.leadconnectorhq.com/opportunities/${leadId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.GHL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pipelineStageId: stage,
      }),
    }
  );

  return NextResponse.json({ success: true });
}