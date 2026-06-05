/**
 * lib/ghl.ts
 * ─────────────────────────────────────────────────────────────
 * GHL API v2 — Private Integration Token auth
 * Base: https://services.leadconnectorhq.com
 * ─────────────────────────────────────────────────────────────
 */

import type {
  Lead, DashboardStats, ActivityItem,
  FollowUpAlert, TeamMember,
} from "@/types";
import { ACCOUNTS, type AccountType } from "@/lib/accounts";
// ─── Config ───────────────────────────────────────────────────

const BASE     = "https://services.leadconnectorhq.com";
const VERSION  = "2021-07-28";
const USE_MOCK = false; // force real API


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
// GET ALL PIPELINES — returns every pipeline for an account
// ─────────────────────────────────────────────────────────────
export async function getAllPipelines(
  account: AccountType = "BCF"
): Promise<{ id: string; name: string }[]> {
  const res = await fetch(
    `${BASE}/opportunities/pipelines?locationId=${ACCOUNTS[account].locationId}`,
    { headers: ghlHeaders(account), next: { revalidate: 60 } }
  );
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GHL getAllPipelines ${res.status}: ${txt}`);
  }
  const data = await res.json();
  return (data.pipelines ?? []).map((p: any) => ({ id: p.id, name: p.name }));
}

// ─────────────────────────────────────────────────────────────
// GET PIPELINE STAGES — dynamic from GHL
// ─────────────────────────────────────────────────────────────
export async function getPipelineStages(
  pipelineId: string,
  account: AccountType = "BCF"
): Promise<{ id: string; name: string; position: number }[]> {
  const res = await fetch(
    `${BASE}/opportunities/pipelines?locationId=${ACCOUNTS[account].locationId}`,
    { headers: ghlHeaders(account), next: { revalidate: 60 } }
  );
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GHL getPipelineStages ${res.status}: ${txt}`);
  }
  const data = await res.json();
  const pipeline = (data.pipelines ?? []).find((p: any) => p.id === pipelineId);
  const stages: any[] = pipeline?.stages ?? [];
  return stages.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
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

    stage: opp.pipelineStageId ?? "",
    stageId: opp.pipelineStageId ?? "",

    assignedToId: opp.assignedTo ?? "",
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

  const oppData = await oppRes.json();

  // Non-fatal: if the users endpoint fails, leads still load with "Unassigned"
  let userMap: Record<string, string> = {};
  if (userRes.ok) {
    const userData = await userRes.json();
    userMap = buildUserMap(userData.users || []);
  }

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

  const res = await fetch(`${BASE}/opportunities/`, {
    method: "POST",
    headers: ghlHeaders(account),
    body: JSON.stringify(body),
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

  // Non-fatal: return empty team if endpoint is unavailable
  if (!res.ok) return [];

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
  if (!pipelineId) throw new Error("pipelineId is required");

  const [opps, pipelineStages] = await Promise.all([
    getOpportunities(pipelineId, account),
    getPipelineStages(pipelineId, account),
  ]);

  const nameMap: Record<string, string> = {};
  for (const s of pipelineStages) nameMap[s.id] = s.name.toLowerCase();
  const n = (id: string) => nameMap[id] ?? "";

  const today = new Date().toDateString();
  const wonOpps = opps.filter(o => n(o.stage).includes("won") || n(o.stage).includes("complet"));

  return {
    newLeadsToday: opps.filter(o => new Date(o.lastActivity).toDateString() === today).length,
    contacted: opps.filter(o => n(o.stage).includes("warm")).length,
    quoted: opps.filter(o => n(o.stage).includes("quote")).length,
    followUps: opps.filter(o => n(o.stage).includes("no response") || n(o.stage).includes("retarget")).length,
    closedDeals: wonOpps.length,
    totalPipelineValue: opps.reduce((s, o) => s + o.value, 0),
    conversionRate: opps.length ? Math.round((wonOpps.length / opps.length) * 100) : 0,
  };
}

// ─────────────────────────────────────────────────────────────
// Activity feed  →  most recently updated opportunities
// ─────────────────────────────────────────────────────────────
export async function getActivity(
  pipelineId?: string,
  account: AccountType = "BCF"
): Promise<ActivityItem[]> {
  if (!pipelineId) return [];

  const [opps, pipelineStages] = await Promise.all([
    getOpportunities(pipelineId, account),
    getPipelineStages(pipelineId, account),
  ]);

  const nameMap: Record<string, string> = {};
  for (const s of pipelineStages) nameMap[s.id] = s.name.toLowerCase();
  const n = (id: string) => nameMap[id] ?? "";

  return opps
    .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
    .slice(0, 10)
    .map((o, i): ActivityItem => ({
      id:        `act_${i}`,
      type:
          n(o.stage).includes("won") || n(o.stage).includes("complet") ? "closed"
          : n(o.stage).includes("quote") ? "quoted"
          : n(o.stage).includes("no response") || n(o.stage).includes("retarget") ? "follow_up"
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
  if (!pipelineId) return [];

  const [opps, pipelineStages] = await Promise.all([
    getOpportunities(pipelineId, account),
    getPipelineStages(pipelineId, account),
  ]);

  const nameMap: Record<string, string> = {};
  for (const s of pipelineStages) nameMap[s.id] = s.name.toLowerCase();
  const n = (id: string) => nameMap[id] ?? "";

  return opps
    .filter(o => (n(o.stage).includes("no response") || n(o.stage).includes("retarget")) && o.daysInStage >= 1)
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
