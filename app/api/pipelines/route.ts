import { NextResponse } from "next/server";
import { getAllPipelines } from "@/lib/ghl";
import type { AccountType } from "@/lib/accounts";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const account = (searchParams.get("account") || "BCF") as AccountType;

  try {
    const pipelines = await getAllPipelines(account);
    return NextResponse.json({ pipelines });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
