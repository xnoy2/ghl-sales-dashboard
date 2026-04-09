import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const account = searchParams.get("account") || "BCF";

  const apiKey =
    account === "BCF"
      ? process.env.GHL_API_KEY_BCF
      : process.env.GHL_API_KEY_BGR;

  const locationId =
    account === "BCF"
      ? process.env.GHL_LOCATION_ID_BCF
      : process.env.GHL_LOCATION_ID_BGR;

  try {
    // ✅ GET PIPELINES
    const pipelineRes = await fetch(
      `https://services.leadconnectorhq.com/opportunities/pipelines?locationId=${locationId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Version: "2021-07-28",
        },
      }
    );

    const pipelineData = await pipelineRes.json();

    return NextResponse.json({
      account,
      locationId,
      pipelines: pipelineData.pipelines || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}