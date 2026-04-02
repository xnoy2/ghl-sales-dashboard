/**
 * app/api/ghl-setup/route.ts
 * ─────────────────────────────────────────────────────
 * Visit http://localhost:3000/api/ghl-setup
 * Returns all pipelines + stage IDs from your GHL account.
 * Use this to fill in STAGE_MAP in lib/ghl.ts
 * ─────────────────────────────────────────────────────
 * DELETE this file or add auth before deploying to production.
 */
export const runtime = "nodejs";  
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET() {
  const API_KEY     = process.env.GHL_API_KEY;
  const LOCATION_ID = process.env.GHL_LOCATION_ID;
  const PIPELINE_ID = process.env.GHL_PIPELINE_ID;

  // ── Check env vars are loaded ──────────────────────
  if (!API_KEY || !LOCATION_ID) {
    return NextResponse.json({
      error: "Missing credentials",
      fix:   "Make sure GHL_API_KEY and GHL_LOCATION_ID are in .env.local, then RESTART the dev server (Ctrl+C → npm run dev)",
      found: {
        GHL_API_KEY:     API_KEY     ? "✓ set" : "✗ missing",
        GHL_LOCATION_ID: LOCATION_ID ? "✓ set" : "✗ missing",
        GHL_PIPELINE_ID: PIPELINE_ID ? "✓ set" : "✗ missing",
      },
    }, { status: 400 });
  }

  // ── Fetch pipelines from GHL v2 API ───────────────
  let raw;
  try {
    const res = await fetch(
      `https://services.leadconnectorhq.com/opportunities/pipelines?locationId=${LOCATION_ID}`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          Version:        "2021-07-28",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json({
        error:      `GHL API returned ${res.status}`,
        body,
        fix:        res.status === 401
          ? "Your GHL_API_KEY is invalid or expired. Generate a new Private Integration Token in GHL → Settings → Private Integrations."
          : res.status === 403
          ? "Your token doesn't have the 'opportunities.readonly' scope. Edit the Private Integration in GHL and add that scope."
          : "Check the body field above for details.",
      }, { status: res.status });
    }

    raw = await res.json();
  } catch (err) {
    return NextResponse.json({
      error: "Network error reaching GHL API",
      detail: String(err),
    }, { status: 500 });
  }

  // ── Format response — easy to read + copy ─────────
  const pipelines = (raw.pipelines ?? []).map((p: any) => ({
    pipeline_name: p.name,
    pipeline_id:   p.id,
    stages: (p.stages ?? []).map((s: any) => ({
      stage_name: s.name,
      stage_id:   s.id,
    })),
  }));

  // Build a ready-to-paste STAGE_MAP for lib/ghl.ts
  const stageMapHint: Record<string, string> = {};
  const targetPipeline = pipelines.find((p: any) => p.pipeline_id === PIPELINE_ID) ?? pipelines[0];
  if (targetPipeline) {
    for (const s of targetPipeline.stages) {
      stageMapHint[s.stage_id] = "← replace right side with: new | contacted | quoted | follow_up | closed";
    }
  }

  return NextResponse.json({
    status:         "✓ GHL credentials are working",
    location_id:    LOCATION_ID,
    pipeline_id:    PIPELINE_ID ?? "(not set yet)",
    env_check: {
      GHL_API_KEY:     "✓ set",
      GHL_LOCATION_ID: "✓ set",
      GHL_PIPELINE_ID: PIPELINE_ID ? "✓ set" : "✗ not set — copy pipeline_id below into .env.local",
    },
    pipelines,
    paste_into_STAGE_MAP: stageMapHint,
    instructions: [
      "1. Find your pipeline in the 'pipelines' array above",
      "2. Copy each stage_id from its 'stages' list",
      "3. Open lib/ghl.ts and find STAGE_MAP",
      "4. Replace the placeholder keys with your real stage_id values",
      "5. Set the right-side value to match the column: new | contacted | quoted | follow_up | closed",
    ],
  });
}
