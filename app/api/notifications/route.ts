import { NextResponse } from "next/server";
import { getNotifications, clearNotifications } from "@/lib/notifications";

export async function GET() {
  return NextResponse.json(getNotifications());
}

export async function DELETE() {
  clearNotifications();
  return NextResponse.json({ cleared: true });
}
