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
import { ACCOUNTS, type AccountType } from "@/lib/accounts";
// ─── Config ───────────────────────────────────────────────────

const BASE     = "https://services.leadconnectorhq.com";
const VERSION  = "2021-07-28";
const USE_MOCK = false; // force real API

// ─── Pipeline Config ────────────────────────────────────────
const PIPELINES = {
  LEAD: process.env.LEAD_PIPELINE_ID!,
  SALES: process.env.SALES_PIPELINE_ID!,
};

function ghlHeaders(account: AccountType = "BCF"): HeadersInit {
  return {
    Authorization: `Bearer ${ACCOUNTS[account].apiKey}`,
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
  // =========================
  // 🔵 BCF - LEAD
  // =========================
  "539b32c9-c336-487c-860f-4c3e72bd592b": "new",
  "03640705-9f51-4fad-9960-64643455080c": "warm",
  "bdcc78fb-27e1-43ae-bbe3-846ce11f69d7": "quote",
  "07f004c2-171c-4b80-9a73-24a75bf89d82": "no_response",

  // =========================
  // 🟢 BCF - SALES
  // =========================
  "03a30a23-a157-4822-aac7-cec971b21894": "deposit",
  "27573f51-717e-4c31-bc8a-b7f790530f97": "install",
  "63432c43-59eb-4c8b-ab37-d4681cedfb9c": "scheduled",
  "cbc54bef-9196-47ac-b86f-2172508bdabc": "won",
  "90caa9cb-fbdf-4334-a906-a0e46acb67ae": "lost",

  // =========================
  // 🔵 BGR - LEAD ✅ NEW
  // =========================
  "e387947b-974e-4bda-a8bb-f09c1440b411": "new",
  "0d3f8b03-fec6-4645-968f-18a743d7e7ff": "warm",
  "7165ab92-e478-4c20-82e1-8a5d3d503e64": "quote",
  "7abd1803-1126-4781-a3a8-c9d57ba51e07": "no_response",

  // =========================
  // 🟢 BGR - SALES ✅ NEW
  // =========================
  "6ab097e7-5b51-4c05-8ca6-4a78abd36481": "deposit",
  "b4578cd5-a216-492a-b551-7a5507d88436": "install",
  "fc40247f-ed65-4027-a2b4-da9310c1a9c9": "scheduled",
  "1d1d27bb-55a4-468d-9adb-9575863d0d84": "won",
  "bc0b9333-b61a-4b95-aea3-24a2d3f0b439": "lost",
};

function mapStage(ghlStageId: string): StageId {
  if (!ghlStageId) return "new";
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
    contactId: opp.contactId,

    name: opp.contact?.name ?? opp.name ?? "Unknown",
    email: opp.contact?.email ?? "",
    phone: opp.contact?.phone ?? "",

    stage: mapStage(opp.pipelineStageId),   // UI label
    stageId: opp.pipelineStageId,           // ✅ REAL GHL ID

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
    contactId: c.id,

    name: c.contactName ?? c.name ?? "Unknown",
    email: c.email ?? "",
    phone: c.phone ?? "",

    stage: "new",
    stageId: "", // ✅ REQUIRED FIX

    assignedTo: c.assignedTo ?? "Unassigned",
    value: 0,
    lastActivity:
      c.dateUpdated ?? c.dateAdded ?? new Date().toISOString(),
    tags: c.tags ?? [],
    daysInStage: 0,
  };
}

export async function findOpportunityByContact(
  contactId: string,
  pipelineId: string,
  account: AccountType
) {
  const res = await fetch(
    `${BASE}/opportunities/search?contact_id=${contactId}&pipeline_id=${pipelineId}`,
    {
      headers: ghlHeaders(account),
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  return data?.opportunities?.[0] || null;
}
// ─────────────────────────────────────────────────────────────
// GET /opportunities/search
// ─────────────────────────────────────────────────────────────
export async function getOpportunities(
  pipelineId?: string,
  account: AccountType = "BCF"
): Promise<Lead[]> {

  if (!pipelineId) {
    throw new Error("pipelineId is required in getOpportunities()");
  }

  const params = new URLSearchParams({
    location_id: ACCOUNTS[account].locationId,
    pipeline_id: pipelineId,
    limit: "100",
  });

  const [oppRes, userRes] = await Promise.all([
    fetch(`${BASE}/opportunities/search?${params}`, {
      headers: ghlHeaders(account),
      next: { revalidate: 30 },
    }),
    fetch(`${BASE}/users/?locationId=${ACCOUNTS[account].locationId}`, {
    headers: ghlHeaders(account),
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
oppData.opportunities.forEach((o: any) => {
  console.log("STAGE DEBUG:", {
    name: o.name,
    stageId: o.pipelineStageId,
  });
});
  const userMap = buildUserMap(userData.users || []);
  console.log("RAW OPPS:", oppData.opportunities);
  
  return (oppData.opportunities ?? []).map((o: any) =>
    mapOpportunity(o, userMap)
  );
}

// ─────────────────────────────────────────────────────────────
// REST OF YOUR FILE (UNCHANGED)
// ─────────────────────────────────────────────────────────────

// KEEP EVERYTHING BELOW EXACTLY AS IS

export async function getLeads(
  account: AccountType = "BCF"
): Promise<Lead[]> {

  const res = await fetch(
    `${BASE}/contacts/?locationId=${ACCOUNTS[account].locationId}&limit=100`,
    { headers: ghlHeaders(account), next: { revalidate: 30 } }
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
export async function createContact(
  payload: {
    name: string;
    email: string;
    phone?: string;
    tags?: string[];
  },
  account: AccountType = "BCF"
): Promise<{ id: string }> {
  if (USE_MOCK) return { id: `mock_${Date.now()}` };

  const [firstName, ...rest] = payload.name.trim().split(" ");
  const lastName = rest.join(" ");

  const res = await fetch(`${BASE}/contacts/`, {
    method:  "POST",
    headers: ghlHeaders(account),
    body: JSON.stringify({
      firstName,
      lastName,
      email:      payload.email,
      phone:      payload.phone,
      tags:       payload.tags || [],
      locationId: ACCOUNTS[account].locationId,
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
export async function createOpportunity(
  payload: {
    contactId: string;
    name: string;
    stageId?: string;   // ✅ optional
    stage?: string;     // ✅ NEW (from frontend)
    pipelineId?: string;
    assignedTo?: string;
    value?: number;
  },
  account: AccountType = "BCF"
): Promise<{ id: string }> {
  if (USE_MOCK) return { id: `mock_opp_${Date.now()}` };

  // ✅ SUPPORT BOTH stageId and stage
  const finalStageId = payload.stageId || payload.stage;

  if (!finalStageId) {
    throw new Error("Missing stageId / stage");
  }

  if (!payload.pipelineId) {
    throw new Error("Missing pipelineId");
  }

  const body = {
    pipelineId: payload.pipelineId,
    locationId: ACCOUNTS[account].locationId,
    name: payload.name,
    pipelineStageId: finalStageId,
    contactId: payload.contactId,
    monetaryValue: payload.value ?? 0,
    status: "open",
    assignedTo: payload.assignedTo || undefined, 
  };

  console.log("CREATE OPPORTUNITY PAYLOAD:", body); // 🔥 debug

  const res = await fetch(`${BASE}/opportunities/`, {
    method: "POST",
    headers: ghlHeaders(account),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error("GHL ERROR RESPONSE:", txt);
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
  ghlStageId: string,
  account: AccountType = "BCF"
): Promise<void> {
  if (USE_MOCK) return;

  const res = await fetch(`${BASE}/opportunities/${opportunityId}`, {
    method: "PUT",
    headers: ghlHeaders(account),
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
export async function getTeam(
  account: AccountType = "BCF"
): Promise<TeamMember[]> {

  const res = await fetch(
    `${BASE}/users/?locationId=${ACCOUNTS[account].locationId}`,
    { headers: ghlHeaders(account), next: { revalidate: 300 } }
  );

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GHL getUsers ${res.status}: ${txt}`);
  }

  const data = await res.json();

  return (data.users ?? []).map((u: any): TeamMember => ({
    id: u.id,
    name: u.name ?? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
    initials: nameInitials(u.firstName, u.lastName),
    role: u.roles?.type === "admin" ? "admin" : "agent",
    deals: 0,
    target: 10,
    avatar: u.profilePhoto,
  }));
}

// ─────────────────────────────────────────────────────────────
// Dashboard stats  →  aggregated from opportunities
// ─────────────────────────────────────────────────────────────
export async function getDashboardStats(
  pipelineId?: string,
  account: AccountType = "BCF"
): Promise<DashboardStats> {

  const opps = await getOpportunities(pipelineId, account);// ✅ FIX
  const today = new Date().toDateString();

  return {
    newLeadsToday: opps.filter(
      o => new Date(o.lastActivity).toDateString() === today
    ).length,

    contacted: opps.filter(o => o.stage === "warm").length,
    quoted: opps.filter(o => o.stage === "quote").length,
    followUps: opps.filter(o => o.stage === "no_response").length,
    closedDeals: opps.filter(o => o.stage === "won").length,

    totalPipelineValue: opps.reduce((s, o) => s + o.value, 0),

    conversionRate: opps.length
      ? Math.round(
          (opps.filter(o => o.stage === "won").length / opps.length) * 100
        )
      : 0,
  };
}

// ─────────────────────────────────────────────────────────────
// Activity feed  →  most recently updated opportunities
// ─────────────────────────────────────────────────────────────
export async function getActivity(
  pipelineId?: string,
  account: AccountType = "BCF"
): Promise<ActivityItem[]> {

  const opps = await getOpportunities(pipelineId, account); // ✅
  return opps
    .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
    .slice(0, 10)
    .map((o, i): ActivityItem => ({
      id:        `act_${i}`,
      type:
          o.stage === "won" ? "closed"
          : o.stage === "quote" ? "quoted"
          : o.stage === "no_response" ? "follow_up"
          : "contacted",
      leadName:  o.name,
      actor:     o.assignedTo,
      timestamp: o.lastActivity,
    }));
}

// ─────────────────────────────────────────────────────────────
// Follow-up alerts  →  leads stuck in follow_up stage
// ─────────────────────────────────────────────────────────────
export async function getAlerts(
  pipelineId?: string,
  account: AccountType = "BCF"
): Promise<FollowUpAlert[]> {

  const opps = await getOpportunities(pipelineId, account); // ✅
  return opps
    .filter(o => o.stage === "no_response" && o.daysInStage >= 1)
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
