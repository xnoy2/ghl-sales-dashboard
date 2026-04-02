/**
 * lib/ghl.ts
 * ─────────────────────────────────────────────────────────────
 * GHL API v2 — Private Integration Token auth
 * Base: https://services.leadconnectorhq.com
 * ─────────────────────────────────────────────────────────────
 */

import type {
  Lead, StageId, DashboardStats, ActivityItem,
  FollowUpAlert, TeamMember,
} from "@/types";
import {
  mockLeads, mockStats, mockActivity, mockAlerts, mockTeam,
} from "@/lib/mock-data";

// ─── Config ───────────────────────────────────────────────────

const BASE     = "https://services.leadconnectorhq.com";
const VERSION  = "2021-07-28";
const USE_MOCK = !process.env.GHL_API_KEY;

function ghlHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    "Content-Type": "application/json",
    Version: VERSION,
  };
}

// ─── Helper: Build User Map (ID → Name) ───────────────────────
function buildUserMap(users: any[]) {
  const map: Record<string, string> = {};

  for (const u of users) {
    map[u.id] =
      u.name ||
      `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() ||
      u.email ||
      "Unknown";
  }

  return map;
}

// ─────────────────────────────────────────────────────────────
// STAGE MAP
// ─────────────────────────────────────────────────────────────

const STAGE_MAP: Record<string, StageId> = {
  "f80d138a-40fc-4b20-82cf-64c633f6a9a0": "new",
  "1dd55e97-97c8-4370-bb36-4c9d7cd69032": "contacted",
  "01f8a6c6-6221-4ce5-b252-44195118c895": "quoted",
  "29ce6ae3-2164-4510-b96e-c76216c34813": "follow_up",
  "f4c24408-dba0-4e7e-8094-2b32171789c9": "closed",
};

function mapStage(ghlStageId: string): StageId {
  return STAGE_MAP[ghlStageId] ?? "new";
}

function daysSince(iso?: string): number {
  if (!iso) return 0;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function nameInitials(first = "", last = ""): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

// ─── Map GHL opportunity → Lead type ─────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOpportunity(opp: any, userMap: Record<string, string>): Lead {
  return {
    id: opp.id,
    name: opp.contact?.name ?? opp.name ?? "Unknown",
    email: opp.contact?.email ?? "",
    phone: opp.contact?.phone ?? "",
    stage: mapStage(opp.pipelineStageId),

    // ✅ FIX: Convert ID → Name
    assignedTo:
      userMap[opp.assignedTo] ||
      opp.assignedTo?.name ||
      "Unassigned",

    value: opp.monetaryValue ?? 0,
    lastActivity: opp.updatedAt ?? opp.createdAt ?? new Date().toISOString(),
    tags: opp.contact?.tags ?? [],
    daysInStage: daysSince(opp.stageChangedAt ?? opp.updatedAt),
  };
}

// ─── Map GHL contact → Lead type ─────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapContact(c: any): Lead {
  return {
    id: c.id,
    name: c.contactName ?? c.name ?? "Unknown",
    email: c.email ?? "",
    phone: c.phone ?? "",
    stage: "new",
    assignedTo: c.assignedTo ?? "Unassigned",
    value: 0,
    lastActivity: c.dateUpdated ?? c.dateAdded ?? new Date().toISOString(),
    tags: c.tags ?? [],
    daysInStage: 0,
  };
}

// ─────────────────────────────────────────────────────────────
// GET /opportunities/search
// ─────────────────────────────────────────────────────────────
export async function getOpportunities(): Promise<Lead[]> {
  if (USE_MOCK) return mockLeads;

  const params = new URLSearchParams({
    location_id: process.env.GHL_LOCATION_ID!,
    pipeline_id: process.env.GHL_PIPELINE_ID!,
    limit: "100",
  });

  // ✅ Fetch opportunities + users
  const [oppRes, userRes] = await Promise.all([
    fetch(`${BASE}/opportunities/search?${params}`, {
      headers: ghlHeaders(),
      next: { revalidate: 30 },
    }),
    fetch(`${BASE}/users/?locationId=${process.env.GHL_LOCATION_ID}`, {
      headers: ghlHeaders(),
    }),
  ]);

  if (!oppRes.ok) {
    const txt = await oppRes.text();
    throw new Error(`GHL getOpportunities ${oppRes.status}: ${txt}`);
  }

  if (!userRes.ok) {
    const txt = await userRes.text();
    throw new Error(`GHL getUsers ${userRes.status}: ${txt}`);
  }

  const oppData = await oppRes.json();
  const userData = await userRes.json();

  const userMap = buildUserMap(userData.users || []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (oppData.opportunities ?? []).map((o: any) =>
    mapOpportunity(o, userMap)
  );
}

// ─────────────────────────────────────────────────────────────
// REST OF YOUR FILE (UNCHANGED)
// ─────────────────────────────────────────────────────────────

// KEEP EVERYTHING BELOW EXACTLY AS IS

export async function getLeads(): Promise<Lead[]> {
  if (USE_MOCK) return mockLeads;

  const res = await fetch(
    `${BASE}/contacts/?locationId=${process.env.GHL_LOCATION_ID}&limit=100`,
    { headers: ghlHeaders(), next: { revalidate: 30 } }
  );
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GHL getContacts ${res.status}: ${txt}`);
  }

  const data = await res.json();
  return (data.contacts ?? []).map((c: any) => mapContact(c));
}

// (rest unchanged…)
// ─────────────────────────────────────────────────────────────
// POST /contacts/  →  create a new contact
// ─────────────────────────────────────────────────────────────
export async function createContact(payload: {
  name: string; email: string; phone: string;
}): Promise<{ id: string }> {
  if (USE_MOCK) return { id: `mock_${Date.now()}` };

  const [firstName, ...rest] = payload.name.trim().split(" ");
  const lastName = rest.join(" ");

  const res = await fetch(`${BASE}/contacts/`, {
    method:  "POST",
    headers: ghlHeaders(),
    body: JSON.stringify({
      firstName,
      lastName,
      email:      payload.email,
      phone:      payload.phone,
      locationId: process.env.GHL_LOCATION_ID,
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GHL createContact ${res.status}: ${txt}`);
  }
  const data = await res.json();
  return { id: data.contact?.id ?? data.id };
}

// ─────────────────────────────────────────────────────────────
// POST /opportunities/  →  create opportunity in pipeline
// ─────────────────────────────────────────────────────────────
export async function createOpportunity(payload: {
  contactId: string;
  name:      string;
  stageId:   string;
  value?:    number;
}): Promise<{ id: string }> {
  if (USE_MOCK) return { id: `mock_opp_${Date.now()}` };

  const res = await fetch(`${BASE}/opportunities/`, {
    method:  "POST",
    headers: ghlHeaders(),
    body: JSON.stringify({
      pipelineId:      process.env.GHL_PIPELINE_ID,
      locationId:      process.env.GHL_LOCATION_ID,
      name:            payload.name,
      pipelineStageId: payload.stageId,
      contactId:       payload.contactId,
      monetaryValue:   payload.value ?? 0,
      status:          "open",
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GHL createOpportunity ${res.status}: ${txt}`);
  }
  const data = await res.json();
  return { id: data.opportunity?.id ?? data.id };
}

// ─────────────────────────────────────────────────────────────
// PUT /opportunities/:id  →  move to different stage
// ─────────────────────────────────────────────────────────────
export async function updateOpportunityStage(
  opportunityId: string,
  ghlStageId:    string
): Promise<void> {
  if (USE_MOCK) return;

  const res = await fetch(`${BASE}/opportunities/${opportunityId}`, {
    method:  "PUT",
    headers: ghlHeaders(),
    body: JSON.stringify({ pipelineStageId: ghlStageId }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GHL updateStage ${res.status}: ${txt}`);
  }
}

// ─────────────────────────────────────────────────────────────
// GET /users/  →  team members
// ─────────────────────────────────────────────────────────────
export async function getTeam(): Promise<TeamMember[]> {
  if (USE_MOCK) return mockTeam;

  const res = await fetch(
    `${BASE}/users/?locationId=${process.env.GHL_LOCATION_ID}`,
    { headers: ghlHeaders(), next: { revalidate: 300 } }
  );
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GHL getUsers ${res.status}: ${txt}`);
  }
  const data = await res.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.users ?? []).map((u: any): TeamMember => ({
    id:       u.id,
    name:     u.name ?? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
    initials: nameInitials(u.firstName, u.lastName),
    role:     u.roles?.type === "admin" ? "admin" : "agent",
    deals:    0,
    target:   10,
    avatar:   u.profilePhoto,
  }));
}

// ─────────────────────────────────────────────────────────────
// Dashboard stats  →  aggregated from opportunities
// ─────────────────────────────────────────────────────────────
export async function getDashboardStats(): Promise<DashboardStats> {
  if (USE_MOCK) return mockStats;

  const opps  = await getOpportunities();
  const today = new Date().toDateString();

  return {
    newLeadsToday:      opps.filter(o => new Date(o.lastActivity).toDateString() === today).length,
    contacted:          opps.filter(o => o.stage === "contacted").length,
    quoted:             opps.filter(o => o.stage === "quoted").length,
    followUps:          opps.filter(o => o.stage === "follow_up").length,
    closedDeals:        opps.filter(o => o.stage === "closed").length,
    totalPipelineValue: opps.reduce((s, o) => s + o.value, 0),
    conversionRate:     opps.length
      ? Math.round((opps.filter(o => o.stage === "closed").length / opps.length) * 100)
      : 0,
  };
}

// ─────────────────────────────────────────────────────────────
// Activity feed  →  most recently updated opportunities
// ─────────────────────────────────────────────────────────────
export async function getActivity(): Promise<ActivityItem[]> {
  if (USE_MOCK) return mockActivity;

  const opps = await getOpportunities();
  return opps
    .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
    .slice(0, 10)
    .map((o, i): ActivityItem => ({
      id:        `act_${i}`,
      type:      o.stage === "closed"    ? "closed"
               : o.stage === "quoted"    ? "quoted"
               : o.stage === "follow_up" ? "follow_up"
               : "contacted",
      leadName:  o.name,
      actor:     o.assignedTo,
      timestamp: o.lastActivity,
    }));
}

// ─────────────────────────────────────────────────────────────
// Follow-up alerts  →  leads stuck in follow_up stage
// ─────────────────────────────────────────────────────────────
export async function getAlerts(): Promise<FollowUpAlert[]> {
  if (USE_MOCK) return mockAlerts;

  const opps = await getOpportunities();
  return opps
    .filter(o => o.stage === "follow_up" && o.daysInStage >= 1)
    .sort((a, b) => b.daysInStage - a.daysInStage)
    .map((o, i): FollowUpAlert => ({
      id:          `alert_${i}`,
      leadId:      o.id,
      leadName:    o.name,
      message:     o.daysInStage >= 3
        ? `${o.daysInStage} days pending — no response`
        : "Needs follow-up",
      severity:    o.daysInStage >= 3 ? "critical" : o.daysInStage >= 2 ? "warning" : "info",
      daysOverdue: o.daysInStage,
    }));
}
